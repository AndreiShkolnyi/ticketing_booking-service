import type {
	CancelBookingRequest,
	ConfirmBookingRequest,
	CreateReservationRequest,
	GetUserBookingsRequest,
	ListReservedSeatsRequest
} from '@choncinema/contracts/gen/ts/booking'
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'

import { BookingService } from './booking.service'

@Controller()
export class BookingController {
	public constructor(private readonly bookingService: BookingService) {}

	@GrpcMethod('BookingService', 'GetUserBookings')
	public getUserBookings(data: GetUserBookingsRequest) {
		return this.bookingService.getUserBookings(data)
	}

	@GrpcMethod('BookingService', 'CreateReservation')
	public createReservation(data: CreateReservationRequest) {
		return this.bookingService.createReservation(data)
	}

	@GrpcMethod('BookingService', 'ConfirmBooking')
	public confirmBooking(data: ConfirmBookingRequest) {
		return this.bookingService.confirmBooking(data)
	}

	@GrpcMethod('BookingService', 'CancelBooking')
	public bookTicket(data: CancelBookingRequest) {
		return this.bookingService.cancelBooking(data)
	}

	@GrpcMethod('BookingService', 'ListReservedSeats')
	public listReservedSeats(data: ListReservedSeatsRequest) {
		return this.bookingService.listReservedSeats(data)
	}
}
