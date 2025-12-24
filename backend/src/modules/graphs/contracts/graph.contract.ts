import { GraphDocument } from "../schemas/graphs.schema";
import { FlowEdge, FlowNode } from "../types/graph.types";

export class GraphContract {
  id: string;
  name: string;
  description: string | null;
  nodes: FlowNode[];
  edges: FlowEdge[];
  created_at: Date;
  updated_at: Date;
}

export const mapGraphToResponse = (graph: GraphDocument): GraphContract => {
  return {
    id: graph._id.toString(),
    name: graph.name,
    description: graph.description,
    nodes: graph.nodes,
    edges: graph.edges,
    created_at: graph.created_at,
    updated_at: graph.updated_at,
  };
};