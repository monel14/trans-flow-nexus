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
          chef_agence_id: string | null
          city: string | null
          created_at: string | null
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          chef_agence_id?: string | null
          city?: string | null
          created_at?: string | null
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          chef_agence_id?: string | null
          city?: string | null
          created_at?: string | null
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      agency_operation_types: {
        Row: {
          agency_id: number
          created_at: string
          daily_limit: number | null
          id: string
          is_enabled: boolean
          monthly_limit: number | null
          operation_type_id: string
          updated_at: string
        }
        Insert: {
          agency_id: number
          created_at?: string
          daily_limit?: number | null
          id?: string
          is_enabled?: boolean
          monthly_limit?: number | null
          operation_type_id: string
          updated_at?: string
        }
        Update: {
          agency_id?: number
          created_at?: string
          daily_limit?: number | null
          id?: string
          is_enabled?: boolean
          monthly_limit?: number | null
          operation_type_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_operation_types_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_operation_types_operation_type_id_fkey"
            columns: ["operation_type_id"]
            isOneToOne: false
            referencedRelation: "operation_types"
            referencedColumns: ["id"]
          },
        ]
      }
      app_audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      commission_records: {
        Row: {
          agent_commission: number
          agent_id: string
          chef_agence_id: string | null
          chef_commission: number
          commission_rule_id: string
          created_at: string
          id: string
          operation_id: string
          paid_at: string | null
          status: string
          total_commission: number
          updated_at: string
        }
        Insert: {
          agent_commission?: number
          agent_id: string
          chef_agence_id?: string | null
          chef_commission?: number
          commission_rule_id: string
          created_at?: string
          id?: string
          operation_id: string
          paid_at?: string | null
          status?: string
          total_commission: number
          updated_at?: string
        }
        Update: {
          agent_commission?: number
          agent_id?: string
          chef_agence_id?: string | null
          chef_commission?: number
          commission_rule_id?: string
          created_at?: string
          id?: string
          operation_id?: string
          paid_at?: string | null
          status?: string
          total_commission?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_records_commission_rule_id_fkey"
            columns: ["commission_rule_id"]
            isOneToOne: false
            referencedRelation: "commission_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_records_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "operations"
            referencedColumns: ["id"]
          },
        ]
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
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          expires_at: string | null
          id: string
          is_read: boolean
          message: string
          notification_type: string
          priority: string
          read_at: string | null
          recipient_id: string
          sender_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message: string
          notification_type: string
          priority?: string
          read_at?: string | null
          recipient_id: string
          sender_id?: string | null
          title: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          notification_type?: string
          priority?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string | null
          title?: string
        }
        Relationships: []
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
      operations: {
        Row: {
          agency_id: number
          amount: number
          commission_amount: number | null
          completed_at: string | null
          created_at: string
          currency: string
          error_message: string | null
          fee_amount: number | null
          id: string
          initiator_id: string
          operation_data: Json
          operation_type_id: string
          reference_number: string
          status: string
          updated_at: string
          validated_at: string | null
          validator_id: string | null
        }
        Insert: {
          agency_id: number
          amount: number
          commission_amount?: number | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          error_message?: string | null
          fee_amount?: number | null
          id?: string
          initiator_id: string
          operation_data?: Json
          operation_type_id: string
          reference_number: string
          status?: string
          updated_at?: string
          validated_at?: string | null
          validator_id?: string | null
        }
        Update: {
          agency_id?: number
          amount?: number
          commission_amount?: number | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          error_message?: string | null
          fee_amount?: number | null
          id?: string
          initiator_id?: string
          operation_data?: Json
          operation_type_id?: string
          reference_number?: string
          status?: string
          updated_at?: string
          validated_at?: string | null
          validator_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operations_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operations_operation_type_id_fkey"
            columns: ["operation_type_id"]
            isOneToOne: false
            referencedRelation: "operation_types"
            referencedColumns: ["id"]
          },
        ]
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
          agency_id: number | null
          balance: number | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          name: string
          phone: string | null
          role_id: number | null
          updated_at: string | null
        }
        Insert: {
          agency_id?: number | null
          balance?: number | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          is_active?: boolean | null
          last_name?: string | null
          name: string
          phone?: string | null
          role_id?: number | null
          updated_at?: string | null
        }
        Update: {
          agency_id?: number | null
          balance?: number | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          name?: string
          phone?: string | null
          role_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      request_ticket_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          ticket_id: string
          uploaded_by_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          ticket_id: string
          uploaded_by_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          ticket_id?: string
          uploaded_by_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "request_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      request_ticket_comments: {
        Row: {
          author_id: string
          comment_text: string
          created_at: string
          id: string
          is_internal: boolean
          ticket_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          comment_text: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          comment_text?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "request_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      request_tickets: {
        Row: {
          assigned_to_id: string | null
          created_at: string
          description: string
          id: string
          priority: string
          requested_amount: number | null
          requester_id: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by_id: string | null
          status: string
          ticket_number: string
          ticket_type: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to_id?: string | null
          created_at?: string
          description: string
          id?: string
          priority?: string
          requested_amount?: number | null
          requester_id: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by_id?: string | null
          status?: string
          ticket_number: string
          ticket_type: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to_id?: string | null
          created_at?: string
          description?: string
          id?: string
          priority?: string
          requested_amount?: number | null
          requester_id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by_id?: string | null
          status?: string
          ticket_number?: string
          ticket_type?: string
          title?: string
          updated_at?: string
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
      transaction_ledger: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string
          description: string
          id: string
          metadata: Json | null
          operation_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          operation_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          operation_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_ledger_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "operations"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "user_roles_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
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
      is_admin_general: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_developer: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
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
