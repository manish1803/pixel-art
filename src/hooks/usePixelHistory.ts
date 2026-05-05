import { useState, useCallback } from 'react';

export function usePixelHistory(initialState: { [key: string]: string } = {}) {
  const [pixels, setPixels] = useState<{ [key: string]: string }>(initialState);
  const [history, setHistory] = useState<{ [key: string]: string }[]>([initialState]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const updatePixelsWithHistory = useCallback((newPixels: { [key: string]: string }) => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.slice(0, historyIndex + 1);
      newHistory.push(newPixels);
      return newHistory;
    });
    setHistoryIndex(prevIndex => prevIndex + 1);
    setPixels(newPixels);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(i => i - 1);
      setPixels(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(i => i + 1);
      setPixels(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const clearHistory = useCallback(() => {
    setPixels({});
    setHistory([{}]);
    setHistoryIndex(0);
  }, []);

  return {
    pixels,
    setPixels,
    history,
    historyIndex,
    updatePixelsWithHistory,
    undo,
    redo,
    clearHistory
  };
}
