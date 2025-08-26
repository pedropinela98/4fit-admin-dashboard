import { useState, useEffect, useCallback } from 'react';
import { membersService, type CreateMemberData, type UpdateMemberData } from '../services/members.service';
import type { Tables } from '../lib/database.types';

export type Member = Tables<'Box_Member'> & {
  User_detail: Tables<'User_detail'>;
  Box: Tables<'Box'>;
  Membership?: Tables<'Membership'>[];
};

interface UseMembersState {
  members: Member[];
  loading: boolean;
  error: string | null;
  stats: {
    total: number;
    active: number;
    inactive: number;
    expired: number;
  };
}

interface UseMembersReturn extends UseMembersState {
  refetch: () => Promise<void>;
  searchMembers: (query: string) => Promise<void>;
  createMember: (memberData: CreateMemberData) => Promise<Member>;
  updateMember: (memberData: UpdateMemberData) => Promise<Member>;
  deleteMember: (memberId: string) => Promise<void>;
}

export function useMembers(boxId: string): UseMembersReturn {
  const [state, setState] = useState<UseMembersState>({
    members: [],
    loading: true,
    error: null,
    stats: { total: 0, active: 0, inactive: 0, expired: 0 },
  });

  const fetchMembers = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const [membersData, statsData] = await Promise.all([
        membersService.getMembersByBox(boxId),
        membersService.getMemberStats(boxId)
      ]);

      // Calculate expired memberships (members with inactive memberships)
      const expiredCount = membersData.filter(member => 
        member.Membership?.some(m => !m.is_active && new Date(m.end_date) < new Date())
      ).length;

      setState({
        members: membersData,
        loading: false,
        error: null,
        stats: {
          ...statsData,
          expired: expiredCount,
        },
      });
    } catch (error) {
      console.error('Error fetching members:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load members',
      }));
    }
  }, [boxId]);

  const searchMembers = useCallback(async (query: string) => {
    if (!query.trim()) {
      await fetchMembers();
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await membersService.searchMembers(boxId, query);
      setState(prev => ({
        ...prev,
        members: data,
        loading: false,
      }));
    } catch (error) {
      console.error('Error searching members:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Search failed',
      }));
    }
  }, [boxId, fetchMembers]);

  const createMember = useCallback(async (memberData: CreateMemberData): Promise<Member> => {
    try {
      const newMember = await membersService.createMember(memberData);
      
      // Refresh the members list
      await fetchMembers();
      
      return newMember;
    } catch (error) {
      console.error('Error creating member:', error);
      throw error;
    }
  }, [fetchMembers]);

  const updateMember = useCallback(async (memberData: UpdateMemberData): Promise<Member> => {
    try {
      const updatedMember = await membersService.updateMember(memberData);
      
      // Update the local state
      setState(prev => ({
        ...prev,
        members: prev.members.map(member => 
          member.id === updatedMember.id ? updatedMember : member
        ),
      }));

      return updatedMember;
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  }, []);

  const deleteMember = useCallback(async (memberId: string): Promise<void> => {
    try {
      await membersService.deleteMember(memberId);
      
      // Remove from local state
      setState(prev => ({
        ...prev,
        members: prev.members.filter(member => member.id !== memberId),
        stats: {
          ...prev.stats,
          total: prev.stats.total - 1,
        },
      }));
    } catch (error) {
      console.error('Error deleting member:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    if (boxId) {
      fetchMembers();
    }
  }, [boxId, fetchMembers]);

  return {
    ...state,
    refetch: fetchMembers,
    searchMembers,
    createMember,
    updateMember,
    deleteMember,
  };
}

// Hook for getting a single member
export function useMember(memberId: string | undefined) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMember = useCallback(async () => {
    if (!memberId) {
      setMember(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await membersService.getMemberById(memberId);
      setMember(data);
    } catch (error) {
      console.error('Error fetching member:', error);
      setError(error instanceof Error ? error.message : 'Failed to load member');
      setMember(null);
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    fetchMember();
  }, [fetchMember]);

  return {
    member,
    loading,
    error,
    refetch: fetchMember,
  };
}