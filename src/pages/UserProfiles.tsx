import PageMeta from "../components/common/PageMeta";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserAddressCard from "../components/UserProfile/UserAddressCard";

import { useUser } from "../context/UserContext";
import { useUserDetail } from "../hooks/useUserDetail";

export default function UserProfiles() {
  const { userDetailId } = useUser();
  const { detail, loading, error } = useUserDetail(userDetailId);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!detail) return <div>Dados não encontrados.</div>;

  return (
    <>
      <PageMeta title="Perfil Utilizador" description="" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Perfil
        </h3>

        <div className="space-y-6">
          <UserMetaCard userDetail={detail} />
          {/* <UserInfoCard user={detail} onUpdate={updateUserDetail} />
          <UserAddressCard user={detail} onUpdate={updateUserDetail} /> */}
        </div>
      </div>
    </>
  );
}
