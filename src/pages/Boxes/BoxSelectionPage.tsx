import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useUser } from "../../context/UserContext";

export default function BoxSelectionPage() {
  const { userDetailId, availableBoxes, setBoxId, loading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      // Se não tiver boxes ou apenas 1, redireciona automaticamente
      if (!userDetailId) navigate("/signin");
      else if (availableBoxes.length === 1)
        navigate(`/box/${availableBoxes[0].box_id}`);
    }
  }, [loading, userDetailId, availableBoxes, navigate]);

  if (loading)
    return <p className="text-center mt-20">🔄 A carregar boxes...</p>;

  if (availableBoxes.length <= 1) return null; // Não mostrar se só tiver 1 ou nenhuma

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
        Seleciona a Box
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {availableBoxes.map((box) => (
          <button
            key={box.box_id}
            onClick={() => {
              setBoxId(box.box_id);
              navigate(`/box/${box.box_id}`);
            }}
            className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow hover:shadow-md transition flex flex-col items-center justify-center text-gray-800 dark:text-white font-medium"
          >
            <span className="text-lg">Box:</span>
            <span className="mt-2 text-sm break-words">{box.box_name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
