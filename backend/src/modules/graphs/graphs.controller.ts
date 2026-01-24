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
import { type Request, type Response } from 'express';

import { GraphService } from './services/graphs.service';
import { CreateGraphDto } from './dtos/create-graph.dto';
import { UpdateGraphDto } from './dtos/update-graph.dto';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { SuccessResponse } from '@/shared/response/success.response';
import { PagingResponse } from '@/shared/response/paging.response';
import { UpdateMetadata } from './dtos/update-metadata.dto';
import { StreamEvent } from './contracts/stream.contract';

interface RequestWithUser extends Request {
  user: {
    sub: string;
  };
}

@Controller('graphs')
@UseGuards(JwtAuthGuard)
export class GraphController {
  private readonly logger = new Logger(GraphController.name);

  constructor(private readonly graphService: GraphService) {}

  @Post()
  async createGraph(
    @Req() req: RequestWithUser,

    @Body() dto: CreateGraphDto,
  ): Promise<SuccessResponse> {
    const userId = req.user.sub;
    return this.graphService.createGraph(userId, dto);
  }

  @Patch(':id/update-metadata')
  async updateGraphMetadata(
    @Req() req: RequestWithUser,
    @Param('id') graphId: string,

    @Body() dto: UpdateMetadata,
  ): Promise<SuccessResponse> {
    const userId = req.user.sub;
    return this.graphService.updateGraphMetadata(graphId, userId, dto);
  }

  @Patch(':id')
  async updateGraph(
    @Req() req: RequestWithUser,
    @Param('id') graphId: string,

    @Body() dto: UpdateGraphDto,
  ): Promise<SuccessResponse> {
    const userId = req.user.sub;
    return this.graphService.updateGraph(graphId, userId, dto);
  }

  @Post(':id/clone')
  async cloneGraph(
    @Req() req: RequestWithUser,
    @Param('id') graphId: string,
  ): Promise<SuccessResponse> {
    const userId = req.user.sub;
    return this.graphService.cloneGraph(graphId, userId);
  }

  @Get(':id')
  async getGraphDetail(
    @Req() req: RequestWithUser,
    @Param('id') graphId: string,
  ): Promise<SuccessResponse> {
    const userId = req.user.sub;
    return this.graphService.getGraphDetail(graphId, userId);
  }

  @Get()
  async getGraphs(
    @Req() req: RequestWithUser,
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
    @Req() req: RequestWithUser,

    @Param('id') graphId: string,
    @Body('input') input: string,
    @Res() res: Response,
  ) {
    const userId = req.user.sub;

    const graph = await this.graphService.getGraphRaw(graphId, userId);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await this.graphService.streamRun(graph, input, userId);

    try {
      for await (const event of stream) {
        const [nodeType, nodeData] = Object.entries(event)[0];
        const data = nodeData as {
          input: unknown;
          output: unknown;
          ok: boolean;
          retryCount: number;
          meta: unknown;
        };

        const standardizedEvent: StreamEvent = {
          nodeType,
          input:
            typeof data.input === 'string'
              ? data.input
              : JSON.stringify(data.input),
          output: this.summarizeOutput(data.output),
          ok: data.ok,
          retryCount: data.retryCount,
          meta: data.meta as Record<string, unknown>,
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

  private summarizeOutput(output: unknown): string | undefined {
    if (output === null || output === undefined) return undefined;

    // If output is a string (common for tool results), truncate if too long
    if (typeof output === 'string') {
      if (output.length > 500) {
        return (
          output.substring(0, 500) +
          `\n... [Truncated. Total size: ${output.length} chars]`
        );
      }
      return output;
    }

    // If output is an object (common for JSON results), try to stringify and check size
    // Or just return a summary "Object keys: ..."
    if (typeof output === 'object') {
      try {
        const str = JSON.stringify(output);
        if (str.length > 500) {
          return `[Object] Keys: ${Object.keys(output as object).join(', ')}. Content size: ${str.length} chars.`;
        }
        return str;
      } catch (e) {
        this.logger.error(e);
        return '[Object] (Circular or non-serializable)';
      }
    }

    return String(output);
  }
}
