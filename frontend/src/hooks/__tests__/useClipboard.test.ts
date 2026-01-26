import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useClipboard } from '../useClipboard';
import useCustomToast from '../useCustomToast';

// Mock useCustomToast
vi.mock('../useCustomToast', () => ({
  default: vi.fn(),
}));

describe('useClipboard', () => {
  const mockShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useCustomToast as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      showToast: mockShowToast,
    });
  });

  it('should initialize with empty clipboard', () => {
    const { result } = renderHook(() => useClipboard<string>());
    expect(result.current.clipboard).toBeNull();
    expect(result.current.hasData).toBe(false);
  });

  it('should copy data to clipboard', () => {
    const { result } = renderHook(() => useClipboard<string>());

    act(() => {
      result.current.copy('test data');
    });

    expect(result.current.clipboard).toEqual({
      data: 'test data',
      type: 'copy',
    });
    expect(result.current.hasData).toBe(true);
  });

  it('should cut data to clipboard and call onRemove', () => {
    const { result } = renderHook(() => useClipboard<string>());
    const onRemove = vi.fn();

    act(() => {
      result.current.cut('test data', onRemove);
    });

    expect(result.current.clipboard).toEqual({
      data: 'test data',
      type: 'cut',
    });
    expect(onRemove).toHaveBeenCalledWith('test data');
  });

  it('should paste data and show toast', () => {
    const { result } = renderHook(() => useClipboard<string>());
    const onPaste = vi.fn();

    // Setup clipboard data
    act(() => {
      result.current.copy('test data');
    });

    act(() => {
      result.current.paste(onPaste);
    });

    expect(onPaste).toHaveBeenCalledWith('test data');
    expect(mockShowToast).toHaveBeenCalledWith('Success', 'Pasted Node Successfully', 'success');
    // Should keep clipboard after copy-paste
    expect(result.current.clipboard).not.toBeNull();
  });

  it('should clear clipboard after paste if type is cut', () => {
    const { result } = renderHook(() => useClipboard<string>());
    const onPaste = vi.fn();

    // Setup cut data
    act(() => {
      result.current.cut('test data', () => {});
    });

    act(() => {
      result.current.paste(onPaste);
    });

    expect(onPaste).toHaveBeenCalledWith('test data');
    expect(result.current.clipboard).toBeNull();
  });

  it('should do nothing on paste if clipboard is empty', () => {
    const { result } = renderHook(() => useClipboard<string>());
    const onPaste = vi.fn();

    act(() => {
      result.current.paste(onPaste);
    });

    expect(onPaste).not.toHaveBeenCalled();
    expect(mockShowToast).not.toHaveBeenCalled();
  });

  it('should clear clipboard manually', () => {
    const { result } = renderHook(() => useClipboard<string>());

    act(() => {
      result.current.copy('test data');
    });
    expect(result.current.hasData).toBe(true);

    act(() => {
      result.current.clear();
    });

    expect(result.current.clipboard).toBeNull();
    expect(result.current.hasData).toBe(false);
  });
});
