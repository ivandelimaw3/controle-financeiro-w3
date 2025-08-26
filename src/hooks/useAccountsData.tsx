import { useState, useEffect } from "react"
import { supabase, checkSupabaseConfig } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"

// <CHANGE> Mantendo todas as interfaces existentes
export interface Account {
  id: number
  description: string
  amount: number
  category: string
  dueDate: string
  dataConta?: string
  type: "receita" | "despesa"
  status: "pendente" | "pago" | "recebido"
  parcela?: string
  recorrente_id?: string
  bank_id?: number
  payment_source: "bank"
  payment_source_id?: number
  payment_source_name?: string
  previous_balance?: number
}

export interface CreateAccountData extends Omit<Account, "id" | "parcela" | "recorrente_id"> {
  qtd_parcelas?: number
}

export interface Transaction {
  id: number
  description: string
  amount: number
  category: string
  dueDate: string
  dataConta?: string
  type: "receita" | "despesa"
  status: "pendente" | "pago" | "recebido"
  parcela?: string
  recorrente_id?: string
  bank_id?: number
  payment_source: "bank"
  payment_source_id?: number
  payment_source_name?: string
}

export const useAccountsData = () => {
  // <CHANGE> Mantendo todo o estado existente
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // <CHANGE> Mantendo função de invalidação de cache existente
  const invalidateBanksCache = () => {
    try {
      queryClient.invalidateQueries({ queryKey: ["banks"] })
    } catch (error) {
      console.log("QueryClient not available for cache invalidation")
    }
  }

  // <CHANGE> Melhorando função para buscar saldo anterior do mês atual
  const getCurrentMonthPreviousBalance = async (): Promise<number> => {
    try {
      if (!checkSupabaseConfig()) {
        // Mock data for development
        return 1500
      }

      if (!user) {
        return 0
      }

      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()

      // Query the accounts table for previous_balance field
      const { data, error } = await supabase
        .from("accounts")
        .select("previous_balance")
        .eq("user_id", user.id)
        .gte("due_date", `${currentYear}-${currentMonth.toString().padStart(2, "0")}-01`)
        .lt("due_date", `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-01`)
        .not("previous_balance", "is", null)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao buscar saldo anterior:", error)
        return 0
      }

      return data?.previous_balance || 0
    } catch (error) {
      console.error("Erro ao buscar saldo anterior:", error)
      return 0
    }
  }

  // <CHANGE> Mantendo função fetchAccounts existente com dados mock
  const fetchAccounts = async () => {
    try {
      setLoading(true)

      if (!checkSupabaseConfig()) {
        console.log("Supabase não configurado - usando dados mock")
        setAccounts([
          {
            id: 1,
            description: "Saldo Inicial - 01/2024",
            amount: 1500,
            category: "Saldo Inicial",
            dueDate: "2024-01-01",
            type: "receita",
            status: "recebido",
            payment_source: "bank",
            previous_balance: 1500,
          },
          {
            id: 2,
            description: "Receita Mock",
            amount: 500,
            category: "Vendas",
            dueDate: "2024-01-15",
            type: "receita",
            status: "recebido",
            payment_source: "bank",
            previous_balance: null,
          },
          {
            id: 3,
            description: "Despesa Mock",
            amount: -200,
            category: "Gastos",
            dueDate: "2024-01-10",
            type: "despesa",
            status: "pago",
            payment_source: "bank",
            previous_balance: null,
          },
        ])
        setLoading(false)
        return
      }

      if (!user) {
        console.log("Usuário não autenticado - fetchAccounts")
        setAccounts([])
        return
      }

      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Erro ao carregar contas:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar as contas.",
          variant: "destructive",
        })
        return
      }

      // Transformar dados do Supabase para o formato da aplicação
      const transformedAccounts: Account[] = data.map((account) => ({
        id: account.id,
        description: account.description,
        amount: Number.parseFloat(account.amount.toString()),
        category: account.category,
        dueDate: account.due_date,
        dataConta: account.data_conta,
        type: account.type as "receita" | "despesa",
        status: account.status as "pendente" | "pago" | "recebido",
        parcela: account.parcela,
        recorrente_id: account.recorrente_id,
        bank_id: account.bank_id,
        payment_source: "bank",
        payment_source_id: account.payment_source_id,
        payment_source_name: account.payment_source_name,
        previous_balance: account.previous_balance,
      }))

      setAccounts(transformedAccounts)
      console.log(`Contas carregadas: ${transformedAccounts.length} contas encontradas`)
    } catch (error) {
      console.error("Erro ao carregar contas:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as contas.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // <CHANGE> Mantendo função addAccount existente com suporte a parcelas
  const addAccount = async (accountData: CreateAccountData) => {
    try {
      if (!checkSupabaseConfig()) {
        // For mock mode, just add to local state
        const newAccount: Account = {
          id: Math.max(...accounts.map((a) => a.id), 0) + 1,
          ...accountData,
          parcela: undefined,
          recorrente_id: undefined,
          previous_balance: null,
        }
        setAccounts((prev) => [newAccount, ...prev])
        toast({
          title: "Sucesso (Mock)",
          description: "Conta criada localmente. Configure Supabase para persistir dados.",
        })
        return
      }

      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive",
        })
        return
      }

      if (accountData.qtd_parcelas && accountData.qtd_parcelas > 1) {
        // Criar múltiplas parcelas
        const recorrenteId = crypto.randomUUID()
        const registros = []
        const valorPorParcela = accountData.amount / accountData.qtd_parcelas

        for (let i = 0; i < accountData.qtd_parcelas; i++) {
          const data = new Date(accountData.dueDate)
          data.setMonth(data.getMonth() + i)

          registros.push({
            description: accountData.description,
            amount: valorPorParcela,
            category: accountData.category,
            due_date: data.toISOString().split("T")[0],
            data_conta: accountData.dataConta,
            type: accountData.type,
            status: accountData.status,
            user_id: user.id,
            parcela: `${i + 1}/${accountData.qtd_parcelas}`,
            recorrente_id: recorrenteId,
            bank_id: accountData.bank_id,
            payment_source: "bank",
            payment_source_id: accountData.payment_source_id,
            payment_source_name: accountData.payment_source_name,
            previous_balance: null,
          })
        }

        const { data: insertData, error } = await supabase.from("accounts").insert(registros).select()

        if (error) {
          console.error("Erro ao criar parcelas:", error)
          toast({
            title: "Erro",
            description: "Não foi possível criar as parcelas.",
            variant: "destructive",
          })
          return
        }

        // Transformar e adicionar à lista local
        const newAccounts = insertData.map((account) => ({
          id: account.id,
          description: account.description,
          amount: Number.parseFloat(account.amount.toString()),
          category: account.category,
          dueDate: account.due_date,
          dataConta: account.data_conta,
          type: account.type as "receita" | "despesa",
          status: account.status as "pendente" | "pago" | "recebido",
          parcela: account.parcela,
          recorrente_id: account.recorrente_id,
          bank_id: account.bank_id,
          payment_source: "bank" as const,
          payment_source_id: account.payment_source_id,
          payment_source_name: account.payment_source_name,
          previous_balance: account.previous_balance,
        }))

        setAccounts((prev) => [...newAccounts, ...prev])

        // SÓ invalidar cache se a conta for paga/recebida
        if (accountData.status === "pago" || accountData.status === "recebido") {
          invalidateBanksCache()
        }

        toast({
          title: "Sucesso",
          description: `${accountData.qtd_parcelas} parcelas criadas com sucesso.`,
        })
      } else {
        // Criar conta única
        const { data, error } = await supabase
          .from("accounts")
          .insert([
            {
              description: accountData.description,
              amount: accountData.amount,
              category: accountData.category,
              due_date: accountData.dueDate,
              data_conta: accountData.dataConta,
              type: accountData.type,
              status: accountData.status,
              user_id: user.id,
              bank_id: accountData.bank_id,
              payment_source: "bank",
              payment_source_id: accountData.payment_source_id,
              payment_source_name: accountData.payment_source_name,
              previous_balance: null,
            },
          ])
          .select()
          .single()

        if (error) {
          console.error("Erro ao criar conta:", error)
          toast({
            title: "Erro",
            description: "Não foi possível criar a conta.",
            variant: "destructive",
          })
          return
        }

        // Transformar e adicionar à lista local
        const newAccount: Account = {
          id: data.id,
          description: data.description,
          amount: Number.parseFloat(data.amount.toString()),
          category: data.category,
          dueDate: data.due_date,
          dataConta: data.data_conta,
          type: data.type as "receita" | "despesa",
          status: data.status as "pendente" | "pago" | "recebido",
          parcela: data.parcela,
          recorrente_id: data.recorrente_id,
          bank_id: data.bank_id,
          payment_source: "bank",
          payment_source_id: data.payment_source_id,
          payment_source_name: data.payment_source_name,
          previous_balance: data.previous_balance,
        }

        setAccounts((prev) => [newAccount, ...prev])

        // SÓ invalidar cache se a conta for paga/recebida
        if (accountData.status === "pago" || accountData.status === "recebido") {
          invalidateBanksCache()
        }

        toast({
          title: "Sucesso",
          description: "Conta criada com sucesso.",
        })
      }
    } catch (error) {
      console.error("Erro ao criar conta:", error)
      toast({
        title: "Erro",
        description: "Não foi possível criar a conta.",
        variant: "destructive",
      })
    }
  }

  // <CHANGE> Mantendo função updateAccount existente
  const updateAccount = async (updatedAccount: Account) => {
    try {
      if (!checkSupabaseConfig()) {
        // For mock mode, just update local state
        setAccounts((prev) => prev.map((account) => (account.id === updatedAccount.id ? updatedAccount : account)))
        toast({
          title: "Sucesso (Mock)",
          description: "Conta atualizada localmente. Configure Supabase para persistir dados.",
        })
        return
      }

      const { error } = await supabase
        .from("accounts")
        .update({
          description: updatedAccount.description,
          amount: updatedAccount.amount,
          category: updatedAccount.category,
          due_date: updatedAccount.dueDate,
          data_conta: updatedAccount.dataConta,
          type: updatedAccount.type,
          status: updatedAccount.status,
          bank_id: updatedAccount.bank_id,
          payment_source: "bank",
          payment_source_id: updatedAccount.payment_source_id,
          payment_source_name: updatedAccount.payment_source_name,
          previous_balance: updatedAccount.previous_balance,
        })
        .eq("id", updatedAccount.id)
        .eq("user_id", user.id)

      if (error) {
        console.error("Erro ao atualizar conta:", error)
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a conta.",
          variant: "destructive",
        })
        return
      }

      // Atualizar na list
