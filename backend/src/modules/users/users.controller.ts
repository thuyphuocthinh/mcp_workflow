import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly authService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return this.authService.me(req.user.sub);
  }
}
