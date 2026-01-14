import { UserToolAuthService } from './services/mcp-auth.service';
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
  Res,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { AuthorizeToolDto } from './dtos/authorize-tool.dto';
import { GoogleAuthGuard } from './strategy/google.auth';

@Controller('tool-auth')
export class UserToolAuthController {
  constructor(
    private readonly userToolAuthService: UserToolAuthService,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleLogin() {
    // passport tự redirect → không cần code gì ở đây
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: any, @Res() res: any) {
    const {
      providerKey,
      accessToken,
      refreshToken,
      profile,
    } = req.user;

    await this.userToolAuthService.authorize({
      userId: req.user.id,
      toolKey: providerKey,
      provider: 'google',
      token: accessToken,
      raw: {
        refreshToken,
        profile,
      },
    });

    res.redirect(`${process.env.FE_URL}/tools?authorized=${providerKey}`);
  }

  /* ================= AUTHORIZE ================= */
  @Post('authorize')
  @UseGuards(JwtAuthGuard)
  authorize(
    @Req() req: any,
    @Body() dto: AuthorizeToolDto,
  ) {
    return this.userToolAuthService.authorize({
      userId: req.user.id,
      toolKey: dto.toolKey,
      provider: dto.provider,
      token: dto.token,
      raw: dto.raw,
    });
  }

  /* ================= REVOKE ================= */
  @Post('revoke/:toolKey')
  @UseGuards(JwtAuthGuard)
  revoke(
    @Req() req,
    @Param('toolKey') toolKey: string,
  ) {
    return this.userToolAuthService.revoke({
      userId: req.user.id,
      toolKey,
    });
  }

  /* ================= GET AUTH (OPTIONAL) ================= */
  @Get(':toolKey')
  @UseGuards(JwtAuthGuard)
  getAuth(
    @Req() req,
    @Param('toolKey') toolKey: string,
  ) {
    return this.userToolAuthService.getAuth({
      userId: req.user.id,
      toolKey,
    });
  }

}
