import { Injectable, ConflictException } from '@nestjs/common/';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { CreateUserDto } from './dto/createUser.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
  ) {}

  async create(newUserData: CreateUserDto) {
    if (await this.userModel.findOne({ email: newUserData.email })) {
      throw new ConflictException({
        field: 'email',
        reason: 'E-mail already in use',
      });
    }

    if (await this.userModel.findOne({ username: newUserData.username })) {
      throw new ConflictException({
        field: 'username',
        reason: 'Username already in use',
      });
    }

    const saltRounds = this.configService.get('bcrypt.saltRounds');

    newUserData.password = await bcrypt.hash(newUserData.password, saltRounds);
    const newUser = new this.userModel(newUserData);
    return newUser.save();
  }
}
