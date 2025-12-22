import { useClipboard } from "@/hooks/useClipboard";
import useCustomToast from "@/hooks/useCustomToast";
import type { Edge, Node } from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import { NO_ACTION_NODES } from "../../constants";
import { useHistory } from "./UseHistory";
import type { CustomNode } from "../../nodes/baseConfig/nodeType";

interface FlowStateProps {
  initNodes: Node[];
  initEdges: Edge[];
}

const isEqualGraph = (
  a: { nodes: Node[]; edges: Edge[] },
  b: { nodes: Node[]; edges: Edge[] },
) => {
  return JSON.stringify(a) === JSON.stringify(b);
};


export const useFlowState = ({ initNodes, initEdges }: FlowStateProps) => {
  const [nodes, setNodesRaw] = useState<Node[]>(initNodes);
  const [edges, setEdgesRaw] = useState<Edge[]>(initEdges);
  const [isGraphModified, setIsGraphModified] = useState<boolean>(false);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<{
    nodes: Node[];
    edges: Edge[];
  }>({
    nodes: initNodes,
    edges: initEdges,
  });

  const { undo, redo, canUndo, canRedo, push: pushHistory } = useHistory();
  const { copy, cut, paste, clipboard } = useClipboard();
  const { showToast } = useCustomToast();

  useEffect(() => {
    const modified = !isEqualGraph(
      { nodes, edges },
      lastSavedSnapshot,
    );
    setIsGraphModified(modified);
  }, [nodes, edges, lastSavedSnapshot]);

  // --- Wrappers setNodes / setEdges để push history ---
  const setNodes = useCallback(
    (updater: Node[] | ((prev: Node[]) => Node[])) => {
      setNodesRaw((prevNodes) => {
        const nextNodes = typeof updater === "function" ? updater(prevNodes) : updater;
        pushHistory({ nodes: nextNodes, edges });
        return nextNodes;
      });
    },
    [edges, pushHistory]
  );

  const setEdges = useCallback(
    (updater: Edge[] | ((prev: Edge[]) => Edge[])) => {
      setEdgesRaw((prevEdges) => {
        const nextEdges = typeof updater === "function" ? updater(prevEdges) : updater;
        pushHistory({ nodes, edges: nextEdges });
        return nextEdges;
      });
    },
    [nodes, pushHistory]
  );

  const onNodeChange = useCallback(
    (nodeId: string, key: string, value: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id !== nodeId) return node;

          if (key === "label") {
            const isNameExists = nds.some(
              (n) => n.id !== nodeId && n.data?.label === value,
            );

            if (isNameExists) {
              return node;
            }
          }

          return {
            ...node,
            data: {
              ...node.data,
              [key]: value,
            },
          } as CustomNode;
        }),
      );
    },
    [setNodes],
  );

  // --- Copy / Cut Node ---
  const copyNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      if (NO_ACTION_NODES.includes(node.type as string)) return;

      copy(JSON.stringify(node));
      showToast("Success", "Copy Node Successfully", "success");
    },
    [nodes]
  );

  const cutNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      if (NO_ACTION_NODES.includes(node.type as string)) return;

      cut(JSON.stringify(node));
      showToast("Success", "Cut Node Successfully", "success");
    },
    [nodes]
  );

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    copyNode,
    cutNode,
    pasteNode: paste,
    setNodesRaw,
    setEdgesRaw,
    clipboard,
    undo,
    redo,
    canUndo,
    canRedo,
    onNodeChange,
    isGraphModified,
    setLastSavedSnapshot,
    setIsGraphModified
  };
};
