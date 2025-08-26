import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import InputField from "../../components/form/input/InputField";
// import Select from "../../components/form/Select"; // Not used currently
import { AngleLeftIcon, CheckCircleIcon } from "../../icons";
import { useMembers, useMember } from "../../hooks/useMembers";
import type { CreateMemberData } from "../../services/members.service";

// For now, we'll use a hardcoded box ID - later this will come from auth context
const DEMO_BOX_ID = '550e8400-e29b-41d4-a716-446655440000'; // Replace with actual box ID

interface MemberFormData {
  name: string;
  email: string;
  phone: string;
  startDate: string;
  notes: string;
  emergencyContact: string;
  emergencyPhone: string;
}

// These would normally come from the database Plans table - not used yet
// const membershipPlans = [
//   { value: 'unlimited', label: 'Unlimited Monthly' },
//   { value: '8-sessions', label: '8 Sessions/Month' },
//   { value: '4-sessions', label: '4 Sessions/Month' },
//   { value: 'drop-in', label: 'Drop-in' },
// ];

export default function MemberForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const { createMember, updateMember } = useMembers(DEMO_BOX_ID);
  const { member, loading: memberLoading } = useMember(id);

  const [formData, setFormData] = useState<MemberFormData>({
    name: '',
    email: '',
    phone: '',
    startDate: new Date().toISOString().split('T')[0],
    notes: '',
    emergencyContact: '',
    emergencyPhone: '',
  });

  const [errors, setErrors] = useState<Partial<MemberFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing member data for editing
  useEffect(() => {
    if (isEditing && member && !memberLoading) {
      // Parse emergency contact from notes (if stored there)
      const notes = member.notes || '';
      const emergencyContactMatch = notes.match(/Emergency Contact: ([^\n]*)/);
      const emergencyPhoneMatch = notes.match(/Emergency Phone: ([^\n]*)/);
      
      setFormData({
        name: member.User_detail.name,
        email: member.User_detail.email,
        phone: member.User_detail.phone || '',
        startDate: member.joined_at,
        notes: notes.replace(/Emergency Contact: [^\n]*\nEmergency Phone: [^\n]*\n?/g, '').trim(),
        emergencyContact: emergencyContactMatch ? emergencyContactMatch[1] : '',
        emergencyPhone: emergencyPhoneMatch ? emergencyPhoneMatch[1] : '',
      });
    }
  }, [isEditing, member, memberLoading]);

  const handleInputChange = (field: keyof MemberFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<MemberFormData> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.startDate) newErrors.startDate = 'Start date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      if (isEditing && id) {
        // Update existing member
        await updateMember({
          id,
          ...formData,
        });
      } else {
        // Create new member
        const memberData: CreateMemberData = {
          ...formData,
          box_id: DEMO_BOX_ID,
          joined_at: formData.startDate,
        };
        await createMember(memberData);
      }
      
      navigate('/members');
    } catch (error) {
      console.error('Error saving member:', error);
      // You could show an error toast here
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing && memberLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading member data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`${isEditing ? 'Edit' : 'Add'} Member | CrossFit Box Management`}
        description={`${isEditing ? 'Edit' : 'Add new'} member to your CrossFit box`}
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
                {isEditing ? 'Edit Member' : 'Add New Member'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isEditing ? 'Update member information' : 'Create a new member profile'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
              Personal Information
            </h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <InputField
                  label="Full Name"
                  type="text"
                  required
                  placeholder="Enter member's full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={errors.name}
                />
              </div>
              
              <InputField
                label="Email"
                type="email"
                required
                placeholder="member@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
              />
              
              <InputField
                label="Phone Number"
                type="tel"
                placeholder="+351 912 345 678"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                error={errors.phone}
              />
            </div>
          </div>

          {/* Emergency Contact Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
              Emergency Contact
            </h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <InputField
                label="Emergency Contact Name"
                type="text"
                placeholder="Contact person's name"
                value={formData.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
              />
              
              <InputField
                label="Emergency Contact Phone"
                type="tel"
                placeholder="+351 912 345 678"
                value={formData.emergencyPhone}
                onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
              />
            </div>
          </div>

          {/* Member Details Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
              Additional Information
            </h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">              
              <InputField
                label="Join Date"
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                error={errors.startDate}
              />
              <div></div> {/* Empty div to maintain grid layout */}
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any additional notes about this member (medical conditions, preferences, etc.)"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </div>
          </div>

          {/* Action Buttons - Mobile First */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/members')}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update Member' : 'Add Member'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}