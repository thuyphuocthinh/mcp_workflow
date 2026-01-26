import { describe, it, expect } from 'vitest';
import { getAvailableVariables } from '../workflowUtils';
import type { Node, Edge } from '@xyflow/react';
import type { NodeConfigItem } from '../../components/workflows/nodes/baseConfig/nodeConfig';

// Mock types for our specific use case
interface NodeData {
  label?: string;
  [key: string]: unknown;
}

describe('getAvailableVariables', () => {
  // Test Case 1: Direct Parent -> Child
  it('should retrieve variables from direct parent nodes', () => {
    const nodes: Node<NodeData>[] = [
      { id: '1', type: 'textInput', data: { label: 'Input Node' }, position: { x: 0, y: 0 } },
      { id: '2', type: 'processor', data: { label: 'Process Node' }, position: { x: 100, y: 0 } },
    ];

    const edges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }];

    const nodeConfig = {
      textInput: {
        outputVariables: ['text'],
      },
    } as unknown as Record<string, NodeConfigItem>;

    const variables = getAvailableVariables('2', nodes, edges, nodeConfig);

    expect(variables).toHaveLength(1);
    expect(variables[0]).toEqual({
      nodeId: '1',
      variableName: 'Input Node.text',
      variableType: 'string',
      nodeLabel: 'Input Node',
      rawVariableName: 'text',
    });
  });

  // Test Case 2: Ancestors (Grandparent -> Parent -> Child)
  it('should retrieve variables from ancestor nodes (chaining)', () => {
    const nodes: Node<NodeData>[] = [
      { id: '1', type: 'start', data: { label: 'Start' }, position: { x: 0, y: 0 } },
      { id: '2', type: 'middle', data: { label: 'Middle' }, position: { x: 0, y: 100 } },
      { id: '3', type: 'end', data: { label: 'End' }, position: { x: 0, y: 200 } },
    ];

    const edges: Edge[] = [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
    ];

    const nodeConfig = {
      start: { outputVariables: ['initialData'] },
      middle: { outputVariables: ['processedData'] },
    } as unknown as Record<string, NodeConfigItem>;

    const variables = getAvailableVariables('3', nodes, edges, nodeConfig);

    expect(variables).toHaveLength(2);
    expect(variables.map((v) => v.variableName)).toContain('Start.initialData');
    expect(variables.map((v) => v.variableName)).toContain('Middle.processedData');
  });

  // Test Case 3: Key Branching (Merging multiple parents)
  it('should retrieve variables from multiple branches', () => {
    const nodes: Node<NodeData>[] = [
      { id: 'A', type: 'sourceA', data: { label: 'Source A' }, position: { x: 0, y: 0 } },
      { id: 'B', type: 'sourceB', data: { label: 'Source B' }, position: { x: 100, y: 0 } },
      { id: 'C', type: 'merge', data: { label: 'Merge' }, position: { x: 50, y: 100 } },
    ];

    const edges: Edge[] = [
      { id: 'eA-C', source: 'A', target: 'C' },
      { id: 'eB-C', source: 'B', target: 'C' },
    ];

    const nodeConfig = {
      sourceA: { outputVariables: ['dataA'] },
      sourceB: { outputVariables: ['dataB'] },
    } as unknown as Record<string, NodeConfigItem>;

    const variables = getAvailableVariables('C', nodes, edges, nodeConfig);

    expect(variables).toHaveLength(2);
    expect(variables.map((v) => v.variableName)).toContain('Source A.dataA');
    expect(variables.map((v) => v.variableName)).toContain('Source B.dataB');
  });

  // Test Case 4: Cyclical Graph
  it('should handle cycles gracefully and not infinite loop', () => {
    const nodes: Node<NodeData>[] = [
      { id: '1', type: 'node', data: { label: 'Node 1' }, position: { x: 0, y: 0 } },
      { id: '2', type: 'node', data: { label: 'Node 2' }, position: { x: 0, y: 100 } },
    ];

    // Cycle 1 -> 2 -> 1
    const edges: Edge[] = [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-1', source: '2', target: '1' },
    ];

    const nodeConfig = {
      node: { outputVariables: ['output'] },
    } as unknown as Record<string, NodeConfigItem>;

    // Checking from Node 1, it should find Node 2 as parent, and stop there (avoid re-visiting Node 1)
    const variables = getAvailableVariables('1', nodes, edges, nodeConfig);

    expect(variables).toHaveLength(1);
    expect(variables[0].nodeId).toBe('2');
  });

  // Test Case 5: Dynamic Output Variables (Function)
  it('should support outputVariables as a function', () => {
    const nodes: Node<NodeData>[] = [
      {
        id: '1',
        type: 'dynamic',
        data: { label: 'Dynamic Node', customFields: ['field1', 'field2'] },
        position: { x: 0, y: 0 },
      },
      { id: '2', type: 'receiver', data: {}, position: { x: 0, y: 100 } },
    ];

    const edges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }];

    const nodeConfig = {
      dynamic: {
        outputVariables: (data: { customFields: string[] }) =>
          data.customFields.map((f: string) => ({ name: f, type: 'string' })),
      },
    } as unknown as Record<string, NodeConfigItem>;

    const variables = getAvailableVariables('2', nodes, edges, nodeConfig);

    expect(variables).toHaveLength(2);
    expect(variables.find((v) => v.rawVariableName === 'field1')).toBeTruthy();
    expect(variables.find((v) => v.rawVariableName === 'field2')).toBeTruthy();
  });

  // Test Case 6: Fallback when Label is missing
  it('should use Node ID if Label is missing', () => {
    const nodes: Node<NodeData>[] = [
      { id: 'node-123', type: 'test', data: {}, position: { x: 0, y: 0 } }, // No label
      { id: 'target', type: 'target', data: {}, position: { x: 0, y: 100 } },
    ];

    const edges: Edge[] = [{ id: 'e1', source: 'node-123', target: 'target' }];

    const nodeConfig = {
      test: { outputVariables: ['val'] },
    } as unknown as Record<string, NodeConfigItem>;

    const variables = getAvailableVariables('target', nodes, edges, nodeConfig);

    expect(variables[0].nodeLabel).toBe('node-123');
    expect(variables[0].variableName).toBe('node-123.val');
  });
});
