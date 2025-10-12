import React from 'react';
import BoxDetailsTab from '../../components/common/BoxDetailsTab';

const boxId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

const BoxDetailsPage: React.FC = () => {
  return (
    <div className="max-w-1xl mx-auto">
      <BoxDetailsTab boxId={boxId} />
    </div>
  );
};

export default BoxDetailsPage;
