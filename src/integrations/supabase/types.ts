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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          account_id: string | null
          atend_pesquisa: string | null
          average_agent_response_time_seconds: number | null
          bu: string | null
          categoria_tag: string | null
          closed_date: string | null
          course_name: string | null
          customeridentity: string | null
          data_avaliacao: string | null
          dentro_hora: number | null
          dentro_ns: number | null
          depara_ies: string | null
          first_response_date: string | null
          hora_entrada: string | null
          id: number
          ies: string | null
          intervalo: string | null
          maturidade: string | null
          modalidade: string | null
          nota_ajustada: string | null
          opened_date: string | null
          operator_user: string | null
          possui_incidente: string | null
          ra: string | null
          rechamada: string | null
          resolutividade: number | null
          resolutividade_respondido: number | null
          resposta_resolutividade: string | null
          sequential_id: string | null
          status: string | null
          status_date: string | null
          storage_date: string | null
          tag_principal: string | null
          tags: string | null
          team: string | null
          telefone_aluno: string | null
          tempo_atendimento: string | null
          tempo_fila: number | null
          tipo_csat: string | null
          tipo_resolutividade: string | null
          to_operator: string | null
          transferencia: string | null
        }
        Insert: {
          account_id?: string | null
          atend_pesquisa?: string | null
          average_agent_response_time_seconds?: number | null
          bu?: string | null
          categoria_tag?: string | null
          closed_date?: string | null
          course_name?: string | null
          customeridentity?: string | null
          data_avaliacao?: string | null
          dentro_hora?: number | null
          dentro_ns?: number | null
          depara_ies?: string | null
          first_response_date?: string | null
          hora_entrada?: string | null
          id?: never
          ies?: string | null
          intervalo?: string | null
          maturidade?: string | null
          modalidade?: string | null
          nota_ajustada?: string | null
          opened_date?: string | null
          operator_user?: string | null
          possui_incidente?: string | null
          ra?: string | null
          rechamada?: string | null
          resolutividade?: number | null
          resolutividade_respondido?: number | null
          resposta_resolutividade?: string | null
          sequential_id?: string | null
          status?: string | null
          status_date?: string | null
          storage_date?: string | null
          tag_principal?: string | null
          tags?: string | null
          team?: string | null
          telefone_aluno?: string | null
          tempo_atendimento?: string | null
          tempo_fila?: number | null
          tipo_csat?: string | null
          tipo_resolutividade?: string | null
          to_operator?: string | null
          transferencia?: string | null
        }
        Update: {
          account_id?: string | null
          atend_pesquisa?: string | null
          average_agent_response_time_seconds?: number | null
          bu?: string | null
          categoria_tag?: string | null
          closed_date?: string | null
          course_name?: string | null
          customeridentity?: string | null
          data_avaliacao?: string | null
          dentro_hora?: number | null
          dentro_ns?: number | null
          depara_ies?: string | null
          first_response_date?: string | null
          hora_entrada?: string | null
          id?: never
          ies?: string | null
          intervalo?: string | null
          maturidade?: string | null
          modalidade?: string | null
          nota_ajustada?: string | null
          opened_date?: string | null
          operator_user?: string | null
          possui_incidente?: string | null
          ra?: string | null
          rechamada?: string | null
          resolutividade?: number | null
          resolutividade_respondido?: number | null
          resposta_resolutividade?: string | null
          sequential_id?: string | null
          status?: string | null
          status_date?: string | null
          storage_date?: string | null
          tag_principal?: string | null
          tags?: string | null
          team?: string | null
          telefone_aluno?: string | null
          tempo_atendimento?: string | null
          tempo_fila?: number | null
          tipo_csat?: string | null
          tipo_resolutividade?: string | null
          to_operator?: string | null
          transferencia?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "viewer"
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
    Enums: {
      app_role: ["admin", "viewer"],
    },
  },
} as const
