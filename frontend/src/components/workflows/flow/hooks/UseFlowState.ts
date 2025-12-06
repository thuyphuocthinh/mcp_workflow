import type { Edge, Node } from "@xyflow/react";
import { useState } from "react";

interface FlowStateProps {
    initNodes: Node[];
    initEdges: Edge[];
}

export const useFlowState = ({initNodes, initEdges}: FlowStateProps) => {
    const [nodes, setNodes] = useState<Node[]>(initNodes);
    const [edges, setEdges] = useState<Edge[]>(initEdges);

    return {
        nodes,
        edges,
        setNodes,
        setEdges
    }
}