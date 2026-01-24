export interface StreamEvent {
  nodeType: string;
  nodeId?: string;
  input?: string;
  output?: string;
  ok?: boolean;
  retryCount?: number;
  meta?: Record<string, any>;
}
