import './classTypes.css';
import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../components/ui/table';
import Button from '../../components/ui/button/Button';
import { MoreDotIcon, PencilIcon } from '../../icons';
import { Dropdown } from '../../components/ui/dropdown/Dropdown';
import { useNavigate } from 'react-router';
import InputField from '../../components/form/input/InputField';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';

type ClassType = Database['public']['Tables']['Class_Type']['Row'];

const boxId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

interface ClassTypeActionsDropdownProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onEdit: () => void;
}

const ClassTypeActionsDropdown: React.FC<ClassTypeActionsDropdownProps> = ({ open, onOpen, onClose, onEdit }) => (
  <>
    <button
      className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded dropdown-toggle"
      title="Ações"
      onClick={open ? onClose : onOpen}
      type="button"
    >
      <MoreDotIcon className="h-4 w-4 text-gray-400" />
    </button>
    <Dropdown isOpen={open} onClose={onClose}>
      <div className="py-1">
        <button
          className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => { onClose(); onEdit(); }}
        >
          <PencilIcon className="h-4 w-4 text-gray-400" />
          Editar
        </button>
      </div>
    </Dropdown>
  </>
);

const ClassTypes: React.FC = () => {
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  const navigate = useNavigate();
  const [editingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    color: '#000000',
    duration: 60,
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Fetch class types from Supabase
  useEffect(() => {
    const fetchClassTypes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('Class_Type')
        .select('*')
        .eq('box_id', boxId)
        .order('name');
      if (error) {
        setLoading(false);
        return;
      }
      setClassTypes(data || []);
      setLoading(false);
    };
    fetchClassTypes();
  }, []);

  const handleCreate = () => {
    navigate('/classes/types/new');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'duration' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (editingId) {
      // Update existing class type
      const { error } = await supabase
        .from('Class_Type')
        .update({
          name: form.name,
          description: form.description,
          color: form.color,
          duration: form.duration,
        })
        .eq('id', editingId);
      if (!error) {
        setClassTypes((prev) =>
          prev.map((ct) =>
            ct.id === editingId ? { ...ct, ...form } : ct
          )
        );
      }
    } else {
      // Create new class type
      const { data, error } = await supabase
        .from('Class_Type')
        .insert({
          box_id: boxId,
          name: form.name,
          description: form.description,
          color: form.color,
          duration: form.duration,
        })
        .select();
      if (data && data.length > 0 && !error) {
        setClassTypes((prev) => [...prev, data[0]]);
      }
    }
    setShowForm(false);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Tipos de aulas</h1>
        <Button className="w-full sm:w-auto" onClick={handleCreate}>Criar um Novo Tipo de aula</Button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        {/* Mobile View - Card Layout */}
        <div className="sm:hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500 dark:text-gray-400">Carregando...</p>
            </div>
          ) : classTypes.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">Nenhum tipo de aula encontrado.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {classTypes.map((ct) => (
                <div key={ct.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{ct.name}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">{ct.description}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Cor: <span className="inline-block px-2 py-1 rounded" style={{ background: ct.color || '#888', color: '#fff' }}>{ct.color}</span></p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Duração: {ct.duration_default} min</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Capacidade: {ct.capacity_default}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Lista de espera: {ct.waitlist_default}</p>
                    </div>
                    <div className="ml-2" style={{ position: 'relative' }}>
                      <ClassTypeActionsDropdown
                        open={openDropdownId === ct.id}
                        onOpen={() => setOpenDropdownId(ct.id)}
                        onClose={() => setOpenDropdownId(null)}
                        onEdit={() => navigate('/classes/types/new', { state: { classType: ct } })}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Desktop View - Table Layout */}
        <div className="hidden sm:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Descrição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duração</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Capacidade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lista de espera</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">Carregando...</td>
                  </tr>
                ) : classTypes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">Nenhum tipo de aula encontrado.</td>
                  </tr>
                ) : (
                  classTypes.map((ct) => (
                    <tr key={ct.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{ct.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{ct.description}</td>
                      <td className="px-6 py-4"><span className="inline-block px-2 py-1 rounded" style={{ background: ct.color || '#888', color: '#fff' }}>{ct.color}</span></td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{ct.duration_default} min</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{ct.capacity_default}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{ct.waitlist_default}</td>
                      <td className="px-6 py-4 text-right">
                        <div style={{ position: 'relative' }}>
                          <ClassTypeActionsDropdown
                            open={openDropdownId === ct.id}
                            onOpen={() => setOpenDropdownId(ct.id)}
                            onClose={() => setOpenDropdownId(null)}
                            onEdit={() => navigate('/classes/types/new', { state: { classType: ct } })}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginTop: 24, padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>Nome</label>
            <InputField name="name" value={form.name} onChange={handleChange} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>Descrição</label>
            <InputField name="description" value={form.description} onChange={handleChange} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>Cor da aula</label>
            <InputField name="color" value={form.color} onChange={handleChange} type="color" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>Duração (min)</label>
            <InputField name="duration" value={form.duration} onChange={handleChange} type="number" />
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: '8px' }}>
            <button type="submit" style={{ padding: '8px 16px', borderRadius: 6, background: '#3b82f6', color: '#fff', border: 'none' }}>
              {editingId ? 'Update' : 'Create'}
            </button>
            <Button onClick={() => setShowForm(false)} variant="outline">Cancelar</Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ClassTypes;