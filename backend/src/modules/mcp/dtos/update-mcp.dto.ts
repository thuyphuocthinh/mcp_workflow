import { PartialType } from "@nestjs/mapped-types";
import { CreateMcpToolDto } from "./create-mcp.dto";

export class UpdateMcpToolDto extends PartialType(CreateMcpToolDto) {}
