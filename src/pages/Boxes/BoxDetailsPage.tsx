import React from 'react';
import BoxDetailsTab from '../../components/common/BoxDetailsTab';

// TODO: Replace with dynamic boxId if needed
const boxId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

const BoxDetailsPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <BoxDetailsTab boxId={boxId} />
    </div>
  );
};

export default BoxDetailsPage;
