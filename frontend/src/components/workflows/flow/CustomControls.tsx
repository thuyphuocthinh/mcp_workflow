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
          backgroundColor: "rgba(20, 20, 30, 0.9)",
          backdropFilter: "blur(20px)",
          borderRadius: "12px",
          padding: "4px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Tooltip
          content="Zoom In"
          showArrow={true}
          positioning={{ placement: "right" }}
        >
          <ControlButton
            onClick={() => zoomIn()}
            style={{
              backgroundColor: "transparent",
              color: "#9ca3af",
              border: "none",
            }}
            className="custom-control-btn"
          >
            <FaPlus size={14} />
          </ControlButton>
        </Tooltip>

        <Tooltip
          content="Zoom Out"
          showArrow={true}
          positioning={{ placement: "right" }}
        >
          <ControlButton
            onClick={() => zoomOut()}
            style={{
              backgroundColor: "transparent",
              color: "#9ca3af",
              border: "none",
            }}
            className="custom-control-btn"
          >
            <FaMinus size={14} />
          </ControlButton>
        </Tooltip>

        <Tooltip
          content="Fit View"
          showArrow={true}
          positioning={{ placement: "right" }}
        >
          <ControlButton
            onClick={() => fitView()}
            style={{
              backgroundColor: "transparent",
              color: "#9ca3af",
              border: "none",
            }}
            className="custom-control-btn"
          >
            <FaExpand size={14} />
          </ControlButton>
        </Tooltip>

        <Tooltip
          content={locked ? "Unlock" : "Lock"}
          showArrow={true}
          positioning={{ placement: "right" }}
        >
          <ControlButton
            onClick={toggleLock}
            style={{
              backgroundColor: locked ? "rgba(99, 102, 241, 0.2)" : "transparent",
              color: locked ? "#a78bfa" : "#9ca3af",
              border: "none",
            }}
            className="custom-control-btn"
          >
            {locked ? <FaLock size={14} /> : <FaUnlock size={14} />}
          </ControlButton>
        </Tooltip>
      </Controls>

      <style>{`
        .custom-control-btn:hover {
          background-color: rgba(99, 102, 241, 0.2) !important;
          color: white !important;
        }
        .react-flow__controls-custom button {
          background-color: transparent;
          border: none;
          color: #9ca3af;
        }
        .react-flow__controls-custom button:hover {
          background-color: rgba(99, 102, 241, 0.2);
          color: white;
        }
      `}</style>
    </div>
  );
}
