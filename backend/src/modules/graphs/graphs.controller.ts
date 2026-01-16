import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { type Response } from 'express';
import { GraphService } from './services/graphs.service';
import { CreateGraphDto } from './dtos/create-graph.dto';
import { UpdateGraphDto } from './dtos/update-graph.dto';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { SuccessResponse } from '@/shared/response/success.response';
import { PagingResponse } from '@/shared/response/paging.response';
import { UpdateMetadata } from './dtos/update-metadata.dto';
import { StreamEvent } from './contracts/stream.contract';

@Controller('graphs')
@UseGuards(JwtAuthGuard)
export class GraphController {
  private readonly logger = new Logger(GraphController.name);

  constructor(private readonly graphService: GraphService) {}

  @Post()
  async createGraph(
    @Req() req: any,
    @Body() dto: CreateGraphDto,
  ): Promise<SuccessResponse> {
    const userId = req.user.sub;
    return this.graphService.createGraph(userId, dto);
  }

  @Patch(':id/update-metadata')
  async updateGraphMetadata(
    @Req() req: any,
    @Param('id') graphId: string,
    @Body() dto: UpdateMetadata,
  ): Promise<SuccessResponse> {
    const userId = req.user.sub;
    return this.graphService.updateGraphMetadata(graphId, userId, dto);
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

  @Post(':id/run/stream')
  async runGraphStream(
    @Req() req: any,
    @Param('id') graphId: string,
    @Body('input') input: string,
    @Res() res: Response,
  ) {
    const userId = req.user.sub;

    const graph = await this.graphService.getGraphRaw(
      graphId,
      userId,
    );

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await this.graphService.streamRun(graph, input, userId);

    try {
      for await (const event of stream) {
      const [nodeType, nodeData] = Object.entries(event)[0];

      const standardizedEvent: StreamEvent = {
        nodeType,
        input: (nodeData as any).input,
        output: (nodeData as any).output,
        ok: (nodeData as any).ok,
        retryCount: (nodeData as any).retryCount,
        meta: (nodeData as any).meta,
      };

      res.write(`data: ${JSON.stringify(standardizedEvent)}\n\n`);
      this.logger.log(`event:: ${JSON.stringify(standardizedEvent)}`);
    }


      res.write(`event: end\ndata: done\n\n`);
      res.end();
    } catch (err) {
      res.write(
        `event: error\ndata: ${JSON.stringify({
          message: err.message,
        })}\n\n`,
      );
      res.end();
    }
  }
}
