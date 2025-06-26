export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          description: string
          due_date: string
          id: number
          status: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          description: string
          due_date: string
          id?: number
          status: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          description?: string
          due_date?: string
          id?: number
          status?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      banks: {
        Row: {
          account_number: string
          account_type: string | null
          agency: string
          balance: number | null
          created_at: string | null
          id: number
          name: string
          nickname: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_number: string
          account_type?: string | null
          agency: string
          balance?: number | null
          created_at?: string | null
          id?: number
          name: string
          nickname?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_number?: string
          account_type?: string | null
          agency?: string
          balance?: number | null
          created_at?: string | null
          id?: number
          name?: string
          nickname?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string
          created_at: string | null
          id: number
          name: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          color?: string
          created_at?: string | null
          id?: number
          name: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: number
          name?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      deposits: {
        Row: {
          amount: number
          bank_id: number
          created_at: string | null
          deposit_date: string
          description: string | null
          id: number
          origin_bank: string | null
          receipt_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          bank_id: number
          created_at?: string | null
          deposit_date: string
          description?: string | null
          id?: number
          origin_bank?: string | null
          receipt_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          bank_id?: number
          created_at?: string | null
          deposit_date?: string
          description?: string | null
          id?: number
          origin_bank?: string | null
          receipt_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deposits_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "banks"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_institutions: {
        Row: {
          created_at: string | null
          id: number
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      investment_types: {
        Row: {
          category: string
          created_at: string | null
          id: number
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: number
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: number
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      investments: {
        Row: {
          created_at: string | null
          current_value: number
          id: number
          institution_id: number
          invested_amount: number
          investor_name: string | null
          maturity_date: string | null
          name: string
          purchase_date: string
          type_id: number
          updated_at: string | null
          user_id: string
          yield_percentage: number | null
        }
        Insert: {
          created_at?: string | null
          current_value?: number
          id?: number
          institution_id: number
          invested_amount?: number
          investor_name?: string | null
          maturity_date?: string | null
          name: string
          purchase_date: string
          type_id: number
          updated_at?: string | null
          user_id: string
          yield_percentage?: number | null
        }
        Update: {
          created_at?: string | null
          current_value?: number
          id?: number
          institution_id?: number
          invested_amount?: number
          investor_name?: string | null
          maturity_date?: string | null
          name?: string
          purchase_date?: string
          type_id?: number
          updated_at?: string | null
          user_id?: string
          yield_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "investments_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "investment_institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investments_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "investment_types"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_upgrade_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          notes: string | null
          requested_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_usage_control: {
        Row: {
          created_at: string
          id: string
          is_premium: boolean
          is_trial_active: boolean
          trial_days_limit: number
          trial_end_date: string
          trial_start_date: string
          updated_at: string
          upgrade_request_date: string | null
          upgrade_status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_premium?: boolean
          is_trial_active?: boolean
          trial_days_limit?: number
          trial_end_date?: string
          trial_start_date?: string
          updated_at?: string
          upgrade_request_date?: string | null
          upgrade_status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_premium?: boolean
          is_trial_active?: boolean
          trial_days_limit?: number
          trial_end_date?: string
          trial_start_date?: string
          updated_at?: string
          upgrade_request_date?: string | null
          upgrade_status?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_trial_status: {
        Args: { user_uuid: string }
        Returns: {
          is_trial_active: boolean
          is_premium: boolean
          days_remaining: number
          trial_end_date: string
        }[]
      }
      delete_user_account: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      get_all_users_with_trial_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          created_at: string
          trial_start_date: string
          trial_end_date: string
          is_trial_active: boolean
          is_premium: boolean
          days_remaining: number
        }[]
      }
      get_pending_upgrade_requests: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          user_id: string
          user_email: string
          requested_at: string
          status: string
          notes: string
        }[]
      }
      get_users_for_admin_review: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          created_at: string
          trial_start_date: string
          trial_end_date: string
          is_trial_active: boolean
          is_premium: boolean
          days_remaining: number
          upgrade_request_date: string
          upgrade_status: string
          needs_attention: boolean
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      process_upgrade_request: {
        Args: { request_id: string; new_status: string; admin_notes?: string }
        Returns: boolean
      }
      process_user_upgrade: {
        Args: {
          target_user_id: string
          new_status: string
          make_premium?: boolean
        }
        Returns: boolean
      }
      request_premium_upgrade: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      update_user_status: {
        Args: {
          target_user_id: string
          is_premium: boolean
          is_trial_active: boolean
          extend_trial_days?: number
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
