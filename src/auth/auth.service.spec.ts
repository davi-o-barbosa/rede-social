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

const jwtResponse = 'jwt token';

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

    // Always return 'jwt token' on sign
    jwtService.signAsync.mockResolvedValue(jwtResponse);

    // Mock compare for bcrypt
    jest
      .spyOn(bcrypt, 'compare')
      .mockImplementationOnce((loginPass, pass) => loginPass == pass);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUser = authService.create(userMocks.newUser);
      await expect(createUser).resolves.toBe(jwtResponse);
    });

    it('should throw a conflict exception - email', async () => {
      const createUser = authService.create(userMocks.user);
      await expect(createUser).rejects.toBeInstanceOf(ConflictException);
    });

    it('should throw a conflict exception - username', async () => {
      const createUser = authService.create(userMocks.sameUsername);
      await expect(createUser).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('should login user - username', async () => {
      const user = userMocks.user;
      const loginUser = authService.login({
        username: user.username,
        password: user.password,
      });
      await expect(loginUser).resolves.toBe(jwtResponse);
    });

    it('should login user - email', async () => {
      const user = userMocks.user;
      const loginUser = authService.login({
        email: user.email,
        password: user.password,
      });
      await expect(loginUser).resolves.toBe(jwtResponse);
    });

    it('should throw not found', async () => {
      const user = userMocks.newUser;
      const loginUser = authService.login({
        email: user.email,
        password: user.password,
      });
      await expect(loginUser).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw unauthorized', async () => {
      const user = userMocks.user;
      const loginUser = authService.login({
        email: user.email,
        password: 'wrong password',
      });
      await expect(loginUser).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
