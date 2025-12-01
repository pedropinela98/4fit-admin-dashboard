import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import { supabase } from "../../lib/supabase";
import heic2any from "heic2any";
import { useToast } from "../../components/ui/Toast";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [validInvite, setValidInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [password, setPassword] = useState("");
  const { addToast } = useToast();
  const [phone, setPhone] = useState("");
  const [iban, setIban] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [gender, setGender] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  async function toBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
  async function resizeImage(file: File, maxSizeMB = 50): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Reduz a resolução proporcionalmente
          const scaleFactor = Math.sqrt((maxSizeMB * 1024 * 1024) / file.size);
          if (scaleFactor < 1) {
            width = width * scaleFactor;
            height = height * scaleFactor;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob)
                resolve(new File([blob], file.name, { type: file.type }));
              else reject("Erro ao processar a imagem");
            },
            file.type,
            0.8 // compressão JPEG/PNG
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      addToast("Link de convite inválido", "error");
      setLoading(false);
      return;
    }

    const validateAndFetch = async () => {
      // 1️⃣ Valida o token
      const { data, error } = await supabase.rpc("validate_invite", {
        p_token: token,
      });

      if (error) {
        addToast(
          "Erro ao validar convite. Tenta novamente mais tarde",
          "error"
        );
        setLoading(false);
        return;
      }

      if (!data) {
        addToast("Este convite já expirou ou não é válido", "error");
        setLoading(false);
        return;
      }

      // 2️⃣ Busca o email do convite
      const { data: inviteData, error: inviteError } = await supabase
        .from("Invite")
        .select("email")
        .eq("token", token)
        .single();

      if (inviteError || !inviteData) {
        addToast("Erro ao obter o email do convite", "error");
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

    // ✅ Validações antes da chamada à API
    if (
      !fname.trim() ||
      !lname.trim() ||
      !email.trim() ||
      !password.trim() ||
      !gender.trim()
    ) {
      addToast("Preenche todos os campos obrigatórios", "error");
      return;
    }

    if (password.length < 8) {
      addToast("Password deve ter pelo menos 8 caracteres", "error");
      return;
    }

    if (!isChecked) {
      addToast(
        "Deves aceitar os Termos e Condições antes de continuar",
        "error"
      );
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
            phone,
            gender,
            iban,
            photo: photoFile ? await toBase64(photoFile) : null,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar conta.");
      }
      addToast("Conta criada com sucesso 🎉", "success");
      // Espera 2 segundos e redireciona
      setTimeout(() => navigate("/signin"), 2000);
    } catch (err: any) {
      addToast("Erro ao criar conta", "error");
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
              <div className="flex flex-col gap-1">
                <Label>
                  Genero<span className="text-error-500">*</span>
                </Label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="border px-3 py-2 rounded-md bg-white"
                  required
                >
                  <option value="">Seleciona o género</option>
                  <option value="Male">Masculino</option>
                  <option value="Female">Feminino</option>
                </select>
              </div>

              <div>
                <Label>Número de Telemóvel</Label>
                <Input
                  type="tel"
                  placeholder="Insere o teu número"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <Label>IBAN / Conta Bancária</Label>
                <Input
                  type="text"
                  placeholder="Ex: PT50 0002 0123 1234..."
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                />
              </div>

              <div>
                <Label>Fotografia</Label>
                <div className="mb-3 flex justify-center">
                  {photoPreview && (
                    <img
                      src={URL.createObjectURL(photoFile)}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                    />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    let file = e.target.files?.[0];
                    if (!file) return;

                    // Converter HEIC para JPEG
                    const fileName = file.name.toLowerCase();
                    if (
                      file.type.toLowerCase().includes("heic") ||
                      file.type.toLowerCase().includes("heif") ||
                      fileName.endsWith(".heic") ||
                      fileName.endsWith(".heif")
                    ) {
                      try {
                        const result = await heic2any({
                          blob: file,
                          toType: "image/jpeg",
                        });
                        const blob = Array.isArray(result) ? result[0] : result; // garante que é Blob
                        file = new File(
                          [blob],
                          file.name.replace(/\.[^/.]+$/, ".jpg"),
                          { type: "image/jpeg" }
                        );
                      } catch {
                        addToast("Não foi possível converter HEIC", "error");
                        return;
                      }
                    }

                    // Resizing
                    if (file.size > 50 * 1024 * 1024) {
                      try {
                        file = await resizeImage(file, 50);
                        if (file.size > 50 * 1024 * 1024) {
                          addToast("Não foi possível converter HEIC", "error");
                          return;
                        }
                      } catch {
                        addToast("Não foi possível converter HEIC", "error");
                        return;
                      }
                    }

                    setPhotoFile(file);
                    setPhotoPreview(URL.createObjectURL(file));
                  }}
                  className="border p-2 rounded w-full"
                />
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
