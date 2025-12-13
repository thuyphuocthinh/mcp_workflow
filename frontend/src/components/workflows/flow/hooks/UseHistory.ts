// useHistoryOptimized.ts
import { useRef, useCallback } from "react";
import type { Node, Edge } from "@xyflow/react";

export type FlowSnapshot = {
  nodes: Node[];
  edges: Edge[];
};

const isDifferentSnapshot = (prev?: FlowSnapshot, next?: FlowSnapshot) => {
  if (!prev || !next) return true;
  if (prev.nodes.length !== next.nodes.length) return true;
  if (prev.edges.length !== next.edges.length) return true;

  const nodesChanged = prev.nodes.some((n, i) => {
    const nextNode = next.nodes[i];
    return (
      n.id !== nextNode.id ||
      n.position.x !== nextNode.position.x ||
      n.position.y !== nextNode.position.y ||
      n.data.label !== nextNode.data.label
    );
  });

  const edgesChanged = prev.edges.some((e, i) => {
    const nextEdge = next.edges[i];
    return e.id !== nextEdge.id || e.source !== nextEdge.source || e.target !== nextEdge.target;
  });

  return nodesChanged || edgesChanged;
};

export function useHistory(throttleMs = 300, maxHistory = 100) {
  const historyRef = useRef<FlowSnapshot[]>([]);
  const indexRef = useRef(-1);
  const lastPushTime = useRef<number>(0);

  const push = useCallback((snapshot: FlowSnapshot) => {
    const now = Date.now();
    if (now - lastPushTime.current < throttleMs) return;
    const history = historyRef.current;
    const index = indexRef.current;

    const prev = history[index];
    if (!isDifferentSnapshot(prev, snapshot)) return;

    // Discard redo history
    history.splice(index + 1);

    history.push(structuredClone(snapshot));
    if (history.length > maxHistory) history.shift(); // limit history size
    indexRef.current = history.length - 1;
    lastPushTime.current = now;
  }, [throttleMs, maxHistory]);

  const undo = useCallback(() => {
    if (indexRef.current > 0) {
      indexRef.current--;
      return structuredClone(historyRef.current[indexRef.current]);
    }
    return null;
  }, []);

  const redo = useCallback(() => {
    if (indexRef.current < historyRef.current.length - 1) {
      indexRef.current++;
      return structuredClone(historyRef.current[indexRef.current]);
    }
    return null;
  }, []);

  return {
    push,
    undo,
    redo,
    canUndo: () => indexRef.current > 0,
    canRedo: () => indexRef.current < historyRef.current.length - 1,
  };
}
