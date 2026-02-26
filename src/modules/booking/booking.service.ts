/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { RpcStatus } from '@choncinema/common'
import type {
	CancelBookingRequest,
	ConfirmBookingRequest,
	CreateReservationRequest,
	GetUserBookingsRequest,
	ListReservedSeatsRequest
} from '@choncinema/contracts/gen/ts/booking'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import QrCode from 'qrcode'
import { lastValueFrom } from 'rxjs'
import { HallClientGrpc } from 'src/clients/hall-client.grpc'
import { MovieClientGrpc } from 'src/clients/movie-client.grpc'
import { ScreeningClientGrpc } from 'src/clients/screening-client.grpc'
import { SeatClientGrpc } from 'src/clients/seat-client.grpc'
import { TheaterClientGrpc } from 'src/clients/theater-client.grpc'

import { BookingRepository } from './booking.repository'
import { OrderStatus } from './enums/order-status.enum'
import { Order } from './interfaces/order.interface'

@Injectable()
export class BookingService {
	public constructor(
		private readonly bookingRepository: BookingRepository,
		private readonly theaterClient: TheaterClientGrpc,
		private readonly hallClient: HallClientGrpc,
		private readonly seatClient: SeatClientGrpc,
		private readonly screeningClient: ScreeningClientGrpc,
		private readonly movieClient: MovieClientGrpc
	) {}

	public async getUserBookings(data: GetUserBookingsRequest) {
		const { userId } = data

		const orders = await this.bookingRepository.findUserPaidOrders(userId)

		if (!orders.length) return { bookings: [] }

		const context = this.createRequestContext()
		const bookings = this.enrichOrders(orders, context)

		return { bookings }
	}

	public async createReservation(data: CreateReservationRequest) {
		const { userId, seats, screeingId } = data

		const { screening } = await lastValueFrom(
			this.screeningClient.getById({ screeningId: screeingId })
		)

		if (!screening) {
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				message: 'Screening not found'
			})
		}

		const amount = seats.reduce((s, a) => s + a.price, 0)

		const order = await this.bookingRepository.createOrder({
			user_id: userId,
			amount
		})

		const tickets = await Promise.all(
			seats.map(async s => {
				const existing =
					await this.bookingRepository.findExistingTicket(
						screeingId,
						s.seatId
					)
				if (existing) {
					throw new RpcException({
						code: RpcStatus.ALREADY_EXISTS,
						message: `Ticket for ${s.seatId} already exists`
					})
				}

				return await this.bookingRepository.createTicket({
					screening_id: screening.id,
					hall_id: screening.hall?.id ?? '',
					seat_id: s.seatId,
					price: s.price,
					order_id: order.id
				})
			})
		)

		return {
			orderId: order.id,
			ticketIds: tickets.map(t => t.id),
			amount
		}
	}

	public async confirmBooking(data: ConfirmBookingRequest) {
		const { bookingId } = data

		await this.bookingRepository.markOrderPaid(bookingId)

		const now = new Date()

		await this.bookingRepository.markTicketsPaid({
			order_id: bookingId,
			paid_at: now
		})

		const qrDataUrl = await QrCode.toDataURL(bookingId)
		await this.bookingRepository.updateOrderQr(bookingId, qrDataUrl)

		return { ok: true }
	}

	public async cancelBooking(data: CancelBookingRequest) {
		const { bookingId, userId } = data

		const order = await this.bookingRepository.findOrderById(bookingId)

		if (!order) {
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				message: 'Order not found'
			})
		}

		if (order.user_id !== userId) {
			throw new RpcException({
				code: RpcStatus.PERMISSION_DENIED,
				message: 'Permission denied'
			})
		}

		if (order.status === OrderStatus.CANCELLED) {
			return { ok: true }
		}

		if (order.status !== OrderStatus.PAID) {
			throw new RpcException({
				code: RpcStatus.FAILED_PRECONDITION,
				message: 'Order is not paid'
			})
		}

		await this.bookingRepository.cancelOrder(bookingId)
		await this.bookingRepository.deleteTicketsByOrderId(bookingId)

		return { ok: true }
	}

	public async listReservedSeats(data: ListReservedSeatsRequest) {
		const { hallId, screeningId } = data

		const reservedSeats = await this.bookingRepository.findReservedSeatIds(
			hallId,
			screeningId
		)

		return {
			reservedSeatIds: reservedSeats.map(s => s.seat_id)
		}
	}

	private createRequestContext() {
		return {
			theaters: new Map<string, any>(),
			halls: new Map<string, any>(),
			seats: new Map<string, any>(),
			screenings: new Map<string, any>(),
			movies: new Map<string, any>()
		}
	}

	private enrichOrders(
		orders: Order[],
		ctx: ReturnType<typeof this.createRequestContext>
	) {
		return Promise.all(
			orders.map(async order => {
				const ticket = order.tickets[0]
				if (!ticket) return null

				const screening = await this.getScreening(
					ticket.screening_id,
					ctx
				)

				if (!screening && screening) return null

				const [movie, hall, theater] = await Promise.all([
					this.getMovie(screening.movie.id, ctx),
					this.getHall(ticket.hall_id, ctx),
					this.getTheater(screening.theater.id, ctx)
				])

				const seats = await Promise.all(
					order.tickets.map(async ticket => {
						const seat = await this.getSeat(ticket.seat_id, ctx)
						return {
							id: ticket.seat_id,
							row: seat?.row ?? 0,
							number: seat?.number ?? 0
						}
					})
				)

				return {
					id: order.id,
					screeningDate: new Date(screening.startAt)
						.toISOString()
						.split('T')[0],
					screeningTime: new Date(
						screening.startAt
					).toLocaleTimeString('ru-RU', {
						hour: '2-digit',
						minute: '2-digit'
					}),
					movie,
					hall,
					theater,
					seats,
					qrCode: order?.qr_code ?? ''
				}
			})
		)
	}

	private async getScreening(id: string, context: any) {
		if (context.screenings.has(id)) {
			const { screening } = await lastValueFrom(
				this.screeningClient.getById({ screeningId: id })
			)
			context.screenings.set(id, screening)
		}

		return context.screenings.get(id)
	}

	private async getMovie(id: string, context: any) {
		if (!id) return null
		if (context.movies.has(id)) {
			const { movie } = await lastValueFrom(
				this.movieClient.getById({ id })
			)
			context.movies.set(id, movie)
		}

		return context.movies.get(id)
	}

	private async getHall(id: string, context: any) {
		if (context.halls.has(id)) {
			const { hall } = await lastValueFrom(
				this.hallClient.getById({ id })
			)
			context.halls.set(id, hall)
		}

		return context.halls.get(id)
	}

	private async getTheater(id: string, context: any) {
		if (!id) return null
		if (context.theaters.has(id)) {
			const { theater } = await lastValueFrom(
				this.theaterClient.getById(id)
			)
			context.theaters.set(id, theater)
		}

		return context.theaters.get(id)
	}

	private async getSeat(id: string, context: any) {
		if (context.seats.has(id)) {
			const { seat } = await lastValueFrom(
				this.seatClient.getById({ id })
			)
			context.seats.set(id, seat)
		}

		return context.seats.get(id)
	}
}
