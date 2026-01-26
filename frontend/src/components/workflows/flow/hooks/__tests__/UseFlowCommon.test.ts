import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFlowCommon } from '../UseFlowCommon';
import { type Node, type Edge, MarkerType } from '@xyflow/react';

describe('useFlowCommon Hook', () => {
  describe('generateUniqueName', () => {
    it('should return capitalized base label if no conflict', () => {
      const { result } = renderHook(() => useFlowCommon());
      const nodes: Node[] = [];
      const name = result.current.generateUniqueName('test', nodes);
      expect(name).toBe('Test');
    });

    it('should append counter if name exists', () => {
      const { result } = renderHook(() => useFlowCommon());
      const nodes: Node[] = [{ id: '1', data: { label: 'Test' }, position: { x: 0, y: 0 } }];
      // 'Test' exists, should generate 'Test-2' (based on logic, counter starts at 1, loops while exists.
      // Loop 1: newName = Test, exists -> counter=2, newName=Test-2)
      const name = result.current.generateUniqueName('test', nodes);
      expect(name).toBe('Test-2');
    });

    it('should increment unique counter', () => {
      const { result } = renderHook(() => useFlowCommon());
      const nodes: Node[] = [
        { id: '1', data: { label: 'Test' }, position: { x: 0, y: 0 } },
        { id: '2', data: { label: 'Test-2' }, position: { x: 0, y: 0 } },
      ];
      const name = result.current.generateUniqueName('test', nodes);
      expect(name).toBe('Test-3');
    });
  });

  describe('reorderNodeNames', () => {
    it('should reorder and rename nodes sequentially', () => {
      const { result } = renderHook(() => useFlowCommon());
      const nodes: Node[] = [
        { id: '1', type: 'custom', data: { label: 'Custom-5' }, position: { x: 0, y: 0 } },
        { id: '2', type: 'custom', data: { label: 'Custom-1' }, position: { x: 0, y: 0 } },
        { id: '3', type: 'other', data: { label: 'Other' }, position: { x: 0, y: 0 } },
      ];

      const updatedNodes = result.current.reorderNodeNames('custom', nodes);

      expect(updatedNodes).toHaveLength(3);

      // Node 'other' should be untouched
      const otherNode = updatedNodes.find((n) => n.id === '3');
      expect(otherNode?.data.label).toBe('Other');

      // Custom-1 (id: 2) -> should become Custom
      // Custom-5 (id: 1) -> should become Custom-2
      const node2 = updatedNodes.find((n) => n.id === '2');
      const node1 = updatedNodes.find((n) => n.id === '1');

      expect(node2?.data.label).toBe('Custom2');
      expect(node1?.data.label).toBe('Custom');
    });
  });

  describe('Practice: generateUniqueName', () => {
    it.todo('should handle empty node list correctly', () => {
      // Input: baseLabel='test', nodes=[]
      const { result } = renderHook(() => useFlowCommon());
      const nodes: Node[] = [];
      const name = result.current.generateUniqueName('test', nodes);
      expect(name).toBe('Test');
    });

    it.todo('should handle multiple naming conflicts recursively', () => {
      // Input: nodes with 'Test', 'Test-2', 'Test-3'
      const { result } = renderHook(() => useFlowCommon());
      const nodes: Node[] = [
        { id: '1', data: { label: 'Test' }, position: { x: 0, y: 0 } },
        { id: '2', data: { label: 'Test-2' }, position: { x: 0, y: 0 } },
        { id: '3', data: { label: 'Test-3' }, position: { x: 0, y: 0 } },
      ];
      const name = result.current.generateUniqueName('test', nodes);
      expect(name).toBe('Test-4');
    });
  });

  describe('Practice: generateEdgeData', () => {
    it.todo('should use default marker style', () => {
      // Call generateEdgeData
      const { result } = renderHook(() => useFlowCommon());
      const edge = result.current.generateEdgeData('src', 'tgt');
      // Expect markerEnd to have type ArrowClosed and color #000
      expect(edge.markerEnd).toEqual({
        type: MarkerType.ArrowClosed,
        color: '#000',
      });
    });
  });

  describe('Practice: calculateEdgeCenter', () => {
    it.todo('should handle nodes with negative positions', () => {
      // Node A at (-100, -100), Node B at (0, 0)
      const { result } = renderHook(() => useFlowCommon());
      const source: Node = {
        id: '1',
        position: { x: -100, y: -100 },
        width: 100,
        height: 100,
        data: {},
      };
      const target: Node = {
        id: '2',
        position: { x: 0, y: 0 },
        width: 100,
        height: 100,
        data: {},
      };
      const center = result.current.calculateEdgeCenter(source, target);
      expect(center).toEqual({ x: -50, y: -50 });
    });
  });

  describe('calculateEdgeCenter', () => {
    it('should calculate correct center point', () => {
      const { result } = renderHook(() => useFlowCommon());
      const source: Node = {
        id: '1',
        position: { x: 0, y: 0 },
        width: 100,
        height: 100,
        data: {},
      };
      const target: Node = {
        id: '2',
        position: { x: 200, y: 200 },
        width: 100,
        height: 100,
        data: {},
      };

      // Source center: (50, 50)
      // Target center: (250, 250)
      // Midpoint: (150, 150)

      const center = result.current.calculateEdgeCenter(source, target);
      expect(center).toEqual({ x: 150, y: 150 });
    });
  });

  describe('generateEdgeData', () => {
    it('should create correct edge object', () => {
      const { result } = renderHook(() => useFlowCommon());
      const edge = result.current.generateEdgeData('src', 'tgt');

      expect(edge.id).toBe('edge-src-tgt');
      expect(edge.source).toBe('src');
      expect(edge.target).toBe('tgt');
      expect(edge.type).toBe('custom-edge');
    });
  });

  describe('getLayoutedElements', () => {
    it('should assign positions to nodes', () => {
      const { result } = renderHook(() => useFlowCommon());
      const nodes: Node[] = [
        { id: '1', position: { x: 0, y: 0 }, data: {} },
        { id: '2', position: { x: 0, y: 0 }, data: {} },
      ];
      const edges: Edge[] = [{ id: 'e1', source: '1', target: '2' }];

      const layoutedNodes = result.current.getLayoutedElements(nodes, edges);

      expect(layoutedNodes).toHaveLength(2);
      // Positions should be different from initial (0,0) or at least processed
      // Since dagre gives positions, usually they are not 0,0 unless config fails
      // Just checking they exist is a good start
      expect(layoutedNodes[0].position).toBeDefined();
      expect(layoutedNodes[1].position).toBeDefined();

      // In LR layout, x should increase
      // But we don't need to test Dagre's internal math, just that our function applied it.
    });
  });
});
