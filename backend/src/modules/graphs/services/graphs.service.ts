import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Graph, GraphDocument } from '../schemas/graphs.schema'
import { CreateGraphDto } from '../dtos/create-graph.dto';
import { UpdateGraphDto } from '../dtos/update-graph.dto';
import { GraphContract, mapGraphToResponse } from '../contracts/graph.contract';
import { FlowEdge, FlowNode } from '../types/graph.types';
import { v4 } from 'uuid';
import { SuccessResponse } from '@/shared/response/success.response';
import { PagingResponse } from '@/shared/response/paging.response';

@Injectable()
export class GraphService {
  constructor(
    @InjectModel(Graph.name)
    private readonly graphModel: Model<GraphDocument>,
  ) {}

    async createGraph(
        userId: string,
        dto: CreateGraphDto,
    ): Promise<SuccessResponse> {

        const startNodeId = v4();
        const endNodeId = v4();

        const defaultNodes: FlowNode[] = [
            {
                id: startNodeId,
                type: 'start',
                position: { x: 100, y: 200 },
                data: {
                    label: 'Start',
                },
            },
            {
                id: endNodeId,
                type: 'end',
                position: { x: 400, y: 200 },
                data: {
                    label: 'End',
                },
            },
        ];

        const defaultEdges: FlowEdge[] = [
            {
                id: v4(),
                type: 'default',
                source: startNodeId,
                target: endNodeId,
                soureHandle: 'left',
                targetHandle: 'right',
            },
        ];

        const graph = await this.graphModel.create({
            name: dto.name,
            description: dto.description ?? '',
            user_id: new Types.ObjectId(userId),
            nodes: defaultNodes,
            edges: defaultEdges,
        });

        const populated = await graph.populate('user_id', 'email name');

        return new SuccessResponse({
            data: mapGraphToResponse(populated)
        })
    }

    async updateGraph(
        graphId: string,
        userId: string,
        dto: UpdateGraphDto,
    ): Promise<SuccessResponse> {
        const graph = await this.graphModel
                .findOne({
                    _id: new Types.ObjectId(graphId),
                    user_id: new Types.ObjectId(userId),
                })
                .exec();

        if (!graph) {
        throw new NotFoundException('Graph not found');
        }

        if (dto.nodes || dto.edges) {
        this.validateDAG(dto.nodes ?? graph.nodes, dto.edges ?? graph.edges);
        }

        Object.assign(graph, dto);
        await graph.save();

        const populated = await graph.populate('user_id', 'email name');

        return new SuccessResponse({
            data: mapGraphToResponse(populated)
        })
    }

    async getGraphDetail(
        graphId: string,
        userId: string,
    ): Promise<SuccessResponse> {

        const graph = await this.graphModel
            .findOne({
                _id: new Types.ObjectId(graphId),
                user_id: new Types.ObjectId(userId),
            })
            .populate('user_id', 'email name')
            .exec();

        if (!graph) {
            throw new NotFoundException('Graph not found');
        }

        return new SuccessResponse({
            data: mapGraphToResponse(graph),
        });
    }

    async getGraphsByUser(
        userId: string,
        page = 1,
        limit = 10,
    ): Promise<PagingResponse<GraphContract[]>> {
        const userObjectId = new Types.ObjectId(userId);

        const skip = (page - 1) * limit;

        const [graphs, totalItems] = await Promise.all([
            this.graphModel
            .find({ user_id: userObjectId })
            .sort({ updated_at: -1 })
            .skip(skip)
            .limit(limit)
            .exec(),

            this.graphModel.countDocuments({ user_id: userObjectId }),
        ]);

        const data = graphs.map(mapGraphToResponse);

        return new PagingResponse(data, {
            page,
            limit,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
        });
    }

    private validateDAG(nodes: any[], edges: any[]) {
        const nodeIds = new Set(nodes.map(n => n.id));
        const inDegree = new Map<string, number>();
        const adj = new Map<string, string[]>();

        for (const node of nodes) {
        inDegree.set(node.id, 0);
        adj.set(node.id, []);
        }

        for (const edge of edges) {
        if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
            throw new BadRequestException('Edge references invalid node');
        }

        adj.get(edge.source)!.push(edge.target);
        inDegree.set(edge.target, inDegree.get(edge.target)! + 1);
        }

        // Kahn's algorithm
        const queue: string[] = [];
        for (const [id, deg] of inDegree.entries()) {
        if (deg === 0) queue.push(id);
        }

        let visited = 0;
        while (queue.length) {
        const current = queue.shift()!;
        visited++;

        for (const next of adj.get(current)!) {
            inDegree.set(next, inDegree.get(next)! - 1);
            if (inDegree.get(next) === 0) {
            queue.push(next);
            }
        }
        }

        if (visited !== nodes.length) {
        throw new BadRequestException('Graph contains cycle (not a DAG)');
        }
    }
}
