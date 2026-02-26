import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { DatabaseModule } from './infra/database/database.module'
import { BookingModule } from './modules/booking/booking.module'

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		DatabaseModule,
		BookingModule
	]
})
export class AppModule {}
