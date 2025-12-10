// NodesSidebar.tsx
import { VStack, Box, Text } from "@chakra-ui/react";
import { NodesList } from "./NodesList";

const onDragStart = (
  event: React.DragEvent<HTMLDivElement>,
  nodeType: string
) => {
  event.dataTransfer.setData("application/reactflow", nodeType);
  event.dataTransfer.effectAllowed = "copyMove";

  const target = event.currentTarget as HTMLDivElement;
  const clone = target.cloneNode(true) as HTMLElement;

  clone.style.background = "white";
  clone.style.boxShadow = "0 4px 8px rgba(0,0,0,0.5)";
  clone.style.border = "1px solid #CBD5E0";
  clone.style.borderRadius = "6px";
  clone.style.width = "200px";
  clone.style.position = "absolute";
  clone.style.top = "-1000px";

  document.body.appendChild(clone);

  event.dataTransfer.setDragImage(
    clone,
    clone.offsetWidth / 2,
    clone.offsetHeight / 2
  );

  setTimeout(() => document.body.removeChild(clone), 0);
};

export const NodesSidebar = () => {
  return (
    <VStack height="full">
      <Box
        p={4}
        borderBottom="1px solid"
        borderColor="gray.200"
        bg="gray.50"
        width="100%"
      >
        <Text
          fontSize="sm"
          fontWeight="bold"
          color="gray.600"
          textTransform="uppercase"
          letterSpacing="0.8px"
        >
          Nodes
        </Text>
      </Box>

      <NodesList draggable onDragStart={onDragStart} />
    </VStack>
  );
};
