import { supabase } from '../lib/supabase';
import type { Tables, TablesInsert, TablesUpdate } from '../lib/database.types';

export type Room = Tables<'Room'>;

export type CreateRoomData = {
  active?: boolean;
  capacity: number;
  description: string | null;
  name: string;
};

export type UpdateRoomData = Partial<CreateRoomData> & {
  id: string;
};

class RoomsService {
  /**
   * Get all rooms
   */
  async getAllRooms() {
    const { data, error } = await supabase
      .from('Room')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get all active rooms
   */
  async getAllActiveRooms() {
    const { data, error } = await supabase
      .from('Room')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get a single room by ID
   */
  async getRoomById(roomId: string) {
    const { data, error } = await supabase
      .from('Room')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get a single active room by ID
   */
  async getActiveRoomById(roomId: string) {
    const { data, error } = await supabase
      .from('Room')
      .select('*')
      .eq('id', roomId)
      .eq('active', true)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create a new room
   */
  async createRoom(roomData: CreateRoomData) {
    const roomInsert: TablesInsert<'Room'> = {
      active: roomData.active ?? true,
      capacity: roomData.capacity,
      description: roomData.description || null,
      name: roomData.name
    };

    const { data, error } = await supabase
      .from('Room')
      .insert(roomInsert)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update room information
   */
  async updateRoom(roomData: UpdateRoomData) {
    const { id, ...updateData } = roomData;

    const roomUpdate: TablesUpdate<'Room'> = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('Room')
      .update(roomUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Soft delete a room (mark as inactive)
   */
  async deleteRoom(roomId: string) {
    const { data, error } = await supabase
      .from('Room')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', roomId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Search rooms by name
   */
  async searchRooms(query: string) {
    const { data, error } = await supabase
      .from('Room')
      .select('*')
      .ilike('name',`%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Search active rooms by name
   */
  async searchActiveRooms(query: string) {
    const { data, error } = await supabase
      .from('Room')
      .select('*')
      .eq('active', true)
      .ilike('name',`%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}

export const roomsService = new RoomsService();