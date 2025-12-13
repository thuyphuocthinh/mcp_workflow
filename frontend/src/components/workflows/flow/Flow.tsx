import { Box, HStack, IconButton, Menu, Portal } from "@chakra-ui/react";
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
import {
  FaCopy,
  FaCut,
  FaGripHorizontal,
  FaPaste,
  FaUndo,
  FaRedo,
} from "react-icons/fa";

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
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    copyNode,
    cutNode,
    pasteNode,
    clipboard,
    undo,
    redo,
    canUndo,
    canRedo,
    setEdgesRaw,
    setNodesRaw,
  } = useFlowState({
    initNodes: initialNodes,
    initEdges: initialEdges,
  });
  const reactFlowInstance = useReactFlow();
  const {
    generateUniqueName,
    reorderNodeNames,
    generateEdgeData,
    getLayoutedElements,
  } = useFlowCommon();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("");
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed((v) => !v);
  const [locked, setLocked] = useState(false);
  const { onNodeContextMenu, contextMenu, closeContextMenu } = useContextMenu();
  const { showToast } = useCustomToast();
  const selectedNode = useMemo(() => {
    return nodes.find((node) => node.id === selectedNodeId);
  }, [selectedNodeId]);
  const [showNodesMenu, setShowNodesMenu] = useState(false);
  const [selectedEdgeId, setSelectedEdgeId] = useState("");
  const [nodeMenuPosition, setNodeMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleUndo = useCallback(() => {
    const prev = undo();
    if (!prev) return;

    setNodesRaw(prev.nodes);
    setEdgesRaw(prev.edges);
  }, [undo, setNodesRaw, setEdgesRaw]);

  const handleRedo = useCallback(() => {
    const next = redo();
    if (!next) return;

    setNodesRaw(next.nodes);
    setEdgesRaw(next.edges);
  }, [redo, setNodesRaw, setEdgesRaw]);

  const handleMouseMove = (evt: React.MouseEvent<HTMLDivElement>) => {
    if (!reactFlowInstance) return;

    const bounds = evt.currentTarget.getBoundingClientRect(); // canvas rect

    // Vị trí chuột relative to canvas
    const x = evt.clientX - bounds.left;
    const y = evt.clientY - bounds.top;

    // Convert sang flow coordinate (tính pan & zoom)
    const flowX =
      (x - reactFlowInstance.getViewport().x) /
      reactFlowInstance.getViewport().zoom;
    const flowY =
      (y - reactFlowInstance.getViewport().y) /
      reactFlowInstance.getViewport().zoom;

    setMousePos({ x: flowX, y: flowY });
  };

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

  const handleCopyNode = useCallback(() => {
    if (selectedNodeId) {
      if (NO_ACTION_NODES.includes(selectedNode?.type as string)) return;
      copyNode(selectedNodeId);
    }
  }, [selectedNodeId]);

  const handleCutNode = useCallback(() => {
    if (selectedNodeId) {
      if (NO_ACTION_NODES.includes(selectedNode?.type as string)) return;
      cutNode(selectedNodeId);
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === selectedNodeId) {
            return {
              ...n,
              data: {
                ...n.data,
                isCut: true,
              },
            };
          }
          return n;
        })
      );
    }
  }, [selectedNodeId]);

  const handlePasteNode = useCallback(() => {
    pasteNode((raw) => {
      const oldNode = JSON.parse(raw as string) as CustomNode;
      if (clipboard?.type === "copy") {
        const baseLabel = oldNode.data.label.replace(/\(copy.*\)/, "").trim();
        const existingCopyCount = nodes.filter((n: Node) => {
          const nBaseLabel = (n as CustomNode).data.label
            .replace(/\(copy.*\)/, "")
            .trim();
          return (
            nBaseLabel === baseLabel &&
            (n as CustomNode).data.label.toLowerCase().includes("copy")
          );
        }).length;

        const newLabel =
          existingCopyCount === 0
            ? `${baseLabel}(copy)`
            : `${baseLabel}(copy ${existingCopyCount + 1})`;

        const newNode: Node = {
          ...oldNode,
          id: `${oldNode.type}-${v4()}`,
          position: mousePos ?? oldNode.position,
          data: {
            ...oldNode.data,
            label: newLabel,
          },
        };
        setNodes((nds) => [...nds, newNode]);
      } else if (clipboard?.type === "cut") {
        const cutNode = oldNode as CustomNode;
        setNodes((nds) => nds.filter((n) => n.id !== cutNode.id));

        setEdges((eds) =>
          eds.filter(
            (edge) => edge.source !== cutNode.id && edge.target !== cutNode.id
          )
        );

        const newNode: CustomNode = {
          ...cutNode,
          id: `${cutNode.type}-${v4()}`,
          position: mousePos ?? cutNode.position,
        };

        setNodes((nds) => [...nds, newNode]);
      }
    });
  }, [nodes, mousePos]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedNodeId) {
          deleteNode(selectedNodeId);
        }
      }
      if (event.ctrlKey) {
        if (event.key === "c") {
          handleCopyNode();
        }
        if (event.key === "x") {
          handleCutNode();
        }
        if (event.key === "v") {
          handlePasteNode();
        }
        if (event.key === "z") {
          if (canUndo()) {
            handleUndo();
          }
        }

        if (event.key === "y") {
          if (canRedo()) {
            handleRedo();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedNodeId,
    deleteNode,
    handlePasteNode,
    handleCopyNode,
    handleCutNode,
  ]);

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

  const handleAutoLayout = useCallback(() => {
    const layoutedNodes = getLayoutedElements(nodes, edges, {
      nodeWidth: 200,
      nodeHeight: 100,
      rankSpacing: 80,
      nodeSpacing: 20,
    });

    const style = document.createElement("style");
    style.textContent = `
      .react-flow__node-animated {
        transition: all 0.5s ease-in-out;
      }
    `;
    document.head.appendChild(style);

    setNodes(layoutedNodes);

    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2 });
      document.head.removeChild(style);
      setNodes((nodes) =>
        nodes.map((node) => ({
          ...node,
          className: node.className?.replace("react-flow__node-animated", ""),
        }))
      );
    }, 500);
  }, [nodes, edges, reactFlowInstance, setNodes]);

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
          onMouseMove={handleMouseMove}
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

          {/* Clipboard Panel */}
          <Panel
            position="top-left"
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "4px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              marginLeft: "2rem",
            }}
          >
            <HStack>
              {/* Undo */}
              <Tooltip
                content="Undo"
                positioning={{ placement: "bottom" }}
                showArrow
              >
                <IconButton
                  aria-label="Undo"
                  size="xs"
                  variant="ghost"
                  colorScheme="gray"
                  disabled={!canUndo()}
                  onClick={handleUndo}
                  transition="all 0.2s"
                  _hover={{
                    bg: "gray.100",
                    transform: "scale(1.1)",
                  }}
                  _active={{
                    transform: "scale(0.95)",
                  }}
                >
                  <FaUndo size={12} />
                </IconButton>
              </Tooltip>

              {/* Redo */}
              <Tooltip
                content="Redo"
                positioning={{ placement: "bottom" }}
                showArrow
              >
                <IconButton
                  aria-label="Redo"
                  size="xs"
                  disabled={!canRedo()}
                  onClick={handleRedo}
                  variant="ghost"
                  colorScheme="gray"
                  transition="all 0.2s"
                  _hover={{
                    bg: "gray.100",
                    transform: "scale(1.1)",
                  }}
                  _active={{
                    transform: "scale(0.95)",
                  }}
                >
                  <FaRedo size={12} />
                </IconButton>
              </Tooltip>

              {/* Copy */}
              <Tooltip
                content="Copy"
                positioning={{ placement: "bottom" }}
                showArrow
              >
                <IconButton
                  aria-label="Copy node"
                  size="xs"
                  variant="ghost"
                  colorScheme="gray"
                  disabled={
                    !selectedNodeId ||
                    NO_ACTION_NODES.includes(selectedNode?.type as string)
                  }
                  onClick={handleCopyNode}
                  transition="all 0.2s"
                  _hover={{
                    bg: "gray.100",
                    transform: "scale(1.1)",
                  }}
                  _active={{
                    transform: "scale(0.95)",
                  }}
                >
                  <FaCopy size={12} />
                </IconButton>
              </Tooltip>

              {/* Cut */}
              <Tooltip
                content="Cut"
                positioning={{ placement: "bottom" }}
                showArrow
              >
                <IconButton
                  aria-label="Cut node"
                  size="xs"
                  variant="ghost"
                  colorScheme="gray"
                  disabled={
                    !selectedNodeId ||
                    NO_ACTION_NODES.includes(selectedNode?.type as string)
                  }
                  onClick={handleCutNode}
                  transition="all 0.2s"
                  _hover={{
                    bg: "gray.100",
                    transform: "scale(1.1)",
                  }}
                  _active={{
                    transform: "scale(0.95)",
                  }}
                >
                  <FaCut size={12} />
                </IconButton>
              </Tooltip>

              {/* Paste */}
              <Tooltip
                content="Paste"
                positioning={{ placement: "bottom" }}
                showArrow
              >
                <IconButton
                  aria-label="Paste node"
                  size="xs"
                  variant="ghost"
                  colorScheme="gray"
                  disabled={!clipboard?.data}
                  onClick={handlePasteNode}
                  transition="all 0.2s"
                  _hover={{
                    bg: "gray.100",
                    transform: "scale(1.1)",
                  }}
                  _active={{
                    transform: "scale(0.95)",
                  }}
                >
                  <FaPaste size={12} />
                </IconButton>
              </Tooltip>
            </HStack>
          </Panel>

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
          {/* Auto Layout */}
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
              content="Auto Layout"
              positioning={{ placement: "right" }}
              showArrow={true}
            >
              <IconButton
                aria-label="Auto layout"
                size="sm"
                variant="ghost"
                colorScheme="gray"
                onClick={handleAutoLayout}
                transition="all 0.2s"
                _hover={{
                  bg: "gray.100",
                  transform: "scale(1.1)",
                }}
                _active={{
                  transform: "scale(0.95)",
                }}
              >
                <FaGripHorizontal />
              </IconButton>
            </Tooltip>
          </Panel>
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
              marginLeft: "7.5rem",
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
                      value="Copy node"
                      borderRadius="lg"
                      transition="all 0.2s"
                      _hover={{
                        bg: "red.50",
                        color: "red.500",
                      }}
                      onClick={handleCopyNode}
                    >
                      Copy Node
                    </Menu.Item>
                    <Menu.Item
                      cursor={"pointer"}
                      onClick={handleCutNode}
                      value="Cut node"
                      borderRadius="lg"
                      transition="all 0.2s"
                      _hover={{
                        bg: "red.50",
                        color: "red.500",
                      }}
                    >
                      Cut Node
                    </Menu.Item>
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
