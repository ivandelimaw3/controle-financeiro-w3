
import React from 'react';
import { Layout } from '@/components/Layout';
import { InvestmentsSection } from '@/components/Dashboard/InvestmentsSection';

const Investimentos: React.FC = () => {
  console.log('Investimentos: page rendering');
  
  return (
    <Layout>
      <InvestmentsSection />
    </Layout>
  );
};

export default Investimentos;
