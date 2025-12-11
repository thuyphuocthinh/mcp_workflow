import { useCallback } from 'react';
import { MarkerType, type Edge, type Node } from '@xyflow/react';
import dagre from "dagre";

interface LayoutOptions {
  nodeWidth?: number;
  nodeHeight?: number;
  rankSpacing?: number;
  nodeSpacing?: number;
}


export const useFlowCommon = () => {
    const generateUniqueName = useCallback(
        (baseLabel: string, nodes: Node[]) => {
            baseLabel = baseLabel[0].toUpperCase() + baseLabel.substring(1)
            const existingNames = nodes.map(node => node.data.label);
            let counter = 1;
            let newName = baseLabel;

            while (existingNames.includes(newName)) {
                counter++;
                newName = `${baseLabel}-${counter}`;
            }
            return newName[0].toUpperCase() + newName.substring(1);
        },
        [],
    );

    const reorderNodeNames = useCallback((nodeType: string, nodes: Node[]): Node[] => {
        const nodesOfType = nodes
          .filter(n => n.type === nodeType)
          .sort((a, b) => {
            // Lấy số cuối nếu có, nếu không số = 0
            const getNumber = (label: string) => {
              const match = label.match(new RegExp(`^${nodeType}(\\d+)?$`));
              return match && match[1] ? parseInt(match[1], 10) : 0;
            };
            return getNumber(a.data.label as string) - getNumber(b.data.label as string);
          });

        // Gán lại label liên tục
        const updatedNodes = nodes.map(n => {
          if (n.type !== nodeType) return n;

          const index = nodesOfType.findIndex(x => x.id === n.id);
          const baseLabel = nodeType[0].toUpperCase() + nodeType.substring(1);
          return {
            ...n,
            data: {
              ...n.data,
              label: index === 0 ? baseLabel : `${baseLabel}${index + 1}`,
            },
          };
        });

        return updatedNodes;
    }, []);

    const calculateEdgeCenter = useCallback((
      sourceNode: Node,
      targetNode: Node,
    ): { x: number; y: number } => {
      const sourceX = sourceNode.position.x + (sourceNode.width ?? 0) / 2;
      const sourceY = sourceNode.position.y + (sourceNode.height ?? 0) / 2;
      const targetX = targetNode.position.x + (targetNode.width ?? 0) / 2;
      const targetY = targetNode.position.y + (targetNode.height ?? 0) / 2;

      return {
        x: (sourceX + targetX) / 2,
        y: (sourceY + targetY) / 2,
      };
    }, []);

    const generateEdgeData = useCallback((source: string, target: string): Edge => {
      return {
        id: `edge-${source}-${target}`,
        source: source,
        target: target,
        type: "custom-edge",
        style: { stroke: "#000", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: "#000",
        },
        data: {},
      }
    }, []);

    const getLayoutedElements = (nodes: Node[], edges: Edge[], options: LayoutOptions = {}) => {
      const { nodeWidth = 200, nodeHeight = 100, rankSpacing = 80, nodeSpacing = 80 } = options;

      const dagreGraph = new dagre.graphlib.Graph();
      dagreGraph.setDefaultEdgeLabel(() => ({}));

      dagreGraph.setGraph({
        rankdir: "LR",
        nodesep: nodeSpacing,
        ranksep: rankSpacing,
        align: "UL",
        marginx: 50,
        marginy: 50,
      });

      const llmNodes = nodes.filter(node => node.type === "llm");
      const connectedToolNodes = new Set<string>();
      const connectedAnswerNodes = new Map<string, string>();

      edges.forEach(edge => {
        const sourceLLM = llmNodes.find(n => n.id === edge.source);
        const targetLLM = llmNodes.find(n => n.id === edge.target);
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);

        if (sourceLLM && (targetNode?.type === "tool" || targetNode?.type === "toolretrieval")) {
          connectedToolNodes.add(targetNode.id);
        }
        if (targetLLM && (sourceNode?.type === "tool" || sourceNode?.type === "toolretrieval")) {
          connectedToolNodes.add(sourceNode.id);
        }

        if (sourceLLM && targetNode?.type === "answer") {
          connectedAnswerNodes.set(targetNode.id, sourceLLM.id);
        }
        if (targetLLM && sourceNode?.type === "answer") {
          connectedAnswerNodes.set(sourceNode.id, targetLLM.id);
        }
      });

      const llmRanks = new Map<string, number>();
      llmNodes.forEach((node, index) => {
        llmRanks.set(node.id, index);
      });

      nodes.forEach(node => {
        const connectedLLMId = connectedAnswerNodes.get(node.id);
        const rankValue =
          node.type === "llm"
            ? llmRanks.get(node.id)
            : node.type === "answer" && connectedLLMId
              ? llmRanks.get(connectedLLMId)
              : undefined;

        dagreGraph.setNode(node.id, {
          width: node.width ?? nodeWidth,
          height: node.height ?? nodeHeight,
          rank: rankValue,
        });
      });

      edges.forEach(edge => {
        const weight = edge.source === edge.target ? 0 : 1;
        dagreGraph.setEdge(edge.source, edge.target, { weight });
      });

      dagre.layout(dagreGraph);

      // Pass 1: lấy position từ dagre
      const rawPositions = new Map<string, { x: number; y: number }>();

      nodes.forEach(node => {
        const dagreNode = dagreGraph.node(node.id);
        if (!dagreNode) return;

        rawPositions.set(node.id, {
          x: dagreNode.x - (dagreNode.width ?? nodeWidth) / 2,
          y: dagreNode.y - (dagreNode.height ?? nodeHeight) / 2,
        });
      });

      // Pass 2: apply custom offset
      const layoutedNodes = nodes.map(node => {
        const pos = rawPositions.get(node.id);
        if (!pos) return node;

        const position = { ...pos };

        // Tool node — thêm spacing theo height
        if (connectedToolNodes.has(node.id)) {
          position.y += (node.height ?? nodeHeight) + 20;
        }

        // Answer node — cần so sánh với LLM
        const connectedLLMId = connectedAnswerNodes.get(node.id);
        if (node.type === "answer" && connectedLLMId) {
          const llmPos = rawPositions.get(connectedLLMId);
          if (llmPos) {
            position.y = Math.max(position.y, llmPos.y + 10);
          }
        }

        return {
          ...node,
          position,
          className: "react-flow__node-animated",
        };
      });

      return layoutedNodes;
    };

    return {
        generateUniqueName,
        reorderNodeNames,
        calculateEdgeCenter,
        generateEdgeData,
        getLayoutedElements
    }
}