import { ReactFlowProvider } from "@xyflow/react";
import Flow from "./Flow";

const FlowProvider = () => {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
};

export default FlowProvider;
