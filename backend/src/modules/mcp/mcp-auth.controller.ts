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
  InternalServerErrorException,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { AuthorizeToolDto } from './dtos/authorize-tool.dto';
import { GoogleAuthGuard } from './strategy/google.auth';
import { Logger } from '@nestjs/common';

@Controller('tool-auth')
export class UserToolAuthController {
  private readonly logger = new Logger(UserToolAuthController.name);

  constructor(
    private readonly userToolAuthService: UserToolAuthService,
  ) {}

  @Get('google')
  @UseGuards(JwtAuthGuard, GoogleAuthGuard)
  async googleLogin() {
    // passport tự redirect → không cần code gì ở đây
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: any, @Res() res: any) {
    try {
      const {
        providerKey,
        accessToken,
        refreshToken,
        profile,
      } = req.user;

      this.logger.log(`User ${req.user.id} authorized tool ${providerKey}`);

      await this.userToolAuthService.authorize({
        userId: req.user.id,
        toolKey: providerKey,
        provider: 'google',
        token: {
          access_token: accessToken,
          refresh_token: refreshToken,
          token_type: 'Bearer',
        },
        raw: {
          profile,
        },
      });

      res.redirect(`${process.env.FE_URL}/tools?authorized=${providerKey}`);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException("Failed to authorize tool");
    }
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
