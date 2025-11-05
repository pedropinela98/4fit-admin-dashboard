import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import AuthLayout from './AuthPageLayout';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Button from '../../components/ui/button/Button';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const res = await fetch('https://mpkisxsfbkinvtpdwrti.supabase.co/functions/v1/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage('✅ Verifica o teu email para o link de redefinição de password. O link é válido por 2 horas.');
        setEmail(''); // Clear email field
      } else {
        setError(data.error || 'Algo correu mal. Por favor tenta novamente.');
      }
    } catch (err) {
      setError('Erro de rede. Verifica a tua conexão e tenta novamente.');
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
              Esqueceste-te da password?
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Introduz o teu email e enviaremos um link para redefinires a tua password.
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Email */}
              <div>
                <Label>
                  Email <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="seu-email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  disabled={loading}
                  className="w-full justify-center"
                >
                  {loading ? 'A enviar...' : 'Enviar Link de Redefinição'}
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
        </div>
      </div>
    </div>
  );
};

export default function ForgotPassword() {
  return (
    <>
      <PageMeta title="Esqueceste-te da password?" description="" />
      <AuthLayout>
        <ForgotPasswordForm />
      </AuthLayout>
    </>
  );
}
