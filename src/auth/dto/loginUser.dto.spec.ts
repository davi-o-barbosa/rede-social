import { validate } from 'class-validator';
import { LoginUserDto } from './loginUser.dto';

describe('login DTO validation', () => {
  it('should accept a valid object [EMAIL]', async () => {
    const userLogin = new LoginUserDto();
    userLogin.email = 'test@test.com';
    userLogin.password = '12345678';

    const result = await validate(userLogin);
    expect(result.length).toBe(0);
  });

  it('should accept a valid object [USERNAME]', async () => {
    const userLogin = new LoginUserDto();
    userLogin.username = 'test';
    userLogin.password = '12345678';

    const result = await validate(userLogin);
    expect(result.length).toBe(0);
  });

  it('should throw an error', async () => {
    const userLogin = new LoginUserDto();
    userLogin.password = '12345678';

    const result = await validate(userLogin);
    expect(result.length).toBe(1);
  });
});
