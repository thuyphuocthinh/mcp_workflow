export type i_node_position = {
  x: number;
  y: number;
};

export type i_node = {
  id: string;
  type?: string;
  position: i_node_position;
  data?: Record<string, any>;
};

export type i_edge = {
  id: string;
  type: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
};

export interface i_graph {
  id: string;
  name: string;
  description: string | null;
  nodes: i_node[];
  edges: i_edge[];
  created_at: Date;
  updated_at: Date;
}

export interface i_graph_create {
  name: string;
  description?: string;
}

export interface i_update_graph_metadata extends i_graph_create {}

export interface i_graph_update {
  name: string;
  description: string;
  nodes: i_node[];
  edges: i_edge[];
}
