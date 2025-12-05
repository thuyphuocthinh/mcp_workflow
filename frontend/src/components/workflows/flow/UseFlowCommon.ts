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
    return {
        generateUniqueName
    }
}