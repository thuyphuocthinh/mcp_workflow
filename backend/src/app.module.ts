import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@/shared/database/database.module';
import { UsersModule } from './modules/users/users.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule
],
  controllers: [],
  providers: [],
})
export class AppModule {}
