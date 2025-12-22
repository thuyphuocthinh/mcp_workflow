import type { Edge } from "@xyflow/react";
import type { CustomNode } from "./nodeType";

export interface FlowData {
  nodes: CustomNode[];
  edges: Edge[];
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
}
