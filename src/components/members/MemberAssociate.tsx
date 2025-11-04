import { useState } from "react";
import { supabase } from "../../lib/supabase";

type MemberAssociateProps = {
  boxId: string;
  boxName: string;
  adminName: string;
};

export default function MemberAssociate({
  boxId,
  boxName,
  adminName,
}: MemberAssociateProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleInvite() {
    setError(null);
    setSuccess(false);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("O email não é válido.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("invite-user", {
        body: {
          email,
          box_id: boxId,
          box_name: boxName,
          roles: ["athlete"],
          invited_by: adminName,
          admin_name: adminName,
        },
      });

      if (error) throw error;

      setSuccess(true);
      setEmail("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao enviar convite.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 border rounded-lg bg-white dark:bg-gray-800 mx-auto">
      <h2 className="text-lg font-semibold mb-4">Associar novo atleta</h2>

      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
