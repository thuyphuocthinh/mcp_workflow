import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';

import { McpService } from './services/mcp.service';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';

import { CreateMcpToolDto } from './dtos/create-mcp.dto';
import { UpdateMcpToolDto } from './dtos/update-mcp.dto';

@Controller('tools')
@UseGuards(JwtAuthGuard)
export class McpController {
  constructor(private readonly mcpService: McpService) {}

  /* ================= GET ALL ================= */
  @Get()
  getAll(@Req() req: any,) {
    const userId = req.user.sub;
    return this.mcpService.getAll(userId);
  }

  /* ================= CREATE ================= */
  @Post()
  create(
    @Body() dto: CreateMcpToolDto,
  ) {
    return this.mcpService.add(dto);
  }

  /* ================= UPDATE ================= */
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMcpToolDto,
  ) {
    return this.mcpService.update(id, dto);
  }

  /* ================= DELETE ================= */
  @Delete(':id')
  delete(
    @Param('id') id: string,
  ) {
    return this.mcpService.delete(id);
  }
}
