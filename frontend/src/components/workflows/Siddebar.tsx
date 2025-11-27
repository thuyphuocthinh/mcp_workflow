import { useNodes } from "@xyflow/react";

function Sidebar() {
  // This hook will only work if the component it's used in is a child of a
  // <ReactFlowProvider />.
  const nodes = useNodes();

  return (
    <aside>
      {nodes.map((node) => (
        <div key={node.id}>
          Node {node.id} - x: {node.position.x.toFixed(2)}, y:{" "}
          {node.position.y.toFixed(2)}
        </div>
      ))}
    </aside>
  );
}

export default Sidebar;
