import { useClipboard } from "@/hooks/useClipboard";
import useCustomToast from "@/hooks/useCustomToast";
import type { Edge, Node } from "@xyflow/react";
import { useCallback, useState } from "react";
import { NO_ACTION_NODES } from "../../constants";

interface FlowStateProps {
    initNodes: Node[];
    initEdges: Edge[];
}

export const useFlowState = ({initNodes, initEdges}: FlowStateProps) => {
    const [nodes, setNodes] = useState<Node[]>(initNodes);
    const [edges, setEdges] = useState<Edge[]>(initEdges);
    const { copy, cut, paste, clipboard } = useClipboard();
    const {showToast} = useCustomToast();

    const copyNode = useCallback((nodeId: string) => {
        const node = nodes.find(node => node.id === nodeId);
        if(node) {
            if(NO_ACTION_NODES.includes(node.type as string)) return;
            copy(JSON.stringify(node));
            showToast("Success", "Copy Node Successfully", "success");
        }
    }, [nodes])

    const cutNode = useCallback((nodeId: string) => {
        const node = nodes.find(node => node.id === nodeId);
        if(node) {
            if(NO_ACTION_NODES.includes(node.type as string)) return;
            cut(JSON.stringify(node));
            showToast("Success", "Cut Node Successfully", "success");
        }
    }, [nodes])

    return {
        nodes,
        edges,
        setNodes,
        setEdges,
        copyNode,
        cutNode,
        pasteNode: paste,
        clipboard
    }
}

// Copy | Cut => Dua vao clipboard
// Paste => Set vao nodes va hien thi UI dua tren context menu
// 1. Trigger (Click button | Ctrl C | Ctrl X)
// 2. Listener (Get data => save in clipboard and waiting)
// 3. Trigger (Click paste | Ctrl V)
// 4. Render (get data from clipboard + context menu mouse => render UI)