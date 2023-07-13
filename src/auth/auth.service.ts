import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common/';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { CreateUserDto } from './dto/createUser.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { LoginUserDto } from './dto/loginUser.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
    private jwtService: JwtService,
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
    await newUser.save();

    return await this.jwtService.signAsync({
      uuid: newUser._id,
      username: newUser.username,
    });
  }

  async login(loginData: LoginUserDto) {
    const user = await this.userModel.findOne(
      loginData.email
        ? { email: loginData.email }
        : { username: loginData.username },
    );

    if (!user) throw new NotFoundException();

    if (await bcrypt.compare(loginData.password, user.password)) {
      return await this.jwtService.signAsync({
        uuid: user._id,
        username: user.username,
      });
    } else {
      throw new UnauthorizedException();
    }
  }
}
