import './classTypes.css';
import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../components/ui/table';
import Button from '../../components/ui/button/Button';
import { useNavigate } from 'react-router';
import InputField from '../../components/form/input/InputField';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';

type ClassType = Database['public']['Tables']['Class_Type']['Row'];

const boxId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';


const ClassTypes: React.FC = () => {
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  const navigate = useNavigate();
  const [editingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    color: '#000000',
    duration: 60,
    room: '',
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

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
          room: form.room,
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
          room: form.room,
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
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ margin: 0, fontWeight: 700 }}>Tipos de aulas</span>
        <Button onClick={handleCreate}>Criar um Novo Tipo de aula</Button>
      </div>
      <Table className="mt-4">
        <TableHeader>
            <TableRow>
              <TableCell isHeader className="text-left">Nome</TableCell>
              <TableCell isHeader className="text-left">Descrição</TableCell>
              <TableCell isHeader className="text-left">Cor da Aula</TableCell>
              <TableCell isHeader className="text-left">Duração (min)</TableCell>
              <TableCell isHeader className="text-left">Sala Utilizada</TableCell>
              <TableCell isHeader className="text-left">Capacidade</TableCell>
              <TableCell isHeader className="text-left">Lista de espera</TableCell>
              <TableCell isHeader className="text-left">Ações</TableCell>
            </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <td colSpan={6} style={{ textAlign: 'center', padding: '16px' }}>Carregando...</td>
            </TableRow>
          ) : classTypes.length === 0 ? (
            <TableRow>
              <td colSpan={6} style={{ textAlign: 'center', padding: '16px' }}>Nenhum tipo de aula encontrado.</td>
            </TableRow>
          ) : (
            classTypes.map((ct) => (
              <TableRow key={ct.id}>
                <TableCell>{ct.name}</TableCell>
                <TableCell>{ct.description}</TableCell>
                <TableCell>
                  <span className="color-cell" style={{ background: ct.color || '#888', padding: '2px 8px', borderRadius: 4, color: '#fff', fontSize: '11px' }}>{ct.color}</span>
                </TableCell>
                <TableCell>{ct.duration_default}</TableCell>
                <TableCell>{ct.room}</TableCell>
                <TableCell>{ct.capacity_default}</TableCell>
                <TableCell>{ct.waitlist_default}</TableCell>
                <TableCell>
                  <div className="actions-col">
                    <Button size="sm" onClick={() => navigate('/classes/types/new', { state: { classType: ct } })} className="small-edit-btn">Edit</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

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
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>Sala utilizada</label>
            <InputField name="room" value={form.room} onChange={handleChange} />
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