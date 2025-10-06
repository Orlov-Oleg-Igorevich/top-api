import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserDocument, UserModel } from './user.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthDto } from './dto/auth.dto';
import { genSalt, hash, compare } from 'bcryptjs';
import { USER_NOT_FOUND_ERROR, WRONG_PASSWORD_ERROR } from './auth.constans';
import { access } from 'fs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}
  async createUser(dto: AuthDto): Promise<UserDocument> {
    const salt = await genSalt(10);
    const passwordHash = await hash(dto.password, salt);
    return this.userModel.create({
      email: dto.email,
      passwordHash: passwordHash,
    });
  }
  async findUser(userEmail: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: userEmail }).exec();
  }

  async validate(email: string, password: string): Promise<Pick<UserDocument, 'email'>> {
    const user = await this.findUser(email);
    if (!user) {
      throw new UnauthorizedException(USER_NOT_FOUND_ERROR);
    }
    const passwordIsTrue = await compare(password, user.passwordHash);
    if (!passwordIsTrue) {
      throw new UnauthorizedException(WRONG_PASSWORD_ERROR);
    }
    return { email: user.email };
  }

  async login(email: string): Promise<{ accessToken: string }> {
    const payload = { email };
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}
