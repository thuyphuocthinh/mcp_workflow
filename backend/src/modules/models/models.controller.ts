import { ModelKeyDto } from './dtos/modelKey.dto';
import { ModelKeyService } from './services/modelKey.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';

@Controller('model-keys')
@UseGuards(JwtAuthGuard)
export class ModelKeyController {
  constructor(
    private readonly modelKeyService: ModelKeyService,
  ) {}

  /* =========================
     GET ALL KEYS
     GET /model-keys
     ========================= */
  @Get()
  async getAll(@Req() req: any,) {
    const userId = req.user.sub;
    return this.modelKeyService.getAll(userId);
  }

  /* =========================
     UPSERT KEY BY MODEL TYPE
     PUT /model-keys
     ========================= */
  @Put()
  async upsert(@Req() req: any, @Body() dto: ModelKeyDto) {
    const userId = req.user.sub;
    return this.modelKeyService.upsertByType(userId, dto);
  }

  /* =========================
     UPDATE KEY BY MODEL TYPE
     PATCH /model-keys/:modelType
     ========================= */
  @Patch(':modelType')
  async updateByType(
    @Req() req: any,
    @Param('modelType') modelType: string,
    @Body('key') key: string,
  ) {
    const userId = req.user.sub;
    return this.modelKeyService.updateByType(
      userId,
      modelType,
      key,
    );
  }

  /* =========================
     DELETE KEY BY MODEL TYPE
     DELETE /model-keys/:modelType
     ========================= */
  @Delete(":modelType")
  async deleteByType(
    @Req() req: any,
    @Param('modelType') modelType: string,
  ) {
    const userId = req.user.sub;
    return this.modelKeyService.deleteByType(userId, modelType);
  }
}
