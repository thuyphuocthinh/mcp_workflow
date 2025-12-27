export type WorkflowState = {
  input: string;
  output?: string;
  ok?: boolean;
  retryCount: number;
}
