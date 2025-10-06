import { BadRequestException, Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { ALREADY_REGISTERED_ERROR } from './auth.constans';
import { UserDocument } from './user.model';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: AuthService) {}
  @Post('register')
  async register(@Body() dto: AuthDto): Promise<UserDocument> {
    const oldUser = await this.userService.findUser(dto.email);
    if (oldUser) {
      throw new BadRequestException(ALREADY_REGISTERED_ERROR);
    }
    return this.userService.createUser(dto);
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() { email, password }: AuthDto): Promise<{ accessToken: string }> {
    const res = await this.userService.validate(email, password);
    return this.userService.login(res.email);
  }
}
