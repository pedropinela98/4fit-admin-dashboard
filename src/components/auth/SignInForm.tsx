import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useUser } from "../../context/UserContext";

export default function SignInForm() {
  // --- Estados locais ---
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { refreshUserData } = useUser();

  const navigate = useNavigate();

  // --- Função de login ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validação básica
    if (!email || !password) {
      setError("⚠️ Preenche todos os campos antes de continuar.");
      setLoading(false);
      return;
    }

    try {
      // Chamada ao Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      await refreshUserData();
      navigate("/");
    } catch (err: any) {
      setError("❌ Email ou password incorretos.");
    } finally {
      setLoading(false);
    }
  };

  // --- Renderização ---
  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          {/* Cabeçalho */}
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Iniciar Sessão
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Introduz o teu email e password para entrares na tua conta.
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleLogin}>
            <div className="space-y-6">
              {/* Email */}
              <div>
                <Label>
                  Email <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {/* Password */}
              <div>
                <Label>
                  Password <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Introduz a tua password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
              </div>
              {/* Checkbox e link */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox checked={isChecked} onChange={setIsChecked} />
                  <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                    Manter sessão iniciada
                  </span>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Esqueceste-te da password?
                </Link>
              </div>{" "}
              {/* Botão */}
              <div>
                <Button className="w-full" size="sm" disabled={loading}>
                  {loading ? "A autenticar..." : "Iniciar Sessão"}
                </Button>
              </div>
              {/* Mensagem de erro */}
              {error && (
                <p className="text-center text-red-600 text-sm mt-3">{error}</p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
