import React, { useEffect, useState } from 'react';
import { PencilIcon } from '../../icons';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';
import Button from '../../components/ui/button/Button';

// Box type from database
type Box = Database['public']['Tables']['Box']['Row'];

interface BoxDetailsTabProps {
  boxId: string;
}

const BoxDetailsTab: React.FC<BoxDetailsTabProps> = ({ boxId }) => {
  const [box, setBox] = useState<Box | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{ name: string; location: string; boxIcon: string | null }>({ name: '', location: '', boxIcon: null });

  useEffect(() => {
    const fetchBox = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('Box')
        .select('*')
        .eq('id', boxId)
        .single();
      if (error) setError(error.message);
      else {
        setBox(data);
        setForm({
          name: data.name || '',
          location: data.location || '',
          boxIcon: data.boxIcon || null,
        });
      }
      setLoading(false);
    };
    fetchBox();
  }, [boxId]);

  if (loading) return <div>Loading box details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!box) return <div>No box found.</div>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `boxicon-${boxId}-${Date.now()}.${fileExt}`;
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
      setForm({ ...form, boxIcon: publicUrlData.publicUrl });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from('Box')
      .update({
        name: form.name,
        location: form.location,
        boxIcon: form.boxIcon,
      })
      .eq('id', boxId);
    setSaving(false);
    if (error) setError(error.message);
    else {
      setBox({ ...box!, name: form.name, location: form.location, boxIcon: form.boxIcon });
      setEditMode(false);
    }
  };

  return (
  <div className="mt-6 px-4 pb-12 w-full">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{box.name}</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Gere os Detalhes da tua Box</p>
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700 w-full" style={{maxWidth: '100%'}}>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">{box.name}</h2>
          {!editMode && (
            <Button
              size="sm"
              variant="outline"
              startIcon={<PencilIcon className="h-4 w-4 text-gray-400" />}
              onClick={() => setEditMode(true)}
            >
              Editar
            </Button>
          )}
        </div>
        {editMode ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Nome da Box</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Icone da Box</label>
              <div className="flex items-center gap-4">
                {form.boxIcon && (
                  <img src={form.boxIcon} alt="Box Icon" className="w-16 h-16 rounded object-cover border" />
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
                value={form.location}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg transition px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Guardar'}
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-lg transition px-4 py-3 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
                onClick={() => setEditMode(false)}
              >
                Cancelar
              </button>
            </div>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </form>
        ) : (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            <div><strong>Location:</strong> {box.location}</div>
            <div><strong>Currency:</strong> {box.currency}</div>
            <div><strong>Timezone:</strong> {box.timezone}</div>
            <div><strong>Active:</strong> {box.active ? 'Yes' : 'No'}</div>
            <div><strong>Created at:</strong> {new Date(box.created_at).toLocaleString()}</div>
            <div><strong>Updated at:</strong> {new Date(box.updated_at).toLocaleString()}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoxDetailsTab;
