import { Box, IconButton } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import "@xyflow/react/dist/style.css";
import { useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  addEdge,
  applyNodeChanges,
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
  useReactFlow,
  BackgroundVariant,
  Panel,
} from "@xyflow/react";
import { CustomEdge } from "./CusomEdge";
import { NodesSidebar } from "./Sidebar";
import { LuArrowRight, LuArrowLeft } from "react-icons/lu";
import { CustomNodeTypes, type CustomNode } from "../nodes/baseConfig/nodeType";
import { useFlowState } from "./UseFlowState";
import { useFlowCommon } from "./UseFlowCommon";
import { v4 } from "uuid";
import { FiEye, FiEyeOff } from "react-icons/fi";
import CustomControls from "./CustomControls";

const initialNodes: CustomNode[] = [
  {
    id: `start-${v4()}`,
    data: { label: "Start" },
    position: { x: 0, y: 50 },
    type: "start",
    width: 200,
  },
  {
    id: `end-${v4()}`,
    data: { label: "End" },
    position: { x: 400, y: 50 },
    type: "end",
    width: 200,
  },
];

const initialEdges: Edge[] = [{ id: "e1-2", source: "1", target: "2" }];

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: false,
};

function Flow() {
  const { nodes, edges, setNodes, setEdges } = useFlowState({
    initNodes: initialNodes,
    initEdges: initialEdges,
  });
  const reactFlowInstance = useReactFlow();
  const { generateUniqueName } = useFlowCommon();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("");
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed((v) => !v);
  const [locked, setLocked] = useState(false);
  const selectedNode = useMemo(() => {
    return nodes.find((node) => node.id === selectedNodeId);
  }, [selectedNodeId]);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const edgeTypes = {
    "custom-edge": CustomEdge,
  };

  const edgesWithStyles = useMemo(() => {
    return edges?.map((edge) => {
      return {
        ...edge,
        style: {
          ...edge.style,
          strokeWidth: 2,
          strokeDasharray: edge.type === "smoothstep" ? "5,5" : undefined,
          stroke: "#517359",
          markerEnd: `url(#arrow-${edge.id})`,
        },
      };
    });
  }, [edges, nodes]);

  const nodesWithSelection = useMemo(() => {
    if (!nodes) return [];

    return nodes.map((node) => {
      let isActive = node.id === selectedNodeId;

      return {
        ...node,
        style: {
          ...node.style,
          border:
            node.id === selectedNodeId
              ? "3px solid #2970ff"
              : isActive
              ? "4px solid #38a169"
              : "none",
          borderRadius: "12px",
          backgroundColor: isActive ? "#e6fffa" : "white",
          boxShadow: isActive ? "0 0 10px rgba(56, 161, 105, 0.5)" : "none",
          transition: "all 0.1s ease",
        },
      };
    });
  }, [nodes, selectedNodeId]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  const onNodeDrag: OnNodeDrag = useCallback(
    (_, node) => {
      console.log("drag event", node.data);
    },
    [reactFlowInstance]
  );

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

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    },
    []
  );

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const nodeType = event.dataTransfer.getData("application/reactflow");
    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    setNodes([
      ...nodes,
      {
        id: `${nodeType}-${v4()}`,
        data: { label: generateUniqueName(nodeType, nodes) },
        position,
        type: nodeType,
        width: 200,
      },
    ]);
  };

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
          onNodeClick={onNodeClick}
          nodes={nodesWithSelection}
          edges={edgesWithStyles}
          edgeTypes={edgeTypes}
          nodeTypes={CustomNodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDrag={onNodeDrag}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onPaneClick={onPaneClick}
          fitView
          snapToGrid
          fitViewOptions={fitViewOptions}
          defaultEdgeOptions={defaultEdgeOptions}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={!locked}
          elementsSelectable={!locked}
          zoomOnScroll={!locked}
          zoomOnDoubleClick={!locked}
          zoomOnPinch={!locked}
          deleteKeyCode={["Backspace", "Delete"]}
          style={{ width: "100%", height: "100%" }}
          attributionPosition="bottom-left"
        >
          <svg style={{ display: "inline-block" }}>
            {edgesWithStyles.map((edge) => (
              <marker
                id={`arrow-${edge.id}`}
                key={edge.id}
                markerWidth="10"
                markerHeight="10"
                refX="8"
                refY="5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,10 L10,5 z" fill={"#517359"} />
              </marker>
            ))}
          </svg>

          {/* <Controls /> */}
          <CustomControls locked={locked} setLocked={setLocked} />
          {showMiniMap && <MiniMap />}
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />

          <Panel
            position="bottom-left"
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "2px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              marginLeft: "4rem",
              marginBottom: "1rem",
            }}
          >
            <Tooltip
              content={showMiniMap ? "Hide" : "Show"}
              showArrow={true}
              positioning={{ placement: "right" }}
            >
              <Box
                padding={2}
                transition="all 0.2s"
                borderRadius={"md"}
                cursor={"pointer"}
                _hover={{
                  bg: "gray.100",
                  transform: "scale(1.1)",
                }}
                _active={{
                  transform: "scale(0.95)",
                }}
                onClick={() => setShowMiniMap(!showMiniMap)}
              >
                {showMiniMap ? <FiEyeOff /> : <FiEye />}
              </Box>
            </Tooltip>
          </Panel>
        </ReactFlow>
      </Box>
    </Box>
  );
}

export default Flow;
