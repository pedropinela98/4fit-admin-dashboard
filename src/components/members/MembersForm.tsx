import { useState } from "react";
import { Member } from "../../services/members.service";
import { PencilIcon, UserIcon } from "@heroicons/react/24/solid";
import heic2any from "heic2any";

// mock só para testes (simula tabela user_details)
const mockUserDetails = [
  { id: "user-1", email: "joao@example.com", name: "João Silva" },
  { id: "user-2", email: "maria@example.com", name: "Maria Santos" },
];

type MemberFormProps = {
  mode: "create" | "edit";
  initialData?: Partial<Member>;
  onSubmit: (data: Partial<Member>) => void;
};

export default function MemberForm({
  mode,
  initialData = {},
  onSubmit,
}: MemberFormProps) {
  const [step, setStep] = useState<"checkEmail" | "associate" | "form">(
    mode === "create" ? "checkEmail" : "form"
  );

  // estado do email sempre presente
  const [email, setEmail] = useState(initialData.email || "");
  const [foundUser, setFoundUser] = useState<any>(null);

  // restantes campos só usados no form completo
  const [photoUrl, setPhotoUrl] = useState(initialData.photoUrl || "");
  const [name, setName] = useState(initialData.name || "");
  const [phone, setPhone] = useState(
    initialData.phone?.startsWith("+351") ? initialData.phone : "+351 "
  );
  const [nif, setNif] = useState((initialData as any).nif || "");
  const [iban, setIban] = useState(
    initialData.iban?.startsWith("PT50") ? initialData.iban : "PT50 "
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ---- Helpers ----
  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, "");
    const withoutPrefix = digits.startsWith("351") ? digits.slice(3) : digits;
    const trimmed = withoutPrefix.slice(0, 9);
    return "+351 " + trimmed;
  }

  function formatIban(value: string) {
    const cleaned = value.replace(/\s/g, "").toUpperCase();
    const withoutPrefix = cleaned.startsWith("PT50")
      ? cleaned.slice(4)
      : cleaned;
    const trimmed = withoutPrefix.slice(0, 21);
    return "PT50 " + trimmed.replace(/(.{4})/g, "$1 ").trim();
  }

  // ---- Validação ----
  function validate() {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "O nome é obrigatório.";
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "O email não é válido.";
    }
    const phoneDigits = phone.replace(/\D/g, "").slice(3);
    if (phoneDigits.length !== 9) {
      newErrors.phone = "O número de telemóvel deve ter 9 dígitos após +351.";
    }
    if (nif && !/^\d{9}$/.test(nif)) {
      newErrors.nif = "O NIF deve ter 9 dígitos.";
    }
    const ibanDigits = iban.replace(/\s/g, "").toUpperCase();
    if (ibanDigits !== "PT50" && ibanDigits.length > 0) {
      if (!ibanDigits.startsWith("PT50") || ibanDigits.length !== 25) {
        newErrors.iban = "O IBAN deve começar por PT50 e ter 25 caracteres.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const ibanDigits = iban.replace(/\s/g, "").toUpperCase();
    const finalIban = ibanDigits === "PT50" ? "" : iban;

    onSubmit({
      ...initialData,
      email,
      photoUrl,
      name,
      phone,
      nif,
      iban: finalIban,
    });
  }

  // ---- Foto (com suporte HEIC → JPEG) ----
  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let blob: Blob = file;
      if (
        file.type === "image/heic" ||
        file.name.toLowerCase().endsWith(".heic")
      ) {
        const converted = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.9,
        });
        blob = converted as Blob;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) setPhotoUrl(reader.result.toString());
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("Erro ao processar imagem:", err);
      alert("Não foi possível carregar esta foto. Tenta outro formato.");
    }
  }

  // ---- Step 1: verificar email ----
  if (step === "checkEmail") {
    return (
      <div className="p-6 border rounded-lg bg-white dark:bg-gray-800">
        <h2 className="text-lg font-medium mb-4">Adicionar membro</h2>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Escreve o email do utilizador"
          className="w-full border px-3 py-2 rounded-lg mb-2"
          required
        />

        {/* erro de email inválido */}
        {errors.email && (
          <p className="text-sm text-red-600 mb-2">{errors.email}</p>
        )}

        <button
          type="button"
          onClick={() => {
            // validação simples de email
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              setErrors({ email: "O email não é válido." });
              return;
            }

            setErrors({}); // limpa erros se estiver ok

            const existing = mockUserDetails.find((u) => u.email === email);
            if (existing) {
              setFoundUser(existing);
              setStep("associate");
            } else {
              setStep("form");
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Verificar
        </button>
      </div>
    );
  }

  // ---- Step 2: se já existe user → só associar ----
  if (step === "associate" && foundUser) {
    return (
      <div className="p-6 border rounded-lg bg-white dark:bg-gray-800">
        <p className="mb-4">
          O utilizador <b>{foundUser.name}</b> já existe com este email.
        </p>
        <button
          type="button"
          onClick={() =>
            onSubmit({
              user_id: foundUser.id,
              email: foundUser.email,
              name: foundUser.name,
            })
          }
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          Associar utilizador
        </button>
      </div>
    );
  }

  // ---- Step 3: form completo (se não existir) ----
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg border"
    >
      {/* Foto */}
      <div className="flex flex-col items-center gap-3">
        <label className="relative cursor-pointer">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Foto do membro"
              className="w-24 h-24 rounded-full object-cover border"
            />
          ) : (
            <div className="w-24 h-24 rounded-full border flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              <UserIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}
          <div className="absolute bottom-0 right-0 bg-blue-600 p-1 rounded-full shadow-md">
            <PencilIcon className="h-4 w-4 text-white" />
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </label>
      </div>

      {/* Nome */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nome
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`mt-1 w-full border rounded-lg px-3 py-2 ${
            errors.name ? "border-red-500" : ""
          }`}
          required
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Email (readonly depois de verificado) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email
        </label>
        <input
          type="email"
          value={email}
          readOnly
          className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-800"
        />
      </div>

      {/* Telemóvel */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Telemóvel
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          className={`mt-1 w-full border rounded-lg px-3 py-2 ${
            errors.phone ? "border-red-500" : ""
          }`}
          required
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      {/* NIF */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          NIF
        </label>
        <input
          type="text"
          value={nif}
          onChange={(e) => setNif(e.target.value.replace(/\D/g, ""))}
          maxLength={9}
          className={`mt-1 w-full border rounded-lg px-3 py-2 ${
            errors.nif ? "border-red-500" : ""
          }`}
        />
        {errors.nif && (
          <p className="mt-1 text-sm text-red-600">{errors.nif}</p>
        )}
      </div>

      {/* IBAN */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          IBAN
        </label>
        <input
          type="text"
          value={iban}
          onChange={(e) => setIban(formatIban(e.target.value))}
          maxLength={29}
          className={`mt-1 w-full border rounded-lg px-3 py-2 ${
            errors.iban ? "border-red-500" : ""
          }`}
        />
        {errors.iban && (
          <p className="mt-1 text-sm text-red-600">{errors.iban}</p>
        )}
      </div>

      {/* Botão */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          {mode === "create" ? "Criar Membro" : "Guardar Alterações"}
        </button>
      </div>
    </form>
  );
}
