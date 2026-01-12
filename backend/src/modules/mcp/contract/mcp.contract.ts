export interface McpContract {
    id: string;
    name: string;
    description: string;
    is_authorized: boolean;
    tools: Record<string, string>;
}