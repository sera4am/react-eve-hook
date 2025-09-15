import { renderHook, act } from '@testing-library/react';
import useEve, { useEveListen, eve } from '../eve';

describe('useEve', () => {
  beforeEach(() => {
    // Reset any global state between tests
    jest.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should register and emit events', () => {
      const { result } = renderHook(() => useEve());
      const mockHandler = jest.fn();

      act(() => {
        result.current.on('test-event', mockHandler);
      });

      act(() => {
        result.current.emit('test-event', 'test-data');
      });

      expect(mockHandler).toHaveBeenCalledWith('test-data');
      expect(mockHandler).toHaveBeenCalledTimes(1);
    });

    it('should emit events without data', () => {
      const { result } = renderHook(() => useEve());
      const mockHandler = jest.fn();

      act(() => {
        result.current.on('simple-event', mockHandler);
      });

      act(() => {
        result.current.emit('simple-event');
      });

      expect(mockHandler).toHaveBeenCalledWith(undefined);
    });

    it('should handle multiple event types', () => {
      const { result } = renderHook(() => useEve());
      const mockHandler1 = jest.fn();
      const mockHandler2 = jest.fn();

      act(() => {
        result.current.on('event-1', mockHandler1);
        result.current.on('event-2', mockHandler2);
      });

      act(() => {
        result.current.emit('event-1', 'data-1');
        result.current.emit('event-2', 'data-2');
      });

      expect(mockHandler1).toHaveBeenCalledWith('data-1');
      expect(mockHandler2).toHaveBeenCalledWith('data-2');
      expect(mockHandler1).not.toHaveBeenCalledWith('data-2');
      expect(mockHandler2).not.toHaveBeenCalledWith('data-1');
    });

    it('should handle multiple handlers for the same event', () => {
      const { result } = renderHook(() => useEve());
      const mockHandler1 = jest.fn();
      const mockHandler2 = jest.fn();

      act(() => {
        result.current.on('same-event', mockHandler1);
        result.current.on('same-event', mockHandler2);
      });

      act(() => {
        result.current.emit('same-event', 'shared-data');
      });

      expect(mockHandler1).toHaveBeenCalledWith('shared-data');
      expect(mockHandler2).toHaveBeenCalledWith('shared-data');
    });
  });

  describe('duplicate prevention', () => {
    it('should prevent duplicate event registrations', () => {
      const { result } = renderHook(() => useEve());
      const mockHandler = jest.fn();

      act(() => {
        result.current.on('dup-event', mockHandler);
        result.current.on('dup-event', mockHandler); // Same handler, should be ignored
      });

      act(() => {
        result.current.emit('dup-event', 'data');
      });

      expect(mockHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('event removal', () => {
    it('should remove specific event handler', () => {
      const { result } = renderHook(() => useEve());
      const mockHandler1 = jest.fn();
      const mockHandler2 = jest.fn();

      act(() => {
        result.current.on('test-event', mockHandler1);
        result.current.on('test-event', mockHandler2);
      });

      act(() => {
        result.current.off('test-event', mockHandler1);
      });

      act(() => {
        result.current.emit('test-event', 'data');
      });

      expect(mockHandler1).not.toHaveBeenCalled();
      expect(mockHandler2).toHaveBeenCalledWith('data');
    });

    it('should remove all handlers for specific event', () => {
      const { result } = renderHook(() => useEve());
      const mockHandler1 = jest.fn();
      const mockHandler2 = jest.fn();

      act(() => {
        result.current.on('test-event', mockHandler1);
        result.current.on('test-event', mockHandler2);
        result.current.on('other-event', mockHandler1);
      });

      act(() => {
        result.current.off('test-event');
      });

      act(() => {
        result.current.emit('test-event', 'data1');
        result.current.emit('other-event', 'data2');
      });

      expect(mockHandler1).toHaveBeenCalledTimes(1); // Only from other-event
      expect(mockHandler1).toHaveBeenCalledWith('data2');
      expect(mockHandler2).not.toHaveBeenCalled();
    });

    it('should remove all handlers', () => {
      const { result } = renderHook(() => useEve());
      const mockHandler1 = jest.fn();
      const mockHandler2 = jest.fn();

      act(() => {
        result.current.on('event-1', mockHandler1);
        result.current.on('event-2', mockHandler2);
      });

      act(() => {
        result.current.off(); // Remove all
      });

      act(() => {
        result.current.emit('event-1', 'data1');
        result.current.emit('event-2', 'data2');
      });

      expect(mockHandler1).not.toHaveBeenCalled();
      expect(mockHandler2).not.toHaveBeenCalled();
    });

    it('should clear all handlers using clear method', () => {
      const { result } = renderHook(() => useEve());
      const mockHandler = jest.fn();

      act(() => {
        result.current.on('test-event', mockHandler);
      });

      act(() => {
        result.current.clear();
      });

      act(() => {
        result.current.emit('test-event', 'data');
      });

      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe('component unmount cleanup', () => {
    it('should automatically cleanup on unmount', () => {
      const mockHandler = jest.fn();
      const { result, unmount } = renderHook(() => useEve());

      act(() => {
        result.current.on('test-event', mockHandler);
      });

      unmount();

      // Create a new hook instance to test if the old handler was cleaned up
      const { result: newResult } = renderHook(() => useEve());

      act(() => {
        newResult.current.emit('test-event', 'data');
      });

      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe('type safety (runtime behavior)', () => {
    interface TestEvents {
      'user-login': { userId: string; name: string };
      'notification': { message: string; type: 'info' | 'error' };
      'simple-event': undefined;
    }

    it('should handle typed events correctly', () => {
      const { result } = renderHook(() => useEve<TestEvents>());
      const mockHandler = jest.fn();

      act(() => {
        result.current.on('user-login', mockHandler);
      });

      act(() => {
        result.current.emit('user-login', { userId: '123', name: 'John' });
      });

      expect(mockHandler).toHaveBeenCalledWith({ userId: '123', name: 'John' });
    });
  });
});

describe('useEveListen', () => {
  it('should register and cleanup event listener', () => {
    const mockHandler = jest.fn();

    const { unmount } = renderHook(() =>
      useEveListen('test-event', mockHandler)
    );

    act(() => {
      eve('test-event', 'test-data');
    });

    expect(mockHandler).toHaveBeenCalledWith('test-data');

    unmount();

    act(() => {
      eve('test-event', 'test-data-2');
    });

    expect(mockHandler).toHaveBeenCalledTimes(1); // Should not be called after unmount
  });

  it('should handle undefined handler', () => {
    expect(() => {
      renderHook(() => useEveListen('test-event', undefined));
    }).not.toThrow();
  });

  it('should re-register when handler changes', () => {
    const mockHandler1 = jest.fn();
    const mockHandler2 = jest.fn();

    const { rerender } = renderHook(
      ({ handler }) => useEveListen('test-event', handler),
      { initialProps: { handler: mockHandler1 } }
    );

    act(() => {
      eve('test-event', 'data-1');
    });

    expect(mockHandler1).toHaveBeenCalledWith('data-1');

    rerender({ handler: mockHandler2 });

    act(() => {
      eve('test-event', 'data-2');
    });

    expect(mockHandler1).toHaveBeenCalledTimes(1);
    expect(mockHandler2).toHaveBeenCalledWith('data-2');
  });
});

describe('eve (global emit)', () => {
  it('should emit events globally', () => {
    const { result } = renderHook(() => useEve());
    const mockHandler = jest.fn();

    act(() => {
      result.current.on('global-event', mockHandler);
    });

    act(() => {
      eve('global-event', 'global-data');
    });

    expect(mockHandler).toHaveBeenCalledWith('global-data');
  });

  it('should work across multiple components', () => {
    const { result: result1 } = renderHook(() => useEve());
    const { result: result2 } = renderHook(() => useEve());
    const mockHandler1 = jest.fn();
    const mockHandler2 = jest.fn();

    act(() => {
      result1.current.on('shared-event', mockHandler1);
      result2.current.on('shared-event', mockHandler2);
    });

    act(() => {
      eve('shared-event', 'shared-data');
    });

    expect(mockHandler1).toHaveBeenCalledWith('shared-data');
    expect(mockHandler2).toHaveBeenCalledWith('shared-data');
  });
});

describe('edge cases', () => {
  it('should handle removing non-existent handler gracefully', () => {
    const { result } = renderHook(() => useEve());
    const mockHandler = jest.fn();

    expect(() => {
      act(() => {
        result.current.off('non-existent', mockHandler);
      });
    }).not.toThrow();
  });

  it('should handle emitting to non-existent event gracefully', () => {
    const { result } = renderHook(() => useEve());

    expect(() => {
      act(() => {
        result.current.emit('non-existent', 'data');
      });
    }).not.toThrow();
  });

  it('should handle complex data types', () => {
    const { result } = renderHook(() => useEve());
    const mockHandler = jest.fn();
    const complexData = {
      nested: { value: 123 },
      array: [1, 2, 3],
      func: () => 'test'
    };

    act(() => {
      result.current.on('complex-event', mockHandler);
    });

    act(() => {
      result.current.emit('complex-event', complexData);
    });

    expect(mockHandler).toHaveBeenCalledWith(complexData);
  });
});