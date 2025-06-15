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
      agencies: {
        Row: {
          city: string | null
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          city?: string | null
          created_at?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      commission_rules: {
        Row: {
          commission_type: string
          created_at: string
          fixed_amount: number | null
          id: string
          is_active: boolean
          max_amount: number | null
          min_amount: number | null
          operation_type_id: string
          percentage_rate: number | null
          tiered_rules: Json | null
          updated_at: string
        }
        Insert: {
          commission_type: string
          created_at?: string
          fixed_amount?: number | null
          id?: string
          is_active?: boolean
          max_amount?: number | null
          min_amount?: number | null
          operation_type_id: string
          percentage_rate?: number | null
          tiered_rules?: Json | null
          updated_at?: string
        }
        Update: {
          commission_type?: string
          created_at?: string
          fixed_amount?: number | null
          id?: string
          is_active?: boolean
          max_amount?: number | null
          min_amount?: number | null
          operation_type_id?: string
          percentage_rate?: number | null
          tiered_rules?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_rules_operation_type_id_fkey"
            columns: ["operation_type_id"]
            isOneToOne: false
            referencedRelation: "operation_types"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_type_fields: {
        Row: {
          created_at: string
          display_order: number
          field_type: string
          help_text: string | null
          id: string
          is_obsolete: boolean
          is_required: boolean
          label: string
          name: string
          operation_type_id: string
          options: Json | null
          placeholder: string | null
          updated_at: string
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          field_type: string
          help_text?: string | null
          id?: string
          is_obsolete?: boolean
          is_required?: boolean
          label: string
          name: string
          operation_type_id: string
          options?: Json | null
          placeholder?: string | null
          updated_at?: string
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string
          display_order?: number
          field_type?: string
          help_text?: string | null
          id?: string
          is_obsolete?: boolean
          is_required?: boolean
          label?: string
          name?: string
          operation_type_id?: string
          options?: Json | null
          placeholder?: string | null
          updated_at?: string
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "operation_type_fields_operation_type_id_fkey"
            columns: ["operation_type_id"]
            isOneToOne: false
            referencedRelation: "operation_types"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_types: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          id: string
          impacts_balance: boolean
          is_active: boolean
          name: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          impacts_balance?: boolean
          is_active?: boolean
          name: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          impacts_balance?: boolean
          is_active?: boolean
          name?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          code: string
          id: number
          label: string | null
        }
        Insert: {
          code: string
          id?: number
          label?: string | null
        }
        Update: {
          code?: string
          id?: number
          label?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          permission_id: number
          role_id: number
        }
        Insert: {
          permission_id: number
          role_id: number
        }
        Update: {
          permission_id?: number
          role_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          id: number
          label: string | null
          name: string
        }
        Insert: {
          id?: number
          label?: string | null
          name: string
        }
        Update: {
          id?: number
          label?: string | null
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          agency_id: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          role_id: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agency_id?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role_id?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agency_id?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role_id?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role:
        | "agent"
        | "chef_agence"
        | "admin_general"
        | "sous_admin"
        | "developer"
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
      app_role: [
        "agent",
        "chef_agence",
        "admin_general",
        "sous_admin",
        "developer",
      ],
    },
  },
} as const
