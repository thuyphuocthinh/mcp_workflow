import React from "react";
import { Handle, type NodeProps, Position } from "@xyflow/react";

import { nodeConfig } from "../baseConfig/nodeConfig";
import { BaseNode } from "../baseConfig/BaseNode";

const IfElseNode: React.FC<NodeProps> = (props) => {
  const { icon: Icon, colorScheme } = nodeConfig.ifelse;

  return (
    <BaseNode {...props} icon={<Icon />} colorScheme={colorScheme}>
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{
          background: "#3182ce",
          width: 22,
          height: 22,
          border: "2px solid white",
          transition: "all 0.2s",
        }}
        className="custom-handle"
      />
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

export default React.memo(IfElseNode);
