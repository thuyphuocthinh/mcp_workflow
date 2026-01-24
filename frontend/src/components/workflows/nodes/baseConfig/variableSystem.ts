export interface VariableReference {
  nodeId: string;
  variableName: string;
  variableType: string;
  nodeLabel?: string; // Friendly name of the node
  rawVariableName?: string; // Variable name without node prefix
}
