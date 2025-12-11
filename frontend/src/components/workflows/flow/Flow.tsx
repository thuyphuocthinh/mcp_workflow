import { Box, IconButton, Menu, Portal } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import "@xyflow/react/dist/style.css";
import { useState, useCallback, useMemo, useEffect } from "react";
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
  useReactFlow,
  BackgroundVariant,
  Panel,
  ConnectionLineType,
  MarkerType,
  type EdgeProps,
} from "@xyflow/react";
import { NodesSidebar } from "./Sidebar";
import { LuArrowRight, LuArrowLeft } from "react-icons/lu";
import { CustomNodeTypes, type CustomNode } from "../nodes/baseConfig/nodeType";
import { useFlowState } from "./hooks/UseFlowState";
import { useFlowCommon } from "./hooks/UseFlowCommon";
import { v4 } from "uuid";
import { FiEye, FiEyeOff } from "react-icons/fi";
import CustomControls from "./CustomControls";
import { useContextMenu } from "./hooks/UseContextMenu";
import useCustomToast from "@/hooks/useCustomToast";
import { NO_ACTION_NODES } from "../constants";
import MiniMapNode from "./MiniMapNode";
import CustomEdge from "../edges/CustomEdge";
import { NodesMenu } from "./NodesMenu";

const defaultStartNodeId = `start-${v4()}`;
const defaultEndNodeId = `end-${v4()}`;
const initialNodes: CustomNode[] = [
  {
    id: defaultStartNodeId,
    data: { label: "Start" },
    position: { x: 0, y: 50 },
    type: "start",
    width: 200,
  },
  {
    id: defaultEndNodeId,
    data: { label: "End" },
    position: { x: 400, y: 50 },
    type: "end",
    width: 200,
  },
];

const initialEdges: Edge[] = [
  {
    id: `edge-${defaultStartNodeId}-${defaultEndNodeId}`,
    source: defaultStartNodeId,
    target: defaultEndNodeId,
    type: "custom-edge",
    style: { stroke: "#000", strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: "#000",
    },
    data: { label: "Start → End" },
  },
];

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

function Flow() {
  const { nodes, edges, setNodes, setEdges } = useFlowState({
    initNodes: initialNodes,
    initEdges: initialEdges,
  });
  const reactFlowInstance = useReactFlow();
  const { generateUniqueName, reorderNodeNames, generateEdgeData } =
    useFlowCommon();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("");
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed((v) => !v);
  const [locked, setLocked] = useState(false);
  const { onNodeContextMenu, contextMenu, closeContextMenu } = useContextMenu();
  const { showToast } = useCustomToast();
  // const selectedNode = useMemo(() => {
  //   return nodes.find((node) => node.id === selectedNodeId);
  // }, [selectedNodeId]);
  const [showNodesMenu, setShowNodesMenu] = useState(false);
  const [selectedEdgeId, setSelectedEdgeId] = useState("");
  const [nodeMenuPosition, setNodeMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [showMiniMap, setShowMiniMap] = useState(false);

  const edgesWithStyles = useMemo(() => {
    return edges?.map((edge) => {
      return {
        ...edge,
        style: {
          ...edge.style,
          strokeWidth: 3,
          strokeDasharray: edge.type === "smoothstep" ? "5,5" : undefined,
          stroke: "#000",
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
          borderRadius: "14px",
          backgroundColor: isActive ? "#e6fffa" : "white",
          boxShadow: isActive ? "0 0 10px rgba(56, 161, 105, 0.5)" : "none",
          transition: "all 0.1s ease",
        },
      };
    });
  }, [nodes, selectedNodeId]);

  const deleteNode = useCallback(
    (nodeId: string) => {
      const deletedNode = nodes.find((node) => node.id === nodeId);
      if (!deletedNode) return;
      if (NO_ACTION_NODES.includes(deletedNode.type as string)) {
        showToast("Error", "Cannot delete this node", "error");
        return;
      }
      const filterNodes = reorderNodeNames(
        deletedNode.type as string,
        nodes.filter((node) => node.id !== nodeId)
      );
      setNodes(filterNodes);

      const leftEdge = edges.find((edge) => edge.target === nodeId);
      const rightEdge = edges.find((edge) => edge.source === nodeId);
      if (!leftEdge || !rightEdge) return;

      const leftNodeId = nodes.find((node) => node.id === leftEdge.source)?.id;
      const rightNodeId = nodes.find(
        (node) => node.id === rightEdge.target
      )?.id;
      if (!leftNodeId || !rightNodeId) return;

      const newEdge = generateEdgeData(leftNodeId, rightNodeId);

      if (
        edges.find(
          (edge) =>
            edge.source === newEdge.source && edge.target === newEdge.target
        )
      )
        return;

      const filterEdges = edges.filter(
        (edge) => edge.id !== leftEdge.id && edge.id !== rightEdge.id
      );

      setEdges([...filterEdges, newEdge]);
    },
    [nodes]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedNodeId) {
          deleteNode(selectedNodeId);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNodeId, deleteNode]);

  const onNodesDelete = useCallback(
    (deletedNodes: Node[]) => {
      const nodesToKeep = deletedNodes.filter(
        (node: Node) => node.type === "start" || node.type === "end"
      );

      const nodesActuallyDeleted = deletedNodes.filter(
        (node: Node) => !nodesToKeep.includes(node)
      );

      if (nodesToKeep.length > 0) {
        showToast("Error", "Cannot delete Start or End node", "error");
        return;
      }

      setNodes((nds) =>
        nds.filter(
          (node) => !nodesActuallyDeleted.some((n) => n.id === node.id)
        )
      );
    },
    [nodes]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
      setShowNodesMenu(false);
      setNodeMenuPosition(null);
      setSelectedEdgeId("");
    },
    [setSelectedNodeId]
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: `edge-${connection.source}-${connection.target}`,
            type: "custom-edge",
            style: { stroke: "#000", strokeWidth: 4 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: "#000",
            },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    closeContextMenu();
    setShowNodesMenu(false);
    setNodeMenuPosition(null);
    setSelectedEdgeId("");
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

  const handleAddNodeFromEdge = useCallback(
    ({ id, x, y }: { id: string; x: number; y: number }) => {
      console.log("edge id: ", id);
      setSelectedEdgeId(id);
      setShowNodesMenu(true);
      setNodeMenuPosition({ x, y });
    },
    []
  );

  const edgeTypesWithCallback = useMemo(() => {
    return {
      "custom-edge": (props: EdgeProps) => (
        <CustomEdge
          {...props}
          data={{ ...props.data, onAddNode: handleAddNodeFromEdge }}
        />
      ),
    };
  }, []);

  const addNodeToEdge = useCallback(
    (nodeType: string) => {
      if (!selectedEdgeId || !nodeMenuPosition) return;

      const edge = edges.find((e) => e.id === selectedEdgeId);
      if (!edge) return;

      const newNodeId = `${nodeType}-${v4()}`;

      // 1) Tạo node mới
      const newNode: Node = {
        id: newNodeId,
        type: nodeType,
        position: reactFlowInstance.screenToFlowPosition({
          x: nodeMenuPosition.x,
          y: nodeMenuPosition.y,
        }),
        data: { label: generateUniqueName(nodeType, nodes) },
        width: 200,
      };

      // 2) Xóa edge cũ
      const newEdges = edges.filter((e) => e.id !== selectedEdgeId);

      // 3) Tạo 2 edge mới
      const firstEdge: Edge = generateEdgeData(edge.source, newNodeId);

      const secondEdge: Edge = generateEdgeData(newNodeId, edge.target);

      setNodes((nds) => [...nds, newNode]);
      setEdges([...newEdges, firstEdge, secondEdge]);

      setShowNodesMenu(false);
      setNodeMenuPosition(null);
      setSelectedEdgeId("");
    },
    [edges, nodes, selectedEdgeId, nodeMenuPosition]
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
          onNodeClick={onNodeClick}
          nodes={nodesWithSelection}
          edges={edgesWithStyles}
          nodeTypes={CustomNodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDrag={onNodeDrag}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onPaneClick={onPaneClick}
          onNodeContextMenu={onNodeContextMenu}
          fitView
          snapToGrid
          fitViewOptions={fitViewOptions}
          proOptions={{ hideAttribution: true }}
          deleteKeyCode={[]}
          nodesDraggable={!locked}
          elementsSelectable={!locked}
          zoomOnScroll={!locked}
          zoomOnDoubleClick={!locked}
          zoomOnPinch={!locked}
          onNodesDelete={onNodesDelete}
          style={{ width: "100%", height: "100%" }}
          connectionLineType={ConnectionLineType.SmoothStep}
          edgeTypes={edgeTypesWithCallback}
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
                <path d="M0,0 L0,10 L10,5 z" fill={"#000"} />
              </marker>
            ))}
          </svg>

          {/* <Controls /> */}
          <CustomControls locked={locked} setLocked={setLocked} />
          {showMiniMap && (
            <MiniMap
              nodeComponent={MiniMapNode}
              pannable={true}
              zoomable={true}
              bgColor="gray"
              nodeStrokeWidth={3}
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
          )}

          {/* Dots Background */}
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />

          {/* Show minimap */}
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

          {/* Node Context Menu (Delete, Copy, Paste...) */}
          {contextMenu.nodeId && (
            <Menu.Root
              positioning={{ placement: "right-start" }}
              closeOnSelect={true}
              onEscapeKeyDown={closeContextMenu}
              onSelect={closeContextMenu}
              open={!!contextMenu.nodeId}
              onOpenChange={(open) => {
                if (!open) closeContextMenu();
              }}
            >
              <Menu.Trigger asChild></Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content
                    position="absolute"
                    style={{
                      left: `${contextMenu.x}px`,
                      top: `${contextMenu.y}px`,
                    }}
                    bg="white"
                    borderRadius="xl"
                    boxShadow="lg"
                    border="1px solid"
                    borderColor="gray.100"
                    p={2}
                  >
                    <Menu.Item
                      cursor={"pointer"}
                      value="Delete node"
                      onClick={() => deleteNode(contextMenu.nodeId as string)}
                      borderRadius="lg"
                      transition="all 0.2s"
                      _hover={{
                        bg: "red.50",
                        color: "red.500",
                      }}
                    >
                      Delete Node
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          )}

          {/* Nodes Menu - List of Nodes */}
          {showNodesMenu && nodeMenuPosition && (
            <Box
              width={"250px"}
              maxHeight={"500px"}
              zIndex={5}
              shadow={"lg"}
              borderRadius={"md"}
              overflow={"auto"}
              position="absolute"
              style={{
                left: `${nodeMenuPosition.x}px`,
                top: `${nodeMenuPosition.y + 200}px`,
              }}
            >
              <NodesMenu onSelectNode={addNodeToEdge} />
            </Box>
          )}
        </ReactFlow>
      </Box>
    </Box>
  );
}

export default Flow;
