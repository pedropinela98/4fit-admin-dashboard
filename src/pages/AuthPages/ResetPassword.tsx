import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import AuthLayout from './AuthPageLayout';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Button from '../../components/ui/button/Button';

const ResetPasswordForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token inválido ou em falta. Por favor solicita um novo link de redefinição.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    // Validation
    if (password.length < 6) {
      setError('A password deve ter pelo menos 6 caracteres.');
      return;
    }
    
    if (password !== confirm) {
      setError('As passwords não coincidem.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('https://mpkisxsfbkinvtpdwrti.supabase.co/functions/v1/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage('✅ Password redefinida com sucesso! A redirecionar para o login...');
        // Redirect to login after 2 seconds
        setTimeout(() => navigate('/signin'), 2000);
      } else {
        setError(data.error || 'Algo correu mal. Por favor tenta novamente.');
      }
    } catch (err) {
      setError('Erro de rede. Por favor verifica a tua conexão e tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          {/* Cabeçalho */}
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Redefinir Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Introduz a tua nova password abaixo.
            </p>
          </div>

          {!token ? (
            <div className="p-4 text-sm rounded-md bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200">
              <p className="mb-2">❌ Token inválido ou em falta.</p>
              <Link
                to="/forgot-password"
                className="font-medium text-brand-500 hover:text-brand-600 underline"
              >
                Solicitar novo link de redefinição →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Nova Password */}
                <div>
                  <Label>
                    Nova Password <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                    disabled={loading}
                  />
                </div>

                {/* Confirmar Password */}
                <div>
                  <Label>
                    Confirmar Password <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="password"
                    placeholder="Repete a nova password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    minLength={6}
                    required
                    disabled={loading}
                  />
                </div>

                {/* Mensagens de sucesso/erro */}
                {message && (
                  <div className="p-4 text-sm rounded-md bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200">
                    {message}
                  </div>
                )}

                {error && (
                  <div className="p-4 text-sm rounded-md bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200">
                    ❌ {error}
                  </div>
                )}

                {/* Botão */}
                <div>
                  <Button
                    type="submit"
                    disabled={loading || !token}
                    className="w-full justify-center"
                  >
                    {loading ? 'A redefinir...' : 'Redefinir Password'}
                  </Button>
                </div>

                {/* Link voltar */}
                <div className="text-center">
                  <Link
                    to="/signin"
                    className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    ← Voltar ao Login
                  </Link>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ResetPassword() {
  return (
    <>
      <PageMeta title="Redefinir Password" description="" />
      <AuthLayout>
        <ResetPasswordForm />
      </AuthLayout>
    </>
  );
}
