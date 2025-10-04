import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { AngleLeftIcon } from '../../icons';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';

// Box type from database
type Box = Database['public']['Tables']['Box']['Row'];

const BOX_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';



const BoxSettingsPage: React.FC = () => {
  const [box, setBox] = useState<Box | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

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
  <div className="px-4 pt-8 pb-12 w-full">
      <div className="flex items-center gap-2 mb-1">
        <button
          type="button"
          onClick={() => box && navigate(`/boxes/details/${box.id}`)}
          className="p-0 bg-transparent border-0 focus:outline-none"
          aria-label="Voltar a Detalhes da Box"
        >
          <AngleLeftIcon className="h-5 w-5 text-gray-700 dark:text-white" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuração da Box</h1>
      </div>
      <div className="mb-6 ml-7">
        <p className="text-sm text-gray-600 dark:text-gray-400">Altere o nome, ícone ou localização da sua box</p>
      </div>
  <div className="p-6 bg-white dark:bg-gray-800 rounded shadow border border-gray-200 dark:border-gray-700 w-full" style={{maxWidth: '100%'}}>
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
          <label className="block font-medium mb-1">Localidade</label>
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
    </div>
  );
};

export default BoxSettingsPage;
