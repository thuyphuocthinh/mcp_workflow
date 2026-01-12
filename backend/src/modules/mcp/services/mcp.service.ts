import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { SuccessResponse } from "@/shared/response/success.response";
import { McpContract } from "../contract/mcp.contract";
import { mapToolToContract } from "../helper/mcp.helper";

import { CreateMcpToolDto } from "../dtos/create-mcp.dto";
import { UpdateMcpToolDto } from "../dtos/update-mcp.dto";
import { ToolDocument } from "../schemas/tool.schema";
import { UserToolAuthDocument } from "../schemas/user-tool-auth.schema";

@Injectable()
export class McpService {
  constructor(
    @InjectModel("Tool")
    private readonly toolModel: Model<ToolDocument>,

    @InjectModel('UserToolAuth')
    private readonly userToolAuthModel: Model<UserToolAuthDocument>,
  ) {}

  /* ================= GET ALL ================= */
  async getAll(
    userId: string,
  ): Promise<SuccessResponse<McpContract[]>> {

    // 1. Lấy tất cả tool enabled
    const tools = await this.toolModel
      .find({ enabled: true })
      .lean();

    // 2. Lấy auth của user
    const authList = await this.userToolAuthModel
      .find({
        user_id: userId,
        status: 'AUTHORIZED',
      })
      .select('tool_key status')
      .lean();

    // 3. Map auth theo tool_key
    const authMap = new Set(
      authList.map(a => a.tool_key),
    );

    // 4. Merge → contract
    return new SuccessResponse({
      data: tools.map(tool => ({
        ...mapToolToContract(tool),
        is_authorized: authMap.has(tool.key),
      })),
    });
  }


  /* ================= ADD ================= */
  async add(
    dto: CreateMcpToolDto
  ): Promise<SuccessResponse<McpContract>> {
    const tool = await this.toolModel.create(dto);

    return new SuccessResponse({
      data: mapToolToContract(tool.toObject())
    });
  }

  /* ================= UPDATE ================= */
  async update(
    id: string,
    dto: UpdateMcpToolDto
  ): Promise<SuccessResponse<McpContract>> {
    const tool = await this.toolModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean();

    if (!tool) {
      throw new NotFoundException("Tool not found");
    }

    return new SuccessResponse({
      data: mapToolToContract(tool)
    });
  }

  /* ================= DELETE ================= */
  async delete(id: string): Promise<SuccessResponse<null>> {
    const tool = await this.toolModel.findByIdAndDelete(id);

    if (!tool) {
      throw new NotFoundException("Tool not found");
    }

    return new SuccessResponse({
      data: null
    });
  }
}
