import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/createUser.dto';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const userMocks: { [key: string]: CreateUserDto } = {
  newUser: {
    email: 'test@test.com',
    password: '12345678',
    displayName: 'Test',
    username: 'test',
  },
  user: {
    email: 'test2@gmail.com',
    username: 'test2',
    password: 'password',
    displayName: 'Test2',
  },
  sameUsername: {
    email: 'test23@gmail.com',
    username: 'test2',
    password: 'password2',
    displayName: 'Test2',
  },
};

describe('AuthService', () => {
  let authService: AuthService;
  let userModel: DeepMocked<Model<User>>;
  let configService: DeepMocked<ConfigService>;
  let jwtService: DeepMocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: createMock<Model<User>>(),
        },
      ],
    })
      .useMocker(createMock)
      .compile();

    authService = module.get(AuthService);
    userModel = module.get(getModelToken(User.name));
    configService = module.get(ConfigService);
    jwtService = module.get(JwtService);

    // Mock config service to get testing values
    configService.get.mockImplementation((key: string) => {
      switch (key) {
        case 'bcrypt.saltRounds':
          return 10;
        default:
          return null;
      }
    });

    // Mock findOne from mongoose
    userModel.findOne.mockImplementation((query) => {
      const user = userMocks.user;
      if (query?.email == user.email || query?.username == user.username) {
        return user as any;
      } else return null;
    });

    // Mocking create function
    userModel.create.mockImplementation((data: CreateUserDto) => {
      return { ...data, save: jest.fn() } as any;
    });

    // Always return 'jwt token' on sign
    jwtService.signAsync.mockResolvedValue('');

    // Mock compare for bcrypt
    jest
      .spyOn(bcrypt, 'compare')
      .mockImplementationOnce((loginPass, pass) => loginPass == pass);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('create', () => {
    it('Should create a new user', async () => {
      const response = await authService.create(userMocks.newUser);
      expect(response.username).toBe(userMocks.newUser.username);
    });

    it('Should throw ConflictException [EMAIL]', async () => {
      const createUser = authService.create(userMocks.user);
      await expect(createUser).rejects.toBeInstanceOf(ConflictException);
    });

    it('Should throw ConflictException [Username]', async () => {
      const createUser = authService.create(userMocks.sameUsername);
      await expect(createUser).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('Should login user [USERNAME]', async () => {
      const user = userMocks.user;
      const response = await authService.login({
        username: user.username,
        password: user.password,
      });

      expect(response.access_token).toBeDefined();
    });

    it('Should login user [EMAIL]', async () => {
      const user = userMocks.user;
      const response = await authService.login({
        email: user.email,
        password: user.password,
      });

      expect(response.access_token).toBeDefined();
    });

    it('Should throw NotFoundException', async () => {
      const user = userMocks.newUser;
      const loginUser = authService.login({
        email: user.email,
        password: user.password,
      });

      await expect(loginUser).rejects.toBeInstanceOf(NotFoundException);
    });

    it('Should throw UnauthorizedException', async () => {
      const user = userMocks.user;
      const loginUser = authService.login({
        email: user.email,
        password: 'wrong password',
      });
      await expect(loginUser).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
