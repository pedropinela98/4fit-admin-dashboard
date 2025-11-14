import { useState } from "react";
import { supabase } from "../../lib/supabase";

type MemberAssociateProps = {
  boxId: string;
};

export default function MemberAssociate({ boxId }: MemberAssociateProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleInvite() {
    setError(null);
    setSuccess(false);

    if (!name.trim()) {
      setError("O nome é obrigatório.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("O email não é válido.");
      return;
    }

    setLoading(true);

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData?.user) {
        throw new Error("Não foi possível identificar o utilizador.");
      }

      const userId = userData.user.id;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-athlete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            "X-Client-Info": "crossfit-dashboard@1.0.0",
          },
          body: JSON.stringify({
            name,
            email,
            box_id: boxId,
            invited_by: userId,
          }),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Erro na função: ${res.status} - ${errText}`);
      }

      setSuccess(true);
      setName("");
      setEmail("");
    } catch (err) {
      setError("Não foi possível gerar o convite.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 border rounded-lg bg-white dark:bg-gray-800 mx-auto">
      <h2 className="text-lg font-semibold mb-4">Associar novo atleta</h2>

      <label className="block text-sm font-medium mb-1">Nome do atleta</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome completo"
        className="w-full border rounded-lg px-3 py-2 mb-3"
        required
      />

      <label className="block text-sm font-medium mb-1">
        Email do utilizador
      </label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="exemplo@dominio.com"
        className="w-full border rounded-lg px-3 py-2 mb-3"
        required
      />

      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      {success && (
        <p className="text-sm text-green-600 mb-2">
          Convite enviado com sucesso! 🎉
        </p>
      )}

      <button
        type="button"
        onClick={handleInvite}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "A enviar..." : "Enviar convite"}
      </button>
    </div>
  );
}
