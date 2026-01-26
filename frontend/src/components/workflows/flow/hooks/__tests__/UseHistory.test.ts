import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useHistory } from '../UseHistory';
import type { FlowSnapshot } from '../UseHistory';

// Mock data
const snapshotA: FlowSnapshot = {
  nodes: [{ id: '1', position: { x: 0, y: 0 }, data: { label: 'A' } }],
  edges: [],
};

const snapshotB: FlowSnapshot = {
  nodes: [{ id: '1', position: { x: 10, y: 10 }, data: { label: 'A' } }],
  edges: [],
};

const snapshotC: FlowSnapshot = {
  nodes: [{ id: '1', position: { x: 20, y: 20 }, data: { label: 'A' } }],
  edges: [],
};

describe('useHistory Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // 1. Test cụ thể (Example Test)
  it('should push new state to history', () => {
    const { result } = renderHook(() => useHistory());

    // Initially history is empty
    expect(result.current.canUndo()).toBe(false);

    // Act: Push first snapshot
    act(() => {
      result.current.push(snapshotA);
    });

    // Need to advance time because of throttle (default 300ms)
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Push second snapshot (must be different)
    act(() => {
      result.current.push(snapshotB);
    });

    // Assert
    expect(result.current.canUndo()).toBe(true);
  });

  describe('Undo/Redo Logic', () => {
    it('should undo to previous state correctly', () => {
      // Gợi ý:
      // 1. Push A -> wait -> Push B
      const { result } = renderHook(() => useHistory());
      act(() => {
        result.current.push(snapshotA);
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });
      act(() => {
        result.current.push(snapshotB);
      });

      // 2. Gọi undo()
      let undoResult;
      act(() => {
        undoResult = result.current.undo();
      });

      // 3. Expect kết quả trả về là snapshotA
      expect(result.current.canUndo()).toBe(false);
      expect(result.current.canRedo()).toBe(true);
      expect(undoResult).toEqual(snapshotA);
    });

    it('should redo to next state correctly', () => {
      // Gợi ý:
      // 1. Push A -> wait -> Push B
      const { result } = renderHook(() => useHistory());
      act(() => {
        result.current.push(snapshotA);
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });
      act(() => {
        result.current.push(snapshotB);
      });

      // 2. Undo() -> quay về A
      act(() => {
        result.current.undo();
      });

      // 3. Redo()
      let redoResult;
      act(() => {
        redoResult = result.current.redo();
      });

      // 4. Expect kết quả trả về là snapshotB
      expect(result.current.canUndo()).toBe(true);
      expect(result.current.canRedo()).toBe(false);
      expect(redoResult).toEqual(snapshotB);
    });

    it('should not undo if history is empty', () => {
      // Gợi ý: Gọi undo() khi chưa push gì, expect return null
      const { result } = renderHook(() => useHistory());
      act(() => {
        result.current.undo();
      });
      expect(result.current.canUndo()).toBe(false);
      expect(result.current.canRedo()).toBe(false);
      expect(result.current.undo()).toEqual(null);
    });
  });

  describe('Throttle & Optimization', () => {
    it('should ignore updates within throttle period', () => {
      // Gợi ý:
      // 1. Push A
      const { result } = renderHook(() => useHistory());
      act(() => {
        result.current.push(snapshotA);
      });
      // 2. Push B ngay lập tức (không advance timers)
      act(() => {
        result.current.push(snapshotB);
      });
      // 3. Expect history vẫn chỉ có A (hoặc check canUndo vẫn false nếu A là cái đầu tiên)
      expect(result.current.canUndo()).toBe(false);
      expect(result.current.canRedo()).toBe(false);
      expect(result.current.undo()).toEqual(null);
    });

    it('should ignore identical snapshots', () => {
      // Gợi ý:
      // 1. Push A -> wait
      const { result } = renderHook(() => useHistory());
      act(() => {
        result.current.push(snapshotA);
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });
      // 2. Push A again (clone của A)
      act(() => {
        result.current.push(snapshotA);
      });
      // 3. Expect không có history mới được thêm vào
      expect(result.current.canUndo()).toBe(false);
      expect(result.current.canRedo()).toBe(false);
      expect(result.current.undo()).toEqual(null);
    });
  });

  describe('History Limit', () => {
    it('should respect maxHistory limit', () => {
      // Gợi ý:
      // init hook với maxHistory = 2
      const { result } = renderHook(() => useHistory(300, 2));
      // Push A -> wait -> Push B -> wait -> Push C
      act(() => {
        result.current.push(snapshotA);
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });
      act(() => {
        result.current.push(snapshotB);
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });
      act(() => {
        result.current.push(snapshotC);
      });
      // Kiểm tra xem A có bị xóa khỏi history không (khi undo kịch kim)
      expect(result.current.canUndo()).toBe(true);
      expect(result.current.canRedo()).toBe(false);
      expect(result.current.undo()).toEqual(snapshotB);
    });
  });
});
