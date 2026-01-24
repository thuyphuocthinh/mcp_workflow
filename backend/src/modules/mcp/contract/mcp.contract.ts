export interface McpContract {
    id: string;
    name: string;
    key: string;
    description: string;
    is_authorized?: boolean;
    tools: Array<Record<string, string>>;
}