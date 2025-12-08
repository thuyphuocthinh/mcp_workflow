import type { XYPosition } from "@xyflow/react";

function MiniMapNode({ x, y }: XYPosition) {
  const width = 50;
  const height = 30;

  return (
    <rect
      x={x - width / 2} // để rect nằm center tại (x, y)
      y={y - height / 2}
      width={width}
      height={height}
      rx={4} // bo góc nhẹ, muốn vuông thì xoá
      ry={4}
    />
  );
}

export default MiniMapNode;
