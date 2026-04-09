"use client";

import { useState, useCallback } from "react";

interface UndoRedoState {
  past: string[];
  present: string;
  future: string[];
}

export function useUndoRedo(initialValue: string = "") {
  const [state, setState] = useState<UndoRedoState>({
    past: [],
    present: initialValue,
    future: [],
  });

  const updatePresent = useCallback((newPresent: string) => {
    setState((prev) => ({
      past: [...prev.past, prev.present],
      present: newPresent,
      future: [],
    }));
  }, []);

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.past.length === 0) return prev;
      const newPresent = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, -1);
      return {
        past: newPast,
        present: newPresent,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((prev) => {
      if (prev.future.length === 0) return prev;
      const newPresent = prev.future[0];
      const newFuture = prev.future.slice(1);
      return {
        past: [...prev.past, prev.present],
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  return {
    text: state.present,
    updatePresent,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
