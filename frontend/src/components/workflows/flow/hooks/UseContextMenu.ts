import { useCallback, useState } from "react";
import type { Node } from "@xyflow/react";
import { NO_ACTION_NODES } from "../../constants";

export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<{
    type: "node" | "pane" | null;
    x: number;
    y: number;
    nodeId?: string | null;
  }>({ type: null, x: 0, y: 0, nodeId: null });

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if(NO_ACTION_NODES.includes(node.type as string)) return;
      event.preventDefault();
      setContextMenu({
        type: "node",
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
      });
    },
    [],
  );

  const onPaneContextMenu = useCallback(
    (event: MouseEvent | React.MouseEvent<Element, MouseEvent>) => {
      event.preventDefault();
      setContextMenu({
        type: "pane",
        x: event.clientX,
        y: event.clientY,
      });
    },
    [],
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu({ type: null, x: 0, y: 0, nodeId: null });
  }, []);

  return { contextMenu, onNodeContextMenu, closeContextMenu, onPaneContextMenu };
}