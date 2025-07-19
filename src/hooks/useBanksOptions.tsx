
import { useState, useEffect } from 'react'
import { supabase } from '../integrations/supabase/client'

export interface BankOption {
  id: string
  name: string
}

export function useBanksOptions() {
  const [banks, setBanks] = useState<BankOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBanks()
  }, [])

  const fetchBanks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('banks')
        .select('id, name')
        .order('name')

      if (error) throw error

      setBanks(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar bancos')
    } finally {
      setLoading(false)
    }
  }

  return { banks, loading, error, refetch: fetchBanks }
}
