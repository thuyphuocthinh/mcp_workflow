import { type FC, useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
  type Edge,
  Position,
} from "@xyflow/react";
import { IconButton } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";

type CustomEdgeData = {
  label?: string;
  onAddNode: (payload: { id: string; x: number; y: number }) => void;
};

const CustomEdge: FC<EdgeProps<Edge<CustomEdgeData>>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition = Position.Right,
  targetPosition = Position.Left,
  style,
  markerEnd,
  data,
}) => {
  const [hovered, setHovered] = useState(false);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ pointerEvents: "all" }} // cho phép nhận hover
    >
      {/* Edge chính */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: style?.stroke ?? "#000",
          strokeWidth: style?.strokeWidth ?? 2,
          strokeDasharray: style?.strokeDasharray,
          transition: style?.transition ?? "all 0.2s",
          cursor: "pointer",
        }}
        fill="none"
        markerEnd={markerEnd}
      />

      {/* Path invisible để dễ hover */}
      <path
        d={edgePath}
        stroke="transparent"
        strokeWidth={30}
        style={{ cursor: "pointer" }}
        fillOpacity={0}
      />

      {/* Label + nút */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          className="edge-label-renderer__custom-edge nodrag nopan"
        >
          {hovered && (
            <IconButton
              aria-label="Add node"
              size="sm"
              borderRadius="full"
              colorScheme="blue"
              _hover={{ transform: "scale(1.1)" }}
              _active={{ transform: "scale(0.95)" }}
              onClick={(e) => {
                e.stopPropagation();
                data?.onAddNode({
                  id,
                  x: labelX,
                  y: labelY,
                });
              }}
            >
              <FaPlus />
            </IconButton>
          )}
        </div>
      </EdgeLabelRenderer>
    </g>
  );
};

export default CustomEdge;
