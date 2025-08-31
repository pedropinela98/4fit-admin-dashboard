import { supabase } from '../lib/supabase';
import type { Tables, TablesInsert, TablesUpdate } from '../lib/database.types';

// Types for our service layer
export type MemberWithDetails = Tables<'User_detail'> & {
  Box_Member: (Tables<'Box_Member'> & {
    Box: Tables<'Box'>;
    Membership?: Tables<'Membership'>[];
  })[];
};

export type CreateMemberData = {
  name: string;
  email: string;
  phone?: string;
  box_id: string;
  joined_at: string;
  notes?: string;
  // Emergency contact info (we'll store in notes for now)
  emergencyContact?: string;
  emergencyPhone?: string;
};

export type UpdateMemberData = Partial<CreateMemberData> & {
  id: string;
};

class MembersService {
  /**
   * Get all members for a specific box with their details
   */
  async getMembersByBox(boxId: string) {
    const { data, error } = await supabase
      .from('Box_Member')
      .select(`
        *,
        User_detail (
          *,
          Membership (
            *,
            Plan (*)
          )
        ),
        Box (*)
      `)
      .eq('box_id', boxId)
      .is('deleted_at', null)
      .order('joined_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get a single member by ID with full details
   */
  async getMemberById(memberId: string) {
    const { data, error } = await supabase
      .from('Box_Member')
      .select(`
        *,
        User_detail (
          *,
          Membership (
            *,
            Plan (*)
          )
        ),
        Box (*)
      `)
      .eq('id', memberId)
      .is('deleted_at', null)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get member by User_detail ID
   */
  async getMemberByUserId(userId: string, boxId: string) {
    const { data, error } = await supabase
      .from('Box_Member')
      .select(`
        *,
        User_detail (
          *,
          Membership (
            *,
            Plan (*)
          )
        ),
        Box (*)
      `)
      .eq('user_id', userId)
      .eq('box_id', boxId)
      .is('deleted_at', null)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create a new member
   */
  async createMember(memberData: CreateMemberData) {
    try {
      // First, create or get the User_detail record
      const { data: existingUser, error: userCheckError } = await supabase
        .from('User_detail')
        .select('*')
        .eq('email', memberData.email)
        .single();

      let userId: string;

      if (userCheckError && userCheckError.code === 'PGRST116') {
        // User doesn't exist, create new one
        const userInsert: TablesInsert<'User_detail'> = {
          id: crypto.randomUUID(),
          name: memberData.name,
          email: memberData.email,
          phone: memberData.phone || null,
        };

        const { data: newUser, error: userError } = await supabase
          .from('User_detail')
          .insert(userInsert)
          .select()
          .single();

        if (userError) throw userError;
        userId = newUser.id;
      } else if (userCheckError) {
        throw userCheckError;
      } else {
        // User exists, use existing user ID
        userId = existingUser.id;
      }

      // Create notes with emergency contact info if provided
      let notes = memberData.notes || '';
      if (memberData.emergencyContact || memberData.emergencyPhone) {
        const emergencyInfo = `Emergency Contact: ${memberData.emergencyContact || 'N/A'}\nEmergency Phone: ${memberData.emergencyPhone || 'N/A'}`;
        notes = notes ? `${notes}\n\n${emergencyInfo}` : emergencyInfo;
      }

      // Create Box_Member record
      const memberInsert: TablesInsert<'Box_Member'> = {
        user_id: userId,
        box_id: memberData.box_id,
        joined_at: memberData.joined_at,
        notes: notes || null,
      };

      const { data: member, error: memberError } = await supabase
        .from('Box_Member')
        .insert(memberInsert)
        .select(`
          *,
          User_detail (*),
          Box (*)
        `)
        .single();

      if (memberError) throw memberError;
      return member;
    } catch (error) {
      console.error('Error creating member:', error);
      throw error;
    }
  }

  /**
   * Update member information
   */
  async updateMember(memberData: UpdateMemberData) {
    try {
      const { id, name, email, phone, notes, emergencyContact, emergencyPhone, ...boxMemberData } = memberData;

      // Get the current member to find user_id
      const { data: currentMember, error: getMemberError } = await supabase
        .from('Box_Member')
        .select('user_id, notes')
        .eq('id', id)
        .single();

      if (getMemberError) throw getMemberError;

      // Update User_detail if user-related fields are provided
      if (name || email || phone) {
        const userUpdate: TablesUpdate<'User_detail'> = {};
        if (name) userUpdate.name = name;
        if (email) userUpdate.email = email;
        if (phone !== undefined) userUpdate.phone = phone;

        const { error: userError } = await supabase
          .from('User_detail')
          .update(userUpdate)
          .eq('id', currentMember.user_id);

        if (userError) throw userError;
      }

      // Update Box_Member record
      let updatedNotes = notes;
      if (emergencyContact || emergencyPhone) {
        const emergencyInfo = `Emergency Contact: ${emergencyContact || 'N/A'}\nEmergency Phone: ${emergencyPhone || 'N/A'}`;
        updatedNotes = updatedNotes ? `${updatedNotes}\n\n${emergencyInfo}` : emergencyInfo;
      }

      const memberUpdate: TablesUpdate<'Box_Member'> = {
        ...boxMemberData,
        ...(updatedNotes !== undefined && { notes: updatedNotes }),
      };

      const { data: updatedMember, error: updateError } = await supabase
        .from('Box_Member')
        .update(memberUpdate)
        .eq('id', id)
        .select(`
          *,
          User_detail (*),
          Box (*)
        `)
        .single();

      if (updateError) throw updateError;
      return updatedMember;
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  }

  /**
   * Soft delete a member (mark as deleted)
   */
  async deleteMember(memberId: string) {
    const { data, error } = await supabase
      .from('Box_Member')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get member attendance history
   */
  async getMemberAttendance(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from('Class_Attendance')
      .select(`
        *,
        Class (
          *,
          Box (name)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * Search members by name or email
   */
  async searchMembers(boxId: string, query: string) {
    const { data, error } = await supabase
      .from('Box_Member')
      .select(`
        *,
        User_detail (*),
        Box (*),
        Membership (
          *,
          Plan (*)
        )
      `)
      .eq('box_id', boxId)
      .is('deleted_at', null)
      .or(`User_detail.name.ilike.%${query}%,User_detail.email.ilike.%${query}%`);

    if (error) throw error;
    return data;
  }

  /**
   * Get members count by status
   */
  async getMemberStats(boxId: string) {
    // Get total members
    const { count: totalMembers, error: totalError } = await supabase
      .from('Box_Member')
      .select('*', { count: 'exact', head: true })
      .eq('box_id', boxId)
      .is('deleted_at', null);

    if (totalError) throw totalError;

    // Get active memberships count for users in this box
    const { count: activeMembers, error: activeError } = await supabase
      .from('Membership')
      .select(`
        *,
        User_detail!inner (
          Box_Member!inner (box_id)
        )
      `, { count: 'exact', head: true })
      .eq('User_detail.Box_Member.box_id', boxId)
      .eq('is_active', true)
      .is('deleted_at', null);

    if (activeError) throw activeError;

    return {
      total: totalMembers || 0,
      active: activeMembers || 0,
      inactive: (totalMembers || 0) - (activeMembers || 0),
    };
  }
}

export const membersService = new MembersService();