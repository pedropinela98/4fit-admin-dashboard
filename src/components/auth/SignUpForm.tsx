import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
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
  const [email, setEmail] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      setError("❌ Link de convite inválido.");
      setLoading(false);
      return;
    }

    const validateAndFetch = async () => {
      // 1️⃣ Valida o token
      const { data, error } = await supabase.rpc("validate_invite", {
        p_token: token,
      });

      if (error) {
        console.error("Erro Supabase:", error);
        setError("❌ Erro ao validar convite. Tenta novamente mais tarde.");
        setLoading(false);
        return;
      }

      if (!data) {
        setError("❌ Este convite já expirou ou não é válido.");
        setLoading(false);
        return;
      }

      // 2️⃣ Busca o email do convite
      const { data: inviteData, error: inviteError } = await supabase
        .from("invite")
        .select("email")
        .eq("token", token)
        .single();

      if (inviteError || !inviteData) {
        setError("❌ Erro ao obter o email do convite.");
        setLoading(false);
        return;
      }

      setEmail(inviteData.email);
      setValidInvite(true);
      setLoading(false);
    };

    validateAndFetch();
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // ✅ Validações antes da chamada à API
    if (!fname.trim() || !lname.trim() || !email.trim() || !password.trim()) {
      setError("❌ Todos os campos são obrigatórios.");
      return;
    }

    if (password.length < 8) {
      setError("❌ A password deve ter pelo menos 8 caracteres.");
      return;
    }

    if (!isChecked) {
      setError("❌ Deves aceitar os Termos e Condições antes de continuar.");
      return;
    }

    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sign-up`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            email,
            password,
            first_name: fname,
            last_name: lname,
            token,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar conta.");
      }

      setSuccess(true);
      // Espera 2 segundos e redireciona
      setTimeout(() => navigate("/signin"), 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "❌ Ocorreu um erro ao criar a conta.");
    }
  };

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
              Introduz os teus dados para criares a conta.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label>
                    Primeiro Nome<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Insere o teu primeiro nome"
                    value={fname}
                    onChange={(e) => setFname(e.target.value)}
                  />
                </div>
                <div>
                  <Label>
                    Último Nome<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Insere o teu apelido"
                    value={lname}
                    onChange={(e) => setLname(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <Label>
                  Password<span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    placeholder="Cria a tua password"
                    type={showPassword ? "text" : "password"}
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

              <div className="flex items-center gap-3">
                <Checkbox checked={isChecked} onChange={setIsChecked} />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ao criares a tua conta concordas com os{" "}
                  <span className="text-gray-800 dark:text-white/90">
                    Termos e Condições
                  </span>{" "}
                  e a nossa{" "}
                  <span className="text-gray-800 dark:text-white">
                    Política de Privacidade
                  </span>
                  .
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                >
                  Criar Conta
                </button>
              </div>

              {error && (
                <p className="text-sm text-red-600 text-center mt-3">{error}</p>
              )}
              {success && (
                <p className="text-sm text-green-600 text-center mt-3">
                  ✅ Conta criada com sucesso!
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
