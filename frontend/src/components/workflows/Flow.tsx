import { Box, IconButton } from "@chakra-ui/react";
import "@xyflow/react/dist/style.css";
import { useState, useCallback } from "react";
import {
  ReactFlow,
  addEdge,
  applyNodeChanges,
  Controls,
  MiniMap,
  Background,
  applyEdgeChanges,
  type Node,
  type Edge,
  type FitViewOptions,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  type OnNodeDrag,
  type DefaultEdgeOptions,
} from "@xyflow/react";
import { CustomEdge } from "./CusomEdge";
import { NodesSidebar } from "./sidebar";
import { LuArrowRight, LuArrowLeft } from "react-icons/lu";

const initialNodes: Node[] = [
  {
    id: "1",
    data: { label: "Node 1" },
    position: { x: 5, y: 5 },
    type: "input",
  },
  { id: "2", data: { label: "Node 2" }, position: { x: 5, y: 125 } },
  { id: "3", data: { label: "Node 3" }, position: { x: 25, y: 150 } },
  {
    id: "4",
    data: { label: "Node 4" },
    position: { x: 5, y: 175 },
    type: "output",
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", type: "custom-edge" },
];

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};

const onNodeDrag: OnNodeDrag = (_, node) => {
  console.log("drag event", node.data);
};

function Flow() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setCollapsed((v) => !v);

  const edgeTypes = {
    "custom-edge": CustomEdge,
  };

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onConnect: OnConnect = useCallback(
    (connection) => {
      const edge = { ...connection, type: "custom-edge" };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  return (
    <Box w="full" h="100%" display="flex">
      <Box
        w={collapsed ? "0px" : "250px"}
        overflow="hidden"
        transition="all 0.3s ease"
        bg="white"
        borderRight="1px solid"
        borderColor="gray.200"
        boxShadow="md"
        position="relative"
        zIndex={10}
      >
        <NodesSidebar />
      </Box>

      <IconButton
        aria-label="Toggle sidebar"
        position="absolute"
        left={collapsed ? "20px" : "250px"}
        top="100px"
        transform="translateX(-50%)"
        transition="all 0.3s ease"
        size="sm"
        zIndex={20}
        color="gray.700"
        onClick={toggleSidebar}
        bg="white"
        boxShadow="md"
        border="1px solid"
        borderColor="gray.200"
        _hover={{ bg: "gray.100" }}
      >
        {collapsed ? <LuArrowRight /> : <LuArrowLeft />}
      </IconButton>

      <Box flex="1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDrag={onNodeDrag}
          fitView
          snapToGrid
          fitViewOptions={fitViewOptions}
          defaultEdgeOptions={defaultEdgeOptions}
          style={{ width: "100%", height: "100%" }}
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </Box>
    </Box>
  );
}

export default Flow;
