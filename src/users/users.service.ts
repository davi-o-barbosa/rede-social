import { Injectable } from '@nestjs/common/';
import { User } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  private readonly users: User[] = [];

  create(user: User) {
    this.users.push(user);
  }

  find(email: string) {
    return this.users.find((u) => u.email == email);
  }

  findAll() {
    return this.users;
  }
}
