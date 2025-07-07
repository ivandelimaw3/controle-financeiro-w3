
import { useBanksData } from '@/hooks/useBanksData';

export const useBanksOptions = () => {
  const { banks, isLoading } = useBanksData();
  
  const banksOptions = banks.map(bank => ({
    value: bank.id.toString(),
    label: bank.nickname || bank.name
  }));

  return {
    banksOptions,
    isLoading
  };
};
