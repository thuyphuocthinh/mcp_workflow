import { useCallback, useState } from "react";
import type { Node } from "@xyflow/react";
import { NO_ACTION_NODES } from "../../constants";

export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string | null;
  }>({ x: 0, y: 0, nodeId: null });

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if(NO_ACTION_NODES.includes(node.type as string)) return;
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
      });
    },
    [],
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu({ x: 0, y: 0, nodeId: null });
  }, []);

  return { contextMenu, onNodeContextMenu, closeContextMenu };
}