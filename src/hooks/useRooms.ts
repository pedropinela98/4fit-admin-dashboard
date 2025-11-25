import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Room {
  id: string;
  box_id: string;
  name: string;
  capacity: number;
  description?: string | null;
  active: boolean;
  created_at: string;
  updated_at?: string | null;
}

export function useRooms(boxId: string) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('Room')
        .select('*')
        .eq('box_id', boxId)
        .order('name', { ascending: true });

      if (supabaseError) throw supabaseError;

      setRooms(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar salas');
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!boxId) return;
    
    fetchRooms();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('rooms_changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'Room',
          filter: `box_id=eq.${boxId}`
        },
        () => {
          fetchRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [boxId]);

  const updateRoom = async (roomId: string, updates: Partial<Room>) => {
    try {
      // Remove null values for Supabase compatibility
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== null)
      );

      const { error: supabaseError } = await supabase
        .from('Room')
        .update(cleanUpdates)
        .eq('id', roomId);

      if (supabaseError) throw supabaseError;

      // Atualizar localmente
      setRooms(prev => 
        prev.map(room => 
          room.id === roomId ? { ...room, ...updates } : room
        )
      );
    } catch (err) {
      console.error('Error updating room:', err);
      throw err;
    }
  };

  const createRoom = async (roomData: Omit<Room, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('Room')
        .insert(roomData)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      setRooms(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error creating room:', err);
      throw err;
    }
  };

  const deleteRoom = async (roomId: string) => {
    try {
      const { error: supabaseError } = await supabase
        .from('Room')
        .delete()
        .eq('id', roomId);

      if (supabaseError) throw supabaseError;

      setRooms(prev => prev.filter(room => room.id !== roomId));
    } catch (err) {
      console.error('Error deleting room:', err);
      throw err;
    }
  };

  return {
    rooms,
    loading,
    error,
    refetch: fetchRooms,
    updateRoom,
    createRoom,
    deleteRoom,
  };
}