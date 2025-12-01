import BoxDetailsTab from "../../components/common/BoxDetailsTab";
import { useParams } from "react-router-dom";

const BoxDetailsPage: React.FC = () => {
  const { boxId = "" } = useParams<{ boxId: string }>();

  if (!boxId) return <div>O utilizador não tem box associada.</div>;

  return (
    <div className="max-w-1xl mx-auto">
      <BoxDetailsTab boxId={boxId} />
    </div>
  );
};

export default BoxDetailsPage;
