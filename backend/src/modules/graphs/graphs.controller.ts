import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GraphService } from './services/graphs.service';
import { CreateGraphDto } from './dtos/create-graph.dto';
import { UpdateGraphDto } from './dtos/update-graph.dto';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { SuccessResponse } from '@/shared/response/success.response';
import { PagingResponse } from '@/shared/response/paging.response';

@Controller('graphs')
@UseGuards(JwtAuthGuard)
export class GraphController {
  constructor(private readonly graphService: GraphService) {}

  @Post()
  async createGraph(
    @Req() req: any,
    @Body() dto: CreateGraphDto,
  ): Promise<SuccessResponse> {
    const userId = req.user.sub;
    return this.graphService.createGraph(userId, dto);
  }

  @Patch(':id')
  async updateGraph(
    @Req() req: any,
    @Param('id') graphId: string,
    @Body() dto: UpdateGraphDto,
  ): Promise<SuccessResponse> {
    const userId = req.user.sub;
    return this.graphService.updateGraph(graphId, userId, dto);
  }

  @Get(':id')
  async getGraphDetail(
    @Req() req: any,
    @Param('id') graphId: string,
  ): Promise<SuccessResponse> {
    const userId = req.user.sub;
    return this.graphService.getGraphDetail(graphId, userId);
  }

  @Get()
  async getGraphs(
    @Req() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<PagingResponse> {
    const userId = req.user.sub;
    return this.graphService.getGraphsByUser(
      userId,
      Number(page),
      Number(limit),
    );
  }

}
