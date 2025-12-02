import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
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
  const lastFetchedRef = useRef<number | null>(null);
  const [availableBoxes, setAvailableBoxes] = useState<
    { box_id: string; box_name: string; role: string[] }[]
  >([]);

  // Atualiza boxId e persiste no localStorage
  const setBoxIdAndPersist = (id: string | null) => {
    setBoxId(id);
    if (id) localStorage.setItem("selectedBoxId", id);
    else localStorage.removeItem("selectedBoxId");
  };

  // Função para carregar dados do usuário do Supabase
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
      localStorage.removeItem("userDetail");
      setLoading(false);
      return;
    }

    const userId = session.user.id;

    // RPC para buscar userDetailId e isSuperAdmin
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
      const { data, error } = await supabase
        .from("Box")
        .select("id, name")
        .eq("active", true)
        .order("name", { ascending: true });
      if (error) console.error(error);
      else
        boxesData = data.map((b: any) => ({
          box_id: b.id,
          box_name: b.name,
          role: ["super_admin"],
        }));
    } else {
      const { data, error } = await supabase.rpc("get_staff_by_userdetail_id", {
        p_userdetail_id: udId,
      });
      if (error) console.error(error);
      else boxesData = data;
    }

    setAvailableBoxes(boxesData);

    // Seleciona box automaticamente
    let selectedBox: (typeof boxesData)[0] | null = null;

    const savedBoxId = localStorage.getItem("selectedBoxId");
    if (savedBoxId && boxesData.some((b) => b.box_id === savedBoxId)) {
      selectedBox = boxesData.find((b) => b.box_id === savedBoxId)!;
    } else if (boxesData.length === 1) {
      selectedBox = boxesData[0];
    }

    if (selectedBox) {
      setBoxIdAndPersist(selectedBox.box_id);
      setRoles(selectedBox.role ?? []);
      setBoxName(selectedBox.box_name ?? null);
    } else {
      setBoxId(null);
      setRoles([]);
      setBoxName(null);
    }

    // Salva no localStorage para uso rápido
    localStorage.setItem(
      "userDetail",
      JSON.stringify({
        userDetailId: udId,
        boxId: selectedBox?.box_id ?? null,
        boxName: selectedBox?.box_name ?? null,
        roles: selectedBox?.role ?? [],
        isSuperAdmin: superAdmin,
        availableBoxes: boxesData,
      })
    );

    setLoading(false);
  };

  // Carrega do localStorage ao montar
  useEffect(() => {
    const stored = localStorage.getItem("userDetail");
    if (stored) {
      const data = JSON.parse(stored);
      setUserDetailId(data.userDetailId);
      setBoxId(data.boxId);
      setBoxName(data.boxName);
      setRoles(data.roles);
      setIsSuperAdmin(data.isSuperAdmin);
      setAvailableBoxes(data.availableBoxes);
      setLoading(false);
    } else {
      fetchUserData();
    }

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const now = Date.now();
        if (
          !lastFetchedRef.current ||
          now - lastFetchedRef.current > 1000 * 60 * 5
        ) {
          fetchUserData();
          lastFetchedRef.current = now;
        }
      }
    );

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
