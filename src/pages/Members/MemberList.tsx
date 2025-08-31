import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { PlusIcon, GridIcon, MoreDotIcon, ListIcon, BoxIcon } from "../../icons";
import { useMembers, type Member } from "../../hooks/useMembers";
import { useBoxes } from "../../hooks/useBoxes";

// Default box ID for initial load
const DEMO_BOX_ID = '550e8400-e29b-41d4-a716-446655440000';

type MembershipStatus = 'active' | 'inactive' | 'expired';

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  inactive: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  expired: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

// Helper function to determine membership status
const getMembershipStatus = (member: Member): MembershipStatus => {
  if (!member.Membership || member.Membership.length === 0) {
    return 'inactive';
  }
  
  const activeMembership = member.Membership.find(m => m.is_active);
  if (activeMembership) {
    return new Date(activeMembership.end_date) > new Date() ? 'active' : 'expired';
  }
  
  return 'inactive';
};

// Helper function to get membership type
const getMembershipType = (member: Member): string => {
  const activeMembership = member.Membership?.find(m => m.is_active);
  return activeMembership ? 'Active Plan' : 'No Active Plan';
};

export default function MemberList() {
  const [selectedBoxId, setSelectedBoxId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { boxes, loading: boxesLoading } = useBoxes();
  const { members, loading, error, stats, searchMembers, refetch, resetSearch } = useMembers(selectedBoxId);

  // Set default box when boxes load
  useEffect(() => {
    if (!boxesLoading && boxes.length > 0 && !selectedBoxId) {
      // Try to find the demo box first, otherwise use the first box
      const defaultBox = boxes.find(box => box.id === DEMO_BOX_ID) || boxes[0];
      setSelectedBoxId(defaultBox.id);
    }
  }, [boxes, boxesLoading, selectedBoxId]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchMembers(searchQuery);
      } else {
        resetSearch();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchMembers, resetSearch]);

  // Filter members by status
  const filteredMembers = members.filter(member => {
    if (statusFilter === 'all') return true;
    return getMembershipStatus(member) === statusFilter;
  });

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-2">Error loading members</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</div>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Members | CrossFit Box Management"
        description="Manage your CrossFit box members, memberships, and attendance"
      />
      
      <div className="space-y-6">
        {/* Header Section - Mobile First */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Members
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your gym members and their memberships
            </p>
          </div>
          
          <Link to={selectedBoxId ? `/members/new?boxId=${selectedBoxId}` : "/members/new"}>
            <Button className="w-full sm:w-auto" disabled={!selectedBoxId}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </Link>
        </div>

        {/* Search and Filter Bar - Mobile Optimized */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <GridIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Box Selection */}
            <div className="flex items-center gap-2 sm:min-w-0 sm:w-auto">
              <BoxIcon className="h-4 w-4 text-gray-400" />
              <select
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedBoxId}
                onChange={(e) => setSelectedBoxId(e.target.value)}
                disabled={boxesLoading}
              >
                {boxesLoading ? (
                  <option value="">Loading boxes...</option>
                ) : boxes.length === 0 ? (
                  <option value="">No boxes found</option>
                ) : (
                  boxes.map((box) => (
                    <option key={box.id} value={box.id}>
                      {box.name} - {box.location}
                    </option>
                  ))
                )}
              </select>
            </div>
            
            {/* Status Filter */}
            <div className="flex items-center gap-2 sm:min-w-0 sm:w-auto">
              <ListIcon className="h-4 w-4 text-gray-400" />
              <select
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Members List - Mobile Cards / Desktop Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {!selectedBoxId ? (
            <div className="p-8 text-center">
              <BoxIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">Select a box to view members</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Choose a box from the dropdown above to see its members</p>
            </div>
          ) : loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading members...</p>
            </div>
          ) : (
            <div>
              {/* Mobile View - Card Layout */}
              <div className="sm:hidden">
                {filteredMembers.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchQuery ? 'No members found matching your search' : 'No members found'}
                    </p>
                    {!searchQuery && selectedBoxId && (
                      <Link to={`/members/new?boxId=${selectedBoxId}`}>
                        <Button className="mt-4">Add First Member</Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredMembers.map((member) => {
                      const membershipStatus = getMembershipStatus(member);
                      const membershipType = getMembershipType(member);
                      
                      return (
                        <div key={member.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <Link 
                                to={`/members/${member.id}`}
                                className="block hover:bg-gray-50 dark:hover:bg-gray-700 -m-2 p-2 rounded"
                              >
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {member.User_detail.name}
                                </h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
                                  {member.User_detail.email}
                                </p>
                                {member.User_detail.phone && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    {member.User_detail.phone}
                                  </p>
                                )}
                              </Link>
                            </div>
                            <button className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                              <MoreDotIcon className="h-4 w-4 text-gray-400" />
                            </button>
                          </div>
                          
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[membershipStatus]}`}>
                              {membershipStatus.charAt(0).toUpperCase() + membershipStatus.slice(1)}
                            </span>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {membershipType}
                            </span>
                          </div>
                          
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Joined {new Date(member.joined_at).toLocaleDateString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Desktop View - Table Layout */}
              <div className="hidden sm:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Member
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Membership
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredMembers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                            {searchQuery ? 'No members found matching your search' : 'No members found'}
                          </td>
                        </tr>
                      ) : (
                        filteredMembers.map((member) => {
                          const membershipStatus = getMembershipStatus(member);
                          const membershipType = getMembershipType(member);
                          
                          return (
                            <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4">
                                <Link 
                                  to={`/members/${member.id}`}
                                  className="block hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {member.User_detail.name}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Joined {new Date(member.joined_at).toLocaleDateString()}
                                  </div>
                                </Link>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 dark:text-white">{member.User_detail.email}</div>
                                {member.User_detail.phone && (
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{member.User_detail.phone}</div>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[membershipStatus]}`}>
                                  {membershipStatus.charAt(0).toUpperCase() + membershipStatus.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                {membershipType}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                {new Date(member.joined_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                                  <MoreDotIcon className="h-4 w-4 text-gray-400" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Stats - Mobile Friendly */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {stats.total}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Members</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
              {stats.active}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Active</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
              {stats.inactive}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Inactive</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-lg font-semibold text-red-600 dark:text-red-400">
              {stats.expired}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Expired</div>
          </div>
        </div>
      </div>
    </>
  );
}