import { Controls, ControlButton, useReactFlow } from "@xyflow/react";
import { Tooltip } from "@/components/ui/tooltip";
import { FaPlus, FaMinus, FaExpand, FaLock, FaUnlock } from "react-icons/fa";

interface CustomControlsProps {
  locked: boolean;
  setLocked: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CustomControls({
  locked,
  setLocked,
}: CustomControlsProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const toggleLock = () => setLocked((prev) => !prev);

  return (
    <div>
      <Controls
        showZoom={false}
        showFitView={false}
        showInteractive={false}
        className="react-flow__controls-custom"
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "4px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Tooltip
          content="Zoom In"
          showArrow={true}
          positioning={{ placement: "right" }}
        >
          <ControlButton onClick={() => zoomIn()}>
            <FaPlus size={14} />
          </ControlButton>
        </Tooltip>

        <Tooltip
          content="Zoom Out"
          showArrow={true}
          positioning={{ placement: "right" }}
        >
          <ControlButton onClick={() => zoomOut()}>
            <FaMinus size={14} />
          </ControlButton>
        </Tooltip>

        <Tooltip
          content="Fit View"
          showArrow={true}
          positioning={{ placement: "right" }}
        >
          <ControlButton onClick={() => fitView()}>
            <FaExpand size={14} />
          </ControlButton>
        </Tooltip>

        <Tooltip
          content={locked ? "Unlock" : "Lock"}
          showArrow={true}
          positioning={{ placement: "right" }}
        >
          <ControlButton onClick={toggleLock}>
            {locked ? <FaLock size={14} /> : <FaUnlock size={14} />}
          </ControlButton>
        </Tooltip>
      </Controls>
    </div>
  );
}
