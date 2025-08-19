'use client';

import React, { useEffect, useState } from 'react';
import WaitList from './UI';
import ThWrapper from './ThWrapper';
import { WaitListData } from './types'; // If you have defined WaitListData

interface Props {
  serverData: WaitListData;
}

const WaitListPageWrapper: React.FC<Props> = ({ serverData }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WaitListData | null>(null);

  useEffect(() => {
    // Simulate loading or hydrate client-side data
    setTimeout(() => {
      setData(serverData);
      setLoading(false);
    }, 300); // optional: simulate small delay
  }, [serverData]);

  return (
    <ThWrapper loading={loading}>
      {data && <WaitList {...data} />}
    </ThWrapper>
  );
};

export default WaitListPageWrapper;
