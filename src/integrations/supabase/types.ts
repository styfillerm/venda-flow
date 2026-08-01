export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          cidade: string
          created_at: string
          documento: string
          email: string
          endereco: string
          id: string
          nome: string
          observacoes: string
          telefone: string
          user_id: string
        }
        Insert: {
          cidade?: string
          created_at?: string
          documento?: string
          email?: string
          endereco?: string
          id?: string
          nome: string
          observacoes?: string
          telefone?: string
          user_id: string
        }
        Update: {
          cidade?: string
          created_at?: string
          documento?: string
          email?: string
          endereco?: string
          id?: string
          nome?: string
          observacoes?: string
          telefone?: string
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          categoria: string
          created_at: string
          data: string
          descricao: string
          id: string
          user_id: string
          valor: number
        }
        Insert: {
          categoria?: string
          created_at?: string
          data?: string
          descricao: string
          id?: string
          user_id: string
          valor?: number
        }
        Update: {
          categoria?: string
          created_at?: string
          data?: string
          descricao?: string
          id?: string
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          categoria: string
          codigo: string
          created_at: string
          estoque: number
          estoque_minimo: number
          fornecedor_id: string | null
          id: string
          nome: string
          status: string
          user_id: string
          valor_compra: number
          valor_venda: number
        }
        Insert: {
          categoria?: string
          codigo?: string
          created_at?: string
          estoque?: number
          estoque_minimo?: number
          fornecedor_id?: string | null
          id?: string
          nome: string
          status?: string
          user_id: string
          valor_compra?: number
          valor_venda?: number
        }
        Update: {
          categoria?: string
          codigo?: string
          created_at?: string
          estoque?: number
          estoque_minimo?: number
          fornecedor_id?: string | null
          id?: string
          nome?: string
          status?: string
          user_id?: string
          valor_compra?: number
          valor_venda?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_fornecedor_owner_fkey"
            columns: ["fornecedor_id", "user_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          nome?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          cliente_id: string | null
          created_at: string
          data: string
          desconto: number
          forma_pagamento: string
          id: string
          produto_id: string | null
          quantidade: number
          user_id: string
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          data?: string
          desconto?: number
          forma_pagamento?: string
          id?: string
          produto_id?: string | null
          quantidade?: number
          user_id: string
          valor_total?: number
          valor_unitario?: number
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          data?: string
          desconto?: number
          forma_pagamento?: string
          id?: string
          produto_id?: string | null
          quantidade?: number
          user_id?: string
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_cliente_owner_fkey"
            columns: ["cliente_id", "user_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "sales_produto_owner_fkey"
            columns: ["produto_id", "user_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      suppliers: {
        Row: {
          cnpj: string
          created_at: string
          email: string
          empresa: string
          endereco: string
          id: string
          responsavel: string
          telefone: string
          user_id: string
        }
        Insert: {
          cnpj?: string
          created_at?: string
          email?: string
          empresa: string
          endereco?: string
          id?: string
          responsavel?: string
          telefone?: string
          user_id: string
        }
        Update: {
          cnpj?: string
          created_at?: string
          email?: string
          empresa?: string
          endereco?: string
          id?: string
          responsavel?: string
          telefone?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
