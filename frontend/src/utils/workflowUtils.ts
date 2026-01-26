import type { Node, Edge } from '@xyflow/react';
import type {
  INodeConfig,
  NodeConfigItem,
} from '../components/workflows/nodes/baseConfig/nodeConfig';
import type { VariableReference } from '../components/workflows/nodes/baseConfig/variableSystem';

/**
 * Traverses the graph upstream from the given node and collects all output variables
 * from ancestor nodes.
 *
 * @param currentNodeId The ID of the node starting the search from (this node's ancestors will be searched)
 * @param nodes All nodes in the graph
 * @param edges All edges in the graph
 * @param nodeConfig The configuration object containing node definitions (inputs/outputs)
 * @returns List of available variables from upstream nodes
 */
export const getAvailableVariables = (
  currentNodeId: string,
  nodes: Node[],
  edges: Edge[],
  nodeConfig: Record<string, NodeConfigItem>,
): VariableReference[] => {
  const visited = new Set<string>([currentNodeId]);
  const variables: VariableReference[] = [];
  const queue: string[] = [];

  // Find all direct parents of the current node
  edges.forEach((edge) => {
    if (edge.target === currentNodeId) {
      queue.push(edge.source);
    }
  });

  while (queue.length > 0) {
    const sourceId = queue.shift()!;
    if (visited.has(sourceId)) continue;
    visited.add(sourceId);

    const sourceNode = nodes.find((n) => n.id === sourceId);
    if (sourceNode) {
      const sourceType = sourceNode.type as INodeConfig;
      const config = nodeConfig[sourceType];

      if (config && config.outputVariables) {
        let outputs: { name: string; type: string }[] = [];

        if (Array.isArray(config.outputVariables)) {
          outputs = config.outputVariables.map((v: string) => ({
            name: v,
            type: 'string',
          }));
        } else if (typeof config.outputVariables === 'function') {
          outputs = config.outputVariables(sourceNode.data);
        }

        outputs.forEach((out) => {
          // Format: "{{NodeLabel.VariableName}}"
          const nodeLabel = (sourceNode.data.label as string) || sourceNode.id;

          variables.push({
            nodeId: sourceNode.id,
            variableName: `${nodeLabel}.${out.name}`, // Keeping backward compatibility for search
            variableType: out.type,
            nodeLabel: nodeLabel,
            rawVariableName: out.name,
          });
        });
      }

      // Continue traversal upstream (find parents of this parent)
      edges.forEach((edge) => {
        if (edge.target === sourceId) {
          queue.push(edge.source);
        }
      });
    }
  }
  return variables;
};
