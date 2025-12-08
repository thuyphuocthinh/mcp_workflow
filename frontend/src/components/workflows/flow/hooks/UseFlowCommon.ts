import { useCallback } from 'react';
import type { Node } from '@xyflow/react';

export const useFlowCommon = () => {
    const generateUniqueName = useCallback(
        (baseLabel: string, nodes: Node[]) => {
            baseLabel = baseLabel[0].toUpperCase() + baseLabel.substring(1)
            const existingNames = nodes.map(node => node.data.label);
            let counter = 1;
            let newName = baseLabel;

            while (existingNames.includes(newName)) {
                counter++;
                newName = `${baseLabel}-${counter}`;
            }
            return newName[0].toUpperCase() + newName.substring(1);
        },
        [],
    );

    const reorderNodeNames = useCallback((nodeType: string, nodes: Node[]): Node[] => {
        const nodesOfType = nodes
          .filter(n => n.type === nodeType)
          .sort((a, b) => {
            // Lấy số cuối nếu có, nếu không số = 0
            const getNumber = (label: string) => {
              const match = label.match(new RegExp(`^${nodeType}(\\d+)?$`));
              return match && match[1] ? parseInt(match[1], 10) : 0;
            };
            return getNumber(a.data.label as string) - getNumber(b.data.label as string);
          });

        // Gán lại label liên tục
        const updatedNodes = nodes.map(n => {
          if (n.type !== nodeType) return n;

          const index = nodesOfType.findIndex(x => x.id === n.id);
          const baseLabel = nodeType[0].toUpperCase() + nodeType.substring(1);
          return {
            ...n,
            data: {
              ...n.data,
              label: index === 0 ? baseLabel : `${baseLabel}${index + 1}`,
            },
          };
        });

        return updatedNodes;
    }, []);

    const calculateEdgeCenter = useCallback((
      sourceNode: Node,
      targetNode: Node,
    ): { x: number; y: number } => {
      const sourceX = sourceNode.position.x + (sourceNode.width ?? 0) / 2;
      const sourceY = sourceNode.position.y + (sourceNode.height ?? 0) / 2;
      const targetX = targetNode.position.x + (targetNode.width ?? 0) / 2;
      const targetY = targetNode.position.y + (targetNode.height ?? 0) / 2;

      return {
        x: (sourceX + targetX) / 2,
        y: (sourceY + targetY) / 2,
      };
    }, []);

    return {
        generateUniqueName,
        reorderNodeNames,
        calculateEdgeCenter
    }
}