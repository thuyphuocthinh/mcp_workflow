// NodesMenu.tsx
import { VStack } from "@chakra-ui/react";
import { NodesList } from "./NodesList";

export const NodesMenu = ({
  onSelectNode,
}: {
  onSelectNode: (nodeType: string) => void;
}) => {
  return (
    <VStack height="full" borderRadius="md">
      <NodesList draggable={false} onSelect={onSelectNode} itemPadding={2} />
    </VStack>
  );
};
