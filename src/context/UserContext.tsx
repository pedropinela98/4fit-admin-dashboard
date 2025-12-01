import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";

interface UserContextType {
  userDetailId: string | null;
  boxId: string | null;
  boxName: string | null;
  roles: string[];
  isSuperAdmin: boolean;
  loading: boolean;
  setBoxId: (boxId: string | null) => void;
  availableBoxes: { box_id: string; box_name: string; role: string[] }[];
}

const UserContext = createContext<UserContextType>({
  userDetailId: null,
  boxId: null,
  boxName: null,
  roles: [],
  isSuperAdmin: false,
  loading: true,
  setBoxId: () => {},
  availableBoxes: [],
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [userDetailId, setUserDetailId] = useState<string | null>(null);
  const [boxId, setBoxId] = useState<string | null>(null);
  const [boxName, setBoxName] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [availableBoxes, setAvailableBoxes] = useState<
    { box_id: string; box_name: string; role: string[] }[]
  >([]);

  // Função para atualizar boxId e persistir no localStorage
  const setBoxIdAndPersist = (id: string | null) => {
    setBoxId(id);
    if (id) localStorage.setItem("selectedBoxId", id);
    else localStorage.removeItem("selectedBoxId");
  };

  // Carrega boxId salvo no localStorage
  useEffect(() => {
    const savedBoxId = localStorage.getItem("selectedBoxId");
    if (savedBoxId) setBoxId(savedBoxId);
  }, []);

  const fetchUserData = async () => {
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;

    if (!session?.user) {
      setUserDetailId(null);
      setBoxId(null);
      setRoles([]);
      setAvailableBoxes([]);
      setIsSuperAdmin(false);
      setLoading(false);
      return;
    }

    const userId = session.user.id;

    // 🔹 RPC para buscar userDetailId e isSuperAdmin
    const { data: userInfo, error: rpcError } = await supabase.rpc(
      "get_user_detail_info",
      { p_auth_user_id: userId }
    );

    if (rpcError) console.error("Erro ao buscar user info:", rpcError);

    if (!userInfo || userInfo.length === 0 || !userInfo[0].user_detail_id) {
      setUserDetailId(null);
      setIsSuperAdmin(false);
      setLoading(false);
      return;
    }

    const udId = userInfo[0].user_detail_id;
    const superAdmin = userInfo[0].is_superadmin;
    setUserDetailId(udId);
    setIsSuperAdmin(superAdmin);

    let boxesData: any[] = [];

    if (superAdmin) {
      // 🔹 Buscar todas as boxes ativas para super_admin
      const { data, error } = await supabase
        .from("Box")
        .select("id, name")
        .eq("active", true)
        .order("name", { ascending: true });

      if (error) console.error("Erro ao buscar boxes ativas:", error);
      else
        boxesData = data.map((b: any) => ({
          box_id: b.id,
          box_name: b.name,
          role: ["super_admin"],
        }));
    } else {
      // 🔹 Buscar boxes associadas normalmente via RPC
      const { data, error } = await supabase.rpc("get_staff_by_userdetail_id", {
        p_userdetail_id: udId,
      });
      if (error) console.error("Erro ao buscar boxes do staff:", error);
      else boxesData = data;
    }

    setAvailableBoxes(boxesData);

    // 🔹 Seleciona box automaticamente
    if (boxesData.length === 1) {
      setBoxIdAndPersist(boxesData[0].box_id);
      setRoles(boxesData[0].role ?? []);
      setBoxName(boxesData[0].box_name ?? null);
    } else {
      // Se já existe boxId no localStorage e é válida
      const savedBoxId = localStorage.getItem("selectedBoxId");
      if (savedBoxId && boxesData.some((b) => b.box_id === savedBoxId)) {
        setBoxId(savedBoxId);
        const currentBox = boxesData.find((b) => b.box_id === savedBoxId);
        setRoles(currentBox?.role ?? []);
        setBoxName(currentBox?.box_name ?? null);
      } else {
        setBoxId(null);
        setRoles([]);
        setBoxName(null);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchUserData();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchUserData();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Atualiza roles e boxName quando boxId muda
  useEffect(() => {
    if (boxId && availableBoxes.length > 0) {
      const currentBox = availableBoxes.find((b) => b.box_id === boxId);
      setRoles(currentBox?.role ?? []);
      setBoxName(currentBox?.box_name ?? null);
    }
  }, [boxId, availableBoxes]);

  return (
    <UserContext.Provider
      value={{
        userDetailId,
        boxId,
        boxName,
        roles,
        isSuperAdmin,
        loading,
        setBoxId: setBoxIdAndPersist,
        availableBoxes,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
