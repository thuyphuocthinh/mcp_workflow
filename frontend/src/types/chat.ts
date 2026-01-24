export type ChatMessage = {
  id: string;
  role: "HUMAN" | "AI";
  content: string;
  created_at: string;
};

export type Workflow = {
  id: string;
  name: string;
};
