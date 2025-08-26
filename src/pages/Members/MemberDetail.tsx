import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { AngleLeftIcon, PencilIcon, TrashBinIcon, CalenderIcon, UserIcon, MailIcon } from "../../icons";

// Mock data - replace with real API call
const mockMember = {
  id: '1',
  name: 'João Silva',
  email: 'joao@email.com',
  phone: '+351 912 345 678',
  joinedAt: '2024-01-15',
  membershipStatus: 'active' as const,
  membershipType: 'Unlimited',
  membershipStart: '2024-01-15',
  membershipEnd: '2024-02-15',
  notes: 'Previous shoulder injury. Prefers morning classes.',
  emergencyContact: 'Maria Silva',
  emergencyPhone: '+351 923 456 789',
  lastAttendance: '2024-01-20',
  totalSessions: 45,
  sessionsThisMonth: 12
};

const recentAttendance = [
  { date: '2024-01-20', class: 'CrossFit WOD', time: '09:00', status: 'present' as const },
  { date: '2024-01-19', class: 'Strength Training', time: '18:00', status: 'present' as const },
  { date: '2024-01-18', class: 'CrossFit WOD', time: '09:00', status: 'no_show' as const },
  { date: '2024-01-17', class: 'Olympic Lifting', time: '17:00', status: 'present' as const },
  { date: '2024-01-16', class: 'CrossFit WOD', time: '09:00', status: 'present' as const },
];

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  inactive: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  expired: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

const attendanceStatusColors = {
  present: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  no_show: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
};

export default function MemberDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async () => {
    // TODO: Implement delete functionality
    console.log('Deleting member:', id);
    navigate('/members');
  };

  return (
    <>
      <PageMeta
        title={`${mockMember.name} | Member Details`}
        description={`View details for member ${mockMember.name}`}
      />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/members')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <AngleLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {mockMember.name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Member since {new Date(mockMember.joinedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link to={`/members/${id}/edit`}>
              <Button variant="secondary" className="flex-1 sm:flex-none">
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
              className="flex-1 sm:flex-none"
            >
              <TrashBinIcon className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Member Overview Cards - Mobile Optimized Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {mockMember.totalSessions}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {mockMember.sessionsThisMonth}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">This Month</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {mockMember.lastAttendance 
                ? new Date(mockMember.lastAttendance).toLocaleDateString()
                : 'Never'
              }
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Last Visit</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <Badge className={statusColors[mockMember.membershipStatus]}>
              {mockMember.membershipStatus.charAt(0).toUpperCase() + mockMember.membershipStatus.slice(1)}
            </Badge>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Status</div>
          </div>
        </div>

        {/* Member Information */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
              Personal Information
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MailIcon className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {mockMember.email}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Email</div>
                </div>
              </div>
              
              {mockMember.phone && (
                <div className="flex items-center gap-3">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {mockMember.phone}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Phone</div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <CalenderIcon className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(mockMember.joinedAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Join Date</div>
                </div>
              </div>
            </div>

            {mockMember.notes && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Notes
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {mockMember.notes}
                </p>
              </div>
            )}
          </div>

          {/* Membership & Emergency Contact */}
          <div className="space-y-6">
            {/* Membership Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                Membership Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {mockMember.membershipType}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Plan</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(mockMember.membershipStart).toLocaleDateString()} - {new Date(mockMember.membershipEnd).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Current Period</div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                Emergency Contact
              </h2>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {mockMember.emergencyContact}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {mockMember.emergencyPhone}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Attendance
            </h2>
          </div>
          
          {/* Mobile View - Cards */}
          <div className="sm:hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentAttendance.map((record, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {record.class}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(record.date).toLocaleDateString()} at {record.time}
                      </div>
                    </div>
                    <Badge className={attendanceStatusColors[record.status]}>
                      {record.status === 'no_show' ? 'No Show' : record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop View - Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentAttendance.map((record, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {record.class}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {record.time}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={attendanceStatusColors[record.status]}>
                        {record.status === 'no_show' ? 'No Show' : record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Delete Member
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete {mockMember.name}? This action cannot be undone.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                className="w-full sm:w-auto"
              >
                Delete Member
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}