
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface UsageControlData {
  isTrialActive: boolean;
  isPremium: boolean;
  daysRemaining: number;
  trialEndDate: string;
}

export const useUsageControl = () => {
  const { user } = useAuth();
  const [usageData, setUsageData] = useState<UsageControlData | null>(null);
  const [loading, setLoading] = useState(true);

  const checkTrialStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('check_user_trial_status', {
        user_uuid: user.id
      });

      if (error) {
        console.error('Erro ao verificar status do trial:', error);
        return;
      }

      if (data && data.length > 0) {
        const trialData = data[0];
        setUsageData({
          isTrialActive: trialData.is_trial_active,
          isPremium: trialData.is_premium,
          daysRemaining: trialData.days_remaining,
          trialEndDate: trialData.trial_end_date
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados de uso:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkTrialStatus();
  }, [user]);

  const upgradeToPremium = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_usage_control')
        .update({ 
          is_premium: true, 
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao atualizar para premium:', error);
        return false;
      }

      await checkTrialStatus();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar status premium:', error);
      return false;
    }
  };

  return {
    usageData,
    loading,
    checkTrialStatus,
    upgradeTopremium,
    isTrialExpired: usageData ? !usageData.isTrialActive && !usageData.isPremium : false,
    canUseApp: usageData ? usageData.isTrialActive || usageData.isPremium : false
  };
};
