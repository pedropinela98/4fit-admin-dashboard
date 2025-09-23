import { useState, useEffect, useCallback } from 'react';
import { roomsService, type CreateRoomData, type UpdateRoomData } from '../services/rooms.service';
import type { Tables } from '../lib/database.types';

export type Room = Tables<'Room'>;

interface UseRoomsState {
  rooms: Room[];
  loading: boolean;
  error: string | null;
}

interface UseRoomsReturn extends UseRoomsState {
  refetch: () => Promise<void>;
  searchActiveRooms: (query: string) => Promise<void>;
  createRoom: (roomData: CreateRoomData) => Promise<Room>;
  updateRoom: (roomData: UpdateRoomData) => Promise<Room>;
  deleteRoom: (roomId: string) => Promise<void>;
}

export function useRooms(): UseRoomsReturn {
  const [state, setState] = useState<UseRoomsState>({
    rooms: [],
    loading: true,
    error: null,
  });

  const fetchActiveRooms = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await roomsService.getAllActiveRooms();
      setState({
        rooms: data,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching active rooms:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load rooms',
      }));
    }
  }, []);

  const searchActiveRooms = useCallback(async (query: string) => {
    if (!query.trim()) {
      await fetchActiveRooms();
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await roomsService.searchActiveRooms(query);
      setState(prev => ({
        ...prev,
        rooms: data,
        loading: false,
      }));
    } catch (error) {
      console.error('Error searching active rooms:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Search failed',
      }));
    }
  }, [fetchActiveRooms]);

  const createRoom = useCallback(async (roomData: CreateRoomData): Promise<Room> => {
    try {
      const newRoom = await roomsService.createRoom(roomData);
      
      // Refresh the active rooms list
      await fetchActiveRooms();
      
      return newRoom;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }, [fetchActiveRooms]);

  const updateRoom = useCallback(async (roomData: UpdateRoomData): Promise<Room> => {
    try {
      const updatedRoom = await roomsService.updateRoom(roomData);
      
      // Update the local state
      setState(prev => ({
        ...prev,
        rooms: prev.rooms.map(room => 
          room.id === updatedRoom.id ? updatedRoom : room
        ),
      }));

      return updatedRoom;
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  }, []);

  const deleteRoom = useCallback(async (roomId: string): Promise<void> => {
    try {
      await roomsService.deleteRoom(roomId);
      
      // Remove from local state
      setState(prev => ({
        ...prev,
        rooms: prev.rooms.filter(room => room.id !== roomId),
      }));
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchActiveRooms();
  }, [fetchActiveRooms]);

  return {
    ...state,
    refetch: fetchActiveRooms,
    searchActiveRooms,
    createRoom,
    updateRoom,
    deleteRoom,
  };
}