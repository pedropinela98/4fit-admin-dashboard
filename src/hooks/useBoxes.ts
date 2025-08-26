import { useState, useEffect, useCallback } from 'react';
import { boxesService, type CreateBoxData, type UpdateBoxData } from '../services/boxes.service';
import type { Tables } from '../lib/database.types';

export type Box = Tables<'Box'>;

interface UseBoxesState {
  boxes: Box[];
  loading: boolean;
  error: string | null;
}

interface UseBoxesReturn extends UseBoxesState {
  refetch: () => Promise<void>;
  searchBoxes: (query: string) => Promise<void>;
  createBox: (boxData: CreateBoxData) => Promise<Box>;
  updateBox: (boxData: UpdateBoxData) => Promise<Box>;
  deleteBox: (boxId: string) => Promise<void>;
}

export function useBoxes(): UseBoxesReturn {
  const [state, setState] = useState<UseBoxesState>({
    boxes: [],
    loading: true,
    error: null,
  });

  const fetchBoxes = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await boxesService.getAllBoxes();
      setState({
        boxes: data,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching boxes:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load boxes',
      }));
    }
  }, []);

  const searchBoxes = useCallback(async (query: string) => {
    if (!query.trim()) {
      await fetchBoxes();
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await boxesService.searchBoxes(query);
      setState(prev => ({
        ...prev,
        boxes: data,
        loading: false,
      }));
    } catch (error) {
      console.error('Error searching boxes:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Search failed',
      }));
    }
  }, [fetchBoxes]);

  const createBox = useCallback(async (boxData: CreateBoxData): Promise<Box> => {
    try {
      const newBox = await boxesService.createBox(boxData);
      
      // Refresh the boxes list
      await fetchBoxes();
      
      return newBox;
    } catch (error) {
      console.error('Error creating box:', error);
      throw error;
    }
  }, [fetchBoxes]);

  const updateBox = useCallback(async (boxData: UpdateBoxData): Promise<Box> => {
    try {
      const updatedBox = await boxesService.updateBox(boxData);
      
      // Update the local state
      setState(prev => ({
        ...prev,
        boxes: prev.boxes.map(box => 
          box.id === updatedBox.id ? updatedBox : box
        ),
      }));

      return updatedBox;
    } catch (error) {
      console.error('Error updating box:', error);
      throw error;
    }
  }, []);

  const deleteBox = useCallback(async (boxId: string): Promise<void> => {
    try {
      await boxesService.deleteBox(boxId);
      
      // Remove from local state
      setState(prev => ({
        ...prev,
        boxes: prev.boxes.filter(box => box.id !== boxId),
      }));
    } catch (error) {
      console.error('Error deleting box:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchBoxes();
  }, [fetchBoxes]);

  return {
    ...state,
    refetch: fetchBoxes,
    searchBoxes,
    createBox,
    updateBox,
    deleteBox,
  };
}

// Hook for getting a single box with stats
export function useBox(boxId: string | undefined) {
  const [box, setBox] = useState<Box | null>(null);
  const [stats, setStats] = useState({ totalMembers: 0, totalClasses: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBox = useCallback(async () => {
    if (!boxId) {
      setBox(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const [boxData, statsData] = await Promise.all([
        boxesService.getBoxById(boxId),
        boxesService.getBoxStats(boxId)
      ]);
      
      setBox(boxData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching box:', error);
      setError(error instanceof Error ? error.message : 'Failed to load box');
      setBox(null);
    } finally {
      setLoading(false);
    }
  }, [boxId]);

  useEffect(() => {
    fetchBox();
  }, [fetchBox]);

  return {
    box,
    stats,
    loading,
    error,
    refetch: fetchBox,
  };
}