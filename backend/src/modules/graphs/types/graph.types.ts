export type FlowNodePosition = {
  x: number;
  y: number;
};

export type FlowNode = {
  id: string;
  type?: string;
  position: FlowNodePosition;
  data?: Record<string, any>;
};

export type FlowEdge = {
  id: string;
  type: string;
  source: string;
  target: string;
  soureHandle: string;
  targetHandle: string;
};
