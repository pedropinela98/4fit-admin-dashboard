import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';

// Box type from database
type Box = Database['public']['Tables']['Box']['Row'];

const BOX_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'; // TODO: Replace with dynamic logic if needed



const BoxSettingsPage: React.FC = () => {
  const [box, setBox] = useState<Box | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchBox = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('Box')
        .select('*')
        .eq('id', BOX_ID)
        .single();
      if (error) setError(error.message);
      else setBox(data);
      setLoading(false);
    };
    fetchBox();
  }, []);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!box) return;
    setBox({ ...box, [e.target.name]: e.target.value });
  };

  // Handle image upload for boxIcon
  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!box || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `boxicon-${box.id}-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('box-icons')
      .upload(fileName, file, { upsert: true });
    if (uploadError) {
      setError(uploadError.message);
      return;
    }
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('box-icons')
      .getPublicUrl(fileName);
    if (publicUrlData?.publicUrl) {
      setBox({ ...box, boxIcon: publicUrlData.publicUrl });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!box) return;
    setSaving(true);
    const { error } = await supabase
      .from('Box')
      .update({
        name: box.name,
        location: box.location,
        boxIcon: box.boxIcon,
      })
      .eq('id', BOX_ID);
    setSaving(false);
    if (error) setError(error.message);
    else alert('Box updated!');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!box) return <div>No box found.</div>;

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Configuração da Box</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Nome da Box</label>
          <input
            type="text"
            name="name"
            value={box.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
                <div>
          <label className="block font-medium mb-1">Icone da Box</label>
          <div className="flex items-center gap-4">
            {box.boxIcon && (
              <img src={box.boxIcon} alt="Box Icon" className="w-16 h-16 rounded object-cover border" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleIconUpload}
              className="block"
            />
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={box.location}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default BoxSettingsPage;
