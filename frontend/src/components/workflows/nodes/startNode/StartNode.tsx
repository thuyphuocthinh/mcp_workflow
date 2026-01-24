import React from "react";
import { Handle, type NodeProps, Position } from "@xyflow/react";

import { nodeConfig } from "../baseConfig/nodeConfig";
import { BaseNode } from "../baseConfig/BaseNode";

const StartNode: React.FC<NodeProps> = (props) => {
  const { icon: Icon, colorScheme } = nodeConfig.start;

  return (
    <BaseNode {...props} icon={<Icon />} colorScheme={colorScheme}>
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{
          background: "#3182ce",
          width: 22,
          height: 22,
          border: "2px solid white",
          transition: "all 0.2s",
        }}
        className="custom-handle"
      />
    </BaseNode>
  );
};

export default React.memo(StartNode);
