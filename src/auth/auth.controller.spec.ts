import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';

const userRegisterStub: CreateUserDto = {
  email: 'test@test.com',
  displayName: 'Test',
  username: 'test',
  password: '12345678',
};

const userLoginStub: LoginUserDto = {
  username: 'test',
  email: 'test@test.com',
  password: '12345678',
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

  describe('register', () => {
    it('it should call AuthService.create', async () => {
      const expectedValue = 'register';
      authService.create.mockResolvedValue(expectedValue);
      const register = authController.register(userRegisterStub);
      await expect(register).resolves.toBe('register');
    });
  });

  describe('login', () => {
    it('it should call AuthService.login', async () => {
      const expectedValue = 'login';
      authService.login.mockResolvedValue(expectedValue);
      const login = authController.login(userLoginStub);
      await expect(login).resolves.toBe('login');
    });
  });
});
