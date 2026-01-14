export type Tool = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  key: string;
};

export interface i_tool {
  id: string;
  key: string;
  name: string;
  description: string;
  is_authorized?: boolean;
  tools: Array<Record<string, string>>;
}