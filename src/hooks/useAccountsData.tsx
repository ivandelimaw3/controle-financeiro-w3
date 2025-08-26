import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"

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
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const invalidateBanksCache = () => {
    try {
      queryClient.invalidateQueries({ queryKey: ["banks"] })
    } catch (error) {
      console.log("QueryClient not available for cache invalidation")
    }
  }

  const getCurrentMonthPreviousBalance = async (): Promise<number> => {
    try {
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

  // Carregar contas do Supabase
  const fetchAccounts = async () => {
    try {
      setLoading(true)

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

  // Criar nova conta
  const addAccount = async (accountData: CreateAccountData) => {
    try {
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive",
        })
        return
      }

      // Se tem quantidade de parcelas, criar múltiplas contas
      if (accountData.qtd_parcelas && accountData.qtd_parcelas > 1) {
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
            previous_balance: accountData.previous_balance || null,
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
              previous_balance: accountData.previous_balance || null,
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

  // Atualizar conta
  const updateAccount = async (updatedAccount: Account) => {
    try {
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

      // Atualizar na lista local
      setAccounts((prev) => prev.map((account) => (account.id === updatedAccount.id ? updatedAccount : account)))

      // SÓ invalidar cache se a conta for paga/recebida
      if (updatedAccount.status === "pago" || updatedAccount.status === "recebido") {
        invalidateBanksCache()
      }

      toast({
        title: "Sucesso",
        description: "Conta atualizada com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao atualizar conta:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a conta.",
        variant: "destructive",
      })
    }
  }

  // Deletar conta
  const deleteAccount = async (accountId: number) => {
    try {
      // Buscar a conta antes de deletar para verificar se precisa reverter saldo
      const accountToDelete = accounts.find((acc) => acc.id === accountId)

      const { error } = await supabase.from("accounts").delete().eq("id", accountId)

      if (error) {
        console.error("Erro ao deletar conta:", error)
        toast({
          title: "Erro",
          description: "Não foi possível deletar a conta.",
          variant: "destructive",
        })
        return
      }

      // Remover da lista local
      setAccounts((prev) => prev.filter((account) => account.id !== accountId))

      // Se a conta deletada era paga/recebida, invalidar cache para reverter saldo
      if (accountToDelete && (accountToDelete.status === "pago" || accountToDelete.status === "recebido")) {
        invalidateBanksCache()
      }

      toast({
        title: "Sucesso",
        description: "Conta deletada com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao deletar conta:", error)
      toast({
        title: "Erro",
        description: "Não foi possível deletar a conta.",
        variant: "destructive",
      })
    }
  }

  // Atualizar status da conta
  const updateAccountStatus = async (id: number, status: "pendente" | "pago" | "recebido") => {
    try {
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive",
        })
        return
      }
      const { error } = await supabase.from("accounts").update({ status }).eq("id", id).eq("user_id", user.id)

      if (error) {
        console.error("Erro ao atualizar status:", error)
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o status.",
          variant: "destructive",
        })
        return
      }

      // Atualizar na lista local
      setAccounts((prev) => prev.map((acc) => (acc.id === id ? { ...acc, status } : acc)))

      // SEMPRE invalidar cache quando status muda (pode afetar saldo)
      invalidateBanksCache()

      toast({
        title: "Sucesso",
        description: "Status da conta atualizado com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar status.",
        variant: "destructive",
      })
    }
  }

  const updatePreviousBalance = async (amount: number) => {
    try {
      console.log("[v0] updatePreviousBalance called with amount:", amount)

      if (!user) {
        console.log("[v0] No user authenticated")
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive",
        })
        return
      }

      console.log("[v0] User authenticated:", user.id)

      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()

      console.log("[v0] Current month/year:", currentMonth, currentYear)

      // Verificar se já existe uma conta para este mês com previous_balance
      console.log("[v0] Checking for existing account with previous_balance...")
      const { data: existingAccount, error: fetchError } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", user.id)
        .gte("due_date", `${currentYear}-${currentMonth.toString().padStart(2, "0")}-01`)
        .lt("due_date", `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-01`)
        .not("previous_balance", "is", null)
        .single()

      console.log("[v0] Existing account query result:", { existingAccount, fetchError })

      if (existingAccount) {
        console.log("[v0] Updating existing account:", existingAccount.id)
        // Atualizar conta existente
        const { error: updateError } = await supabase
          .from("accounts")
          .update({ previous_balance: amount })
          .eq("id", existingAccount.id)
          .eq("user_id", user.id)

        console.log("[v0] Update result:", { updateError })

        if (updateError) {
          console.error("[v0] Erro ao atualizar saldo anterior:", updateError)
          toast({
            title: "Erro",
            description: "Não foi possível atualizar o saldo anterior.",
            variant: "destructive",
          })
          return
        }

        // Atualizar estado local
        setAccounts((prev) =>
          prev.map((account) =>
            account.id === existingAccount.id ? { ...account, previous_balance: amount } : account,
          ),
        )
        console.log("[v0] Local state updated for existing account")
      } else {
        console.log("[v0] Creating new account with previous_balance")
        // Criar nova conta com previous_balance
        const { data: newAccount, error: insertError } = await supabase
          .from("accounts")
          .insert([
            {
              description: `Saldo Inicial - ${currentMonth.toString().padStart(2, "0")}/${currentYear}`,
              amount: 0, // Amount é 0, o saldo fica no previous_balance
              category: "Saldo Inicial",
              due_date: `${currentYear}-${currentMonth.toString().padStart(2, "0")}-01`,
              type: "receita",
              status: "recebido",
              user_id: user.id,
              payment_source: "bank",
              payment_source_id: null,
              payment_source_name: null,
              previous_balance: amount, // Armazenar o saldo no campo previous_balance
            },
          ])
          .select()
          .single()

        console.log("[v0] Insert result:", { newAccount, insertError })

        if (insertError) {
          console.error("[v0] Erro ao criar saldo anterior:", insertError)
          toast({
            title: "Erro",
            description: "Não foi possível criar o saldo anterior.",
            variant: "destructive",
          })
          return
        }

        // Adicionar ao estado local
        const transformedAccount: Account = {
          id: newAccount.id,
          description: newAccount.description,
          amount: Number.parseFloat(newAccount.amount.toString()),
          category: newAccount.category,
          dueDate: newAccount.due_date,
          dataConta: newAccount.data_conta,
          type: newAccount.type as "receita" | "despesa",
          status: newAccount.status as "pendente" | "pago" | "recebido",
          parcela: newAccount.parcela,
          recorrente_id: newAccount.recorrente_id,
          bank_id: newAccount.bank_id,
          payment_source: "bank",
          payment_source_id: newAccount.payment_source_id,
          payment_source_name: newAccount.payment_source_name,
          previous_balance: newAccount.previous_balance,
        }

        setAccounts((prev) => [transformedAccount, ...prev])
        console.log("[v0] New account added to local state")
      }

      console.log("[v0] updatePreviousBalance completed successfully")
      toast({
        title: "Sucesso",
        description: "Saldo anterior atualizado com sucesso.",
      })
    } catch (error) {
      console.error("[v0] Erro ao atualizar saldo anterior:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o saldo anterior.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (user) {
      fetchAccounts()
    } else {
      setAccounts([])
      setLoading(false)
    }
  }, [user])

  return {
    accounts,
    loading,
    addAccount,
    updateAccount,
    deleteAccount,
    updateAccountStatus,
    updatePreviousBalance,
    getCurrentMonthPreviousBalance,
    refreshAccounts: fetchAccounts,
  }
}
