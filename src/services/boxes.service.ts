import { supabase } from '../lib/supabase';
import type { Tables, TablesInsert, TablesUpdate } from '../lib/database.types';

export type Box = Tables<'Box'>;

export type CreateBoxData = {
  name: string;
  location: string;
  timezone: string;
  currency: string;
  latitude?: number;
  longitude?: number;
  active?: boolean;
};

export type UpdateBoxData = Partial<CreateBoxData> & {
  id: string;
};

class BoxesService {
  /**
   * Get all active boxes
   */
  async getAllBoxes() {
    const { data, error } = await supabase
      .from('Box')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get a single box by ID
   */
  async getBoxById(boxId: string) {
    const { data, error } = await supabase
      .from('Box')
      .select('*')
      .eq('id', boxId)
      .eq('active', true)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create a new box
   */
  async createBox(boxData: CreateBoxData) {
    const boxInsert: TablesInsert<'Box'> = {
      name: boxData.name,
      location: boxData.location,
      timezone: boxData.timezone || 'UTC',
      currency: boxData.currency || 'EUR',
      latitude: boxData.latitude || null,
      longitude: boxData.longitude || null,
      active: boxData.active ?? true,
    };

    const { data, error } = await supabase
      .from('Box')
      .insert(boxInsert)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update box information
   */
  async updateBox(boxData: UpdateBoxData) {
    const { id, ...updateData } = boxData;

    const boxUpdate: TablesUpdate<'Box'> = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('Box')
      .update(boxUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Soft delete a box (mark as inactive)
   */
  async deleteBox(boxId: string) {
    const { data, error } = await supabase
      .from('Box')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', boxId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get box statistics
   */
  async getBoxStats(boxId: string) {
    // Get total members count for this box
    const { count: totalMembers, error: membersError } = await supabase
      .from('Box_Member')
      .select('*', { count: 'exact', head: true })
      .eq('box_id', boxId)
      .is('deleted_at', null);

    if (membersError) throw membersError;

    // Get total classes count for this box
    const { count: totalClasses, error: classesError } = await supabase
      .from('Class')
      .select('*', { count: 'exact', head: true })
      .eq('box_id', boxId);

    if (classesError) throw classesError;

    return {
      totalMembers: totalMembers || 0,
      totalClasses: totalClasses || 0,
    };
  }

  /**
   * Search boxes by name or location
   */
  async searchBoxes(query: string) {
    const { data, error } = await supabase
      .from('Box')
      .select('*')
      .eq('active', true)
      .or(`name.ilike.%${query}%,location.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}

export const boxesService = new BoxesService();