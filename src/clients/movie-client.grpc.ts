import {
	GetMovieRequest,
	MovieServiceClient
} from '@choncinema/contracts/gen/ts/movie'
import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'

@Injectable()
export class MovieClientGrpc implements OnModuleInit {
	private movieService: MovieServiceClient

	public constructor(
		@Inject('MOVIE_PACKAGE') private readonly client: ClientGrpc
	) {}

	public onModuleInit() {
		this.movieService =
			this.client.getService<MovieServiceClient>('MovieService')
	}

	public getById(data: GetMovieRequest) {
		return this.movieService.getMovie(data)
	}
}
