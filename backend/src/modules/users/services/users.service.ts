import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User, UserDocument } from '../schemas/users.schema';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { LoginContract } from '../contracts/login.contract';
import { ProfileContract } from '../contracts/profile.contract';
import { SuccessResponse } from '@/shared/response/success.response';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<SuccessResponse> {
    const exists = await this.userModel.findOne({ email: dto.email });
    if (exists) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.userModel.create({
      first_name: dto.first_name,
      last_name: dto.last_name,
      email: dto.email,
      password: hashedPassword,
    });

    return new SuccessResponse({message: "Registered Succesfully"});
  }

  async login(dto: LoginDto): Promise<SuccessResponse> {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.signToken(user);
    return new SuccessResponse({
      data: new LoginContract(token)
    });
  }

    async me(userId: string): Promise<SuccessResponse> {
        const user = await this.userModel
            .findById(userId)
            .select('-password');

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

      return new SuccessResponse({
        data: new ProfileContract(
            user._id.toString(),
            user.first_name,
            user.last_name,
            user.email,
        )
      });
    }


  private signToken(user: UserDocument): string {
    return this.jwtService.sign(
      {
        sub: user._id,
        email: user.email,
      },
      {
        expiresIn: '7d',
      },
    );
  }
}
