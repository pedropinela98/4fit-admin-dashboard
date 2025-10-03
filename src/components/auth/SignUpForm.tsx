import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [validInvite, setValidInvite] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      setError("❌ Link de convite inválido.");
      setLoading(false);
      return;
    }

    const validate = async () => {
      const { data, error } = await supabase.rpc("validate_invite", {
        p_token: token,
      });

      if (error) {
        console.error("Erro Supabase:", error);
        setError("❌ Erro ao validar convite. Tenta novamente mais tarde.");
      } else if (!data) {
        setError("❌ Este convite já expirou ou não é válido.");
      } else {
        setValidInvite(true);
      }
      setLoading(false);
    };

    validate();
  }, [location.search]);

  if (loading) {
    return <p className="text-center text-gray-500">🔄 A validar convite...</p>;
  }

  if (!validInvite) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">
          Link inválido ou expirado
        </h2>
        <p className="text-gray-600">
          O convite que usaste já não está disponível. Pede ao administrador da
          box para te enviar um novo convite.
        </p>
      </div>
    );
  }

  // Se o convite for válido -> mostra o formulário
  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Voltar ao painel
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Criar Conta
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Introduz o teu email e password para criar a conta.
            </p>
          </div>
          <form>
            <div className="space-y-5">
              {/* Nome próprio */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <Label>
                    Primeiro Nome<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="fname"
                    name="fname"
                    placeholder="Insere o teu primeiro nome"
                  />
                </div>
                {/* Último Nome */}
                <div className="sm:col-span-1">
                  <Label>
                    Último Nome<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="lname"
                    name="lname"
                    placeholder="Insere o teu apelido"
                  />
                </div>
              </div>
              {/* Email */}
              <div>
                <Label>
                  Email<span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Insere o teu email"
                />
              </div>
              {/* Password */}
              <div>
                <Label>
                  Password<span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    placeholder="Cria a tua password"
                    type={showPassword ? "text" : "password"}
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
              {/* Checkbox */}
              <div className="flex items-center gap-3">
                <Checkbox
                  className="w-5 h-5"
                  checked={isChecked}
                  onChange={setIsChecked}
                />
                <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                  Ao criares a tua conta concordas com os{" "}
                  <span className="text-gray-800 dark:text-white/90">
                    Termos e Condições
                  </span>{" "}
                  e a nossa{" "}
                  <span className="text-gray-800 dark:text-white">
                    Política de Privacidade
                  </span>
                </p>
              </div>
              {/* Botão */}
              <div>
                <button className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
                  Criar Conta
                </button>
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Já tens conta?{" "}
              <Link
                to="/signin"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Inicia Sessão
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
