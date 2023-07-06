import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './interfaces/user.interface';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  async register(@Body() body: User) {
    this.usersService.create(body);
    return 'User createdeee';
  }

  @Get(':email')
  async findUser(@Param('email') email: string): Promise<User | undefined> {
    return this.usersService.find(email);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }
}
