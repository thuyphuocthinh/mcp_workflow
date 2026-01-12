import { UserToolAuthService } from './services/mcp-auth.service';
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { AuthorizeToolDto } from './dtos/authorize-tool.dto';

@Controller('tool-auth')
@UseGuards(JwtAuthGuard)
export class UserToolAuthController {
  constructor(
    private readonly userToolAuthService: UserToolAuthService,
  ) {}

  /* ================= AUTHORIZE ================= */
  @Post('authorize')
  authorize(
    @Req() req,
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
