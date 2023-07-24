import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';

const userMock: CreateUserDto = {
  username: 'test',
  email: 'test@test.com',
  displayName: 'Test',
  password: '12345678',
};

const userLoginMock: LoginUserDto = {
  username: userMock.username,
  password: userMock.password,
};

describe('AuthController', () => {
  let authController: AuthController;
  let authService: DeepMocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker(createMock)
      .compile();

    authController = module.get(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('register', () => {
    it('should call AuthService.create', async () => {
      await authController.register(userMock);
      expect(authService.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should call AuthService.login', async () => {
      await authController.login(userLoginMock);
      expect(authService.login).toHaveBeenCalled();
    });
  });
});
