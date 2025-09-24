import { useState, useEffect, useCallback } from 'react';
//import { roomsService, type CreateRoomData, type UpdateRoomData } from '../services/rooms.service';
import type { Tables } from '../lib/database.types';

export type Room = Tables<'Room'>;

/*interface UseRoomsState {
  rooms: Room[];
  loading: boolean;
  error: string | null;
}*/
/*
interface UseRoomsReturn extends UseRoomsState {
  refetch: () => Promise<void>;
  searchActiveRooms: (query: string) => Promise<void>;
  createRoom: (roomData: CreateRoomData) => Promise<Room>;
  updateRoom: (roomData: UpdateRoomData) => Promise<Room>;
  deleteRoom: (roomId: string) => Promise<void>;
}
*/
const initialRooms: Room[] = [
  {
    active: true,
    box_id: "1",
    capacity: 5,
    created_at: "2025-01-01T01:00:00Z",
    description: "Sala com as barras",
    id: "1",
    name: "Sala das Barras",
    updated_at: "2025-01-01T12:00:00Z"
  },
  {
    active: true,
    box_id: "2",
    capacity: 10,
    created_at: "2025-02-02T02:00:00Z",
    description: "Sala com os colchões e os elásticos",
    id: "2",
    name: "Sala dos Colchões",
    updated_at: "2025-02-02T02:00:00Z"
  },
  {
    active: true,
    box_id: "3",
    capacity: 15,
    created_at: "2025-03-03T03:00:00Z",
    description: "Sala com todas as máquinas",
    id: "3",
    name: "Sala das Máquinas",
    updated_at: "2025-03-03T03:00:00Z"
  },
];

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // simula fetch inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setRooms(initialRooms);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // refetch (simula reload)
  function refetch() {
    setRooms(initialRooms);
  }

  // adicionar sala
  function addRoom(newRoom: Omit<Room, "id" | "created_at">) {
    const room: Room = {
      ...newRoom,
      id: Date.now().toString(), // id único simples
      created_at: new Date().toISOString(),
    };
    setRooms((prev) => [...prev, room]);
  }

  // atualizar sala
  function updateRoom(id: string, updated: Partial<Room>) {
    setRooms((prev) =>
      prev.map((currentRoom) =>
        currentRoom.id === id
          ? { ...currentRoom, ...updated, updated_at: new Date().toISOString() }
          : currentRoom
      )
    );
  }

  // remover sala
  function deleteRoom(id: string) {
    setRooms((prev) => prev.filter((currentRoom) => currentRoom.id !== id));
  }

  return{
    rooms,
    loading,
    error,
    refetch,
    addRoom,
    updateRoom,
    deleteRoom
  };
/*
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
  */
}