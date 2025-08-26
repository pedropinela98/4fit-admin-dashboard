import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import InputField from "../../components/form/input/InputField";
import { AngleLeftIcon, CheckCircleIcon } from "../../icons";
import { useBoxes, useBox } from "../../hooks/useBoxes";
import type { CreateBoxData } from "../../services/boxes.service";

interface BoxFormData {
  name: string;
  location: string;
  timezone: string;
  currency: string;
  latitude: string;
  longitude: string;
  active: boolean;
}

// Common timezones for dropdown
const commonTimezones = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'Europe/Lisbon', label: 'Europe/Lisbon (Portugal)' },
  { value: 'Europe/Madrid', label: 'Europe/Madrid (Spain)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (France)' },
  { value: 'Europe/London', label: 'Europe/London (UK)' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
  { value: 'America/Chicago', label: 'America/Chicago (CST)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney' },
];

// Common currencies for dropdown
const commonCurrencies = [
  { value: 'EUR', label: 'EUR (Euro)' },
  { value: 'USD', label: 'USD (US Dollar)' },
  { value: 'GBP', label: 'GBP (British Pound)' },
  { value: 'CAD', label: 'CAD (Canadian Dollar)' },
  { value: 'AUD', label: 'AUD (Australian Dollar)' },
  { value: 'BRL', label: 'BRL (Brazilian Real)' },
];

export default function BoxForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const { createBox, updateBox } = useBoxes();
  const { box, loading: boxLoading } = useBox(id);

  const [formData, setFormData] = useState<BoxFormData>({
    name: '',
    location: '',
    timezone: 'UTC',
    currency: 'EUR',
    latitude: '',
    longitude: '',
    active: true,
  });

  const [errors, setErrors] = useState<Partial<BoxFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing box data for editing
  useEffect(() => {
    if (isEditing && box && !boxLoading) {
      setFormData({
        name: box.name,
        location: box.location,
        timezone: box.timezone,
        currency: box.currency,
        latitude: box.latitude?.toString() || '',
        longitude: box.longitude?.toString() || '',
        active: box.active,
      });
    }
  }, [isEditing, box, boxLoading]);

  const handleInputChange = (field: keyof BoxFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BoxFormData> = {};

    if (!formData.name.trim()) newErrors.name = 'Box name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.timezone) newErrors.timezone = 'Timezone is required';
    if (!formData.currency) newErrors.currency = 'Currency is required';

    // Validate latitude if provided
    if (formData.latitude && (isNaN(Number(formData.latitude)) || Math.abs(Number(formData.latitude)) > 90)) {
      newErrors.latitude = 'Latitude must be a number between -90 and 90';
    }

    // Validate longitude if provided
    if (formData.longitude && (isNaN(Number(formData.longitude)) || Math.abs(Number(formData.longitude)) > 180)) {
      newErrors.longitude = 'Longitude must be a number between -180 and 180';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const boxData: CreateBoxData = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        timezone: formData.timezone,
        currency: formData.currency,
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined,
        active: formData.active,
      };

      if (isEditing && id) {
        await updateBox({
          id,
          ...boxData,
        });
      } else {
        await createBox(boxData);
      }
      
      navigate('/boxes');
    } catch (error) {
      console.error('Error saving box:', error);
      // You could show an error toast here
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing && boxLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading box data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`${isEditing ? 'Edit' : 'Add'} Box | CrossFit Box Management`}
        description={`${isEditing ? 'Edit' : 'Add new'} CrossFit box location`}
      />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/boxes')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <AngleLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Box' : 'Add New Box'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isEditing ? 'Update box information' : 'Create a new CrossFit box location'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <InputField
                  label="Box Name"
                  type="text"
                  required
                  placeholder="Enter box name (e.g., CrossFit Downtown)"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={errors.name}
                />
              </div>
              
              <div className="sm:col-span-2">
                <InputField
                  label="Location"
                  type="text"
                  required
                  placeholder="Enter full address or location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  error={errors.location}
                />
              </div>
            </div>
          </div>

          {/* Configuration Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
              Configuration
            </h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Timezone <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                  required
                >
                  {commonTimezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
                {errors.timezone && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.timezone}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Currency <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  required
                >
                  {commonCurrencies.map((currency) => (
                    <option key={currency.value} value={currency.value}>
                      {currency.label}
                    </option>
                  ))}
                </select>
                {errors.currency && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.currency}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                  checked={formData.active}
                  onChange={(e) => handleInputChange('active', e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Box is active
                </span>
              </label>
            </div>
          </div>

          {/* Location Coordinates Card (Optional) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
              Geographic Coordinates
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Optional: Add precise coordinates for map integration
            </p>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <InputField
                label="Latitude"
                type="number"
                step="any"
                placeholder="e.g., 40.7128"
                value={formData.latitude}
                onChange={(e) => handleInputChange('latitude', e.target.value)}
                error={errors.latitude}
              />
              
              <InputField
                label="Longitude"
                type="number"
                step="any"
                placeholder="e.g., -74.0060"
                value={formData.longitude}
                onChange={(e) => handleInputChange('longitude', e.target.value)}
                error={errors.longitude}
              />
            </div>
          </div>

          {/* Action Buttons - Mobile First */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/boxes')}
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
                  {isEditing ? 'Update Box' : 'Create Box'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}