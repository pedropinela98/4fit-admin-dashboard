import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import BoxDetailsTab from "../../components/common/BoxDetailsTab";

const BoxDetailsPage: React.FC = () => {
  const [boxId, setBoxId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserBox = async () => {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return;

      // Fetch box relation
      const { data, error } = await supabase
        .from("Box_Staff")
        .select("box_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error && data?.box_id) {
        setBoxId(data.box_id);
      }

      setLoading(false);
    };

    fetchUserBox();
  }, []);

  if (loading) return <div>A carregar...</div>;
  if (!boxId) return <div>O utilizador não tem box associada.</div>;

  return (
    <div className="max-w-1xl mx-auto">
      <BoxDetailsTab boxId={boxId} />
    </div>
  );
};

export default BoxDetailsPage;
