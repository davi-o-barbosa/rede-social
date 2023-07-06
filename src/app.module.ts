import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    UsersModule,
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/rede-social'),
  ],
})
export class AppModule {}
