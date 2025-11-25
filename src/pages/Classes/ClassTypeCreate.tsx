import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router';
import { AngleLeftIcon } from '../../icons';
import InputField from '../../components/form/input/InputField';
import Button from '../../components/ui/button/Button';
import { supabase } from '../../lib/supabase';

const boxId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

const ClassTypeCreate: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editClassType = location.state?.classType;
  const [form, setForm] = useState({
    name: '',
    description: '',
    color: '#000000',
    duration: 60,
    capacity_default: 0,
    waitlist_default: 0,
  });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (editClassType && editClassType.id) {
      setEditingId(editClassType.id);
      // Fetch latest data from Supabase
      const fetchClassType = async () => {
        const { data, error } = await supabase
          .from('Class_Type')
          .select('*')
          .eq('id', editClassType.id)
          .single();
        if (data && !error) {
          setForm({
            name: data.name,
            description: data.description || '',
            color: data.color || '#000000',
            duration: data.duration_default !== undefined && data.duration_default !== null ? data.duration_default : 60,
            capacity_default: data.capacity_default !== undefined && data.capacity_default !== null ? data.capacity_default : 0,
            waitlist_default: data.waitlist_default !== undefined && data.waitlist_default !== null ? data.waitlist_default : 0,
          });
        }
      };
      fetchClassType();
    }
  }, [editClassType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setForm((prev) => ({
    ...prev,
    [name]: ['duration', 'capacity_default', 'waitlist_default'].includes(name) ? Number(value) : value
  }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let error;
    if (editingId) {
      // Update existing class type
      ({ error } = await supabase
        .from('Class_Type')
        .update({
          name: form.name,
          description: form.description,
          updated_at: new Date().toISOString(),
          color: form.color,
          duration: form.duration,
          capacity_default: form.capacity_default,
          waitlist_default: form.waitlist_default,
        })
        .eq('id', editingId));
    } else {
      // Create new class type
      ({ error } = await supabase
        .from('Class_Type')
        .insert({
          box_id: boxId,
          name: form.name,
          description: form.description,
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          color: form.color,
          duration: form.duration,
          capacity_default: form.capacity_default,
          waitlist_default: form.waitlist_default,
        }));
    }
    setLoading(false);
    if (!error) {
      navigate('/classes/types');
    } else {
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Link to="/classes/types" style={{ display: 'inline-flex', alignItems: 'center', color: '#2563eb', textDecoration: 'none', fontWeight: 500, fontSize: 16 }}>
          <AngleLeftIcon style={{ width: 20, height: 20, marginRight: 6 }} />
          Voltar a Tipos de aulas
        </Link>
      </div>
  <h1>{editingId ? 'Editar Tipo de aula' : 'Criar Tipo de aula'}</h1>
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
          <label style={{ display: 'block', marginBottom: 4 }}>Cor da Aula</label>
          <InputField name="color" value={form.color} onChange={handleChange} type="color" />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4 }}>Duração (min)</label>
          <InputField name="duration" value={String(form.duration)} onChange={handleChange} type="number" />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4 }}>Lista de espera</label>
          <InputField name="waitlist_default" value={String(form.waitlist_default)} onChange={handleChange} type="number" />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4 }}>Capacidade</label>
          <InputField name="capacity_default" value={String(form.capacity_default)} onChange={handleChange} type="number" />
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: '8px' }}>
          <button type="submit" style={{ padding: '8px 16px', borderRadius: 6, background: '#3b82f6', color: '#fff', border: 'none' }} disabled={loading}>
            {editingId ? 'Atualizar' : 'Create'}
          </button>
          <Button onClick={() => navigate('/classes/types')} variant="outline">Voltar a Tipos de Aulas</Button>
        </div>
      </form>
    </div>
  );
};

export default ClassTypeCreate;
