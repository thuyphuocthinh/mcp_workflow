import { useClipboard } from "@/hooks/useClipboard";
import useCustomToast from "@/hooks/useCustomToast";
import type { Edge, Node } from "@xyflow/react";
import { useCallback, useState } from "react";
import { NO_ACTION_NODES } from "../../constants";
import { useHistory } from "./UseHistory";

interface FlowStateProps {
  initNodes: Node[];
  initEdges: Edge[];
}

export const useFlowState = ({ initNodes, initEdges }: FlowStateProps) => {
  const [nodes, setNodesRaw] = useState<Node[]>(initNodes);
  const [edges, setEdgesRaw] = useState<Edge[]>(initEdges);

  const { undo, redo, canUndo, canRedo, push: pushHistory } = useHistory();
  const { copy, cut, paste, clipboard } = useClipboard();
  const { showToast } = useCustomToast();

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
  };
};
