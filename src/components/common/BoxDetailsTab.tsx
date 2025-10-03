import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';

// Box type from database
type Box = Database['public']['Tables']['Box']['Row'];

interface BoxDetailsTabProps {
  boxId: string;
}

const BoxDetailsTab: React.FC<BoxDetailsTabProps> = ({ boxId }) => {
  const [box, setBox] = useState<Box | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<'details'>('details');

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
      else setBox(data);
      setLoading(false);
    };
    fetchBox();
  }, [boxId]);

  if (loading) return <div>Loading box details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!box) return <div>No box found.</div>;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900 w-fit mb-4">
        <button
          onClick={() => setSelected('details')}
          className={`px-3 py-2 font-medium rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${selected === 'details' ? 'shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800' : 'text-gray-500 dark:text-gray-400'}`}
        >
          {box.name}
        </button>
      </div>
      {selected === 'details' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold mb-2">{box.name}</h2>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            <div><strong>Location:</strong> {box.location}</div>
            <div><strong>Currency:</strong> {box.currency}</div>
            <div><strong>Timezone:</strong> {box.timezone}</div>
            <div><strong>Active:</strong> {box.active ? 'Yes' : 'No'}</div>
            <div><strong>Created at:</strong> {new Date(box.created_at).toLocaleString()}</div>
            <div><strong>Updated at:</strong> {new Date(box.updated_at).toLocaleString()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoxDetailsTab;
