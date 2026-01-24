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

  // Dark theme drag ghost with visible text
  clone.style.background = "rgba(30, 30, 45, 0.98)";
  clone.style.boxShadow = "0 8px 32px rgba(99, 102, 241, 0.4)";
  clone.style.border = "2px solid rgba(99, 102, 241, 0.6)";
  clone.style.borderRadius = "12px";
  clone.style.width = "180px";
  clone.style.padding = "8px 12px";
  clone.style.position = "absolute";
  clone.style.top = "-1000px";
  clone.style.color = "white";

  // Make text visible in clone
  const textElements = clone.querySelectorAll("p, span");
  textElements.forEach((el) => {
    (el as HTMLElement).style.color = "#e5e7eb";
  });

  // Make icons visible
  const svgElements = clone.querySelectorAll("svg");
  svgElements.forEach((el) => {
    el.style.color = "white";
  });

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
    <VStack
      height="full"
      bg="linear-gradient(180deg, rgba(20, 20, 30, 0.98) 0%, rgba(15, 15, 25, 0.98) 100%)"
    >
      <Box
        p={4}
        pt={3}
        borderBottom="1px solid"
        borderColor="rgba(255, 255, 255, 0.08)"
        bg="rgba(99, 102, 241, 0.1)"
        width="100%"
      >
        <Text
          fontSize="sm"
          fontWeight="bold"
          color="gray.300"
          textTransform="uppercase"
          letterSpacing="1px"
        >
          Nodes
        </Text>
      </Box>

      <NodesList draggable onDragStart={onDragStart} />
    </VStack>
  );
};
