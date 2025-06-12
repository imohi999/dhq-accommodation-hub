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
      dhq_living_units: {
        Row: {
          block_image_url: string | null
          block_name: string
          bq: boolean
          category: string
          created_at: string
          current_occupant_id: string | null
          current_occupant_name: string | null
          current_occupant_rank: string | null
          current_occupant_service_number: string | null
          flat_house_room_name: string
          housing_type_id: string
          id: string
          location: string
          no_of_rooms: number
          no_of_rooms_in_bq: number
          occupancy_start_date: string | null
          quarter_name: string
          status: string
          type_of_occupancy: string
          unit_name: string | null
          updated_at: string
        }
        Insert: {
          block_image_url?: string | null
          block_name: string
          bq?: boolean
          category: string
          created_at?: string
          current_occupant_id?: string | null
          current_occupant_name?: string | null
          current_occupant_rank?: string | null
          current_occupant_service_number?: string | null
          flat_house_room_name: string
          housing_type_id: string
          id?: string
          location: string
          no_of_rooms?: number
          no_of_rooms_in_bq?: number
          occupancy_start_date?: string | null
          quarter_name: string
          status?: string
          type_of_occupancy?: string
          unit_name?: string | null
          updated_at?: string
        }
        Update: {
          block_image_url?: string | null
          block_name?: string
          bq?: boolean
          category?: string
          created_at?: string
          current_occupant_id?: string | null
          current_occupant_name?: string | null
          current_occupant_rank?: string | null
          current_occupant_service_number?: string | null
          flat_house_room_name?: string
          housing_type_id?: string
          id?: string
          location?: string
          no_of_rooms?: number
          no_of_rooms_in_bq?: number
          occupancy_start_date?: string | null
          quarter_name?: string
          status?: string
          type_of_occupancy?: string
          unit_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dhq_living_units_housing_type_id_fkey"
            columns: ["housing_type_id"]
            isOneToOne: false
            referencedRelation: "housing_types"
            referencedColumns: ["id"]
          },
        ]
      }
      housing_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      queue: {
        Row: {
          appointment: string | null
          arm_of_service: string
          category: string
          created_at: string
          current_unit: string | null
          date_sos: string | null
          date_tos: string | null
          entry_date_time: string
          full_name: string
          gender: string
          id: string
          marital_status: string
          no_of_adult_dependents: number
          no_of_child_dependents: number
          phone: string | null
          rank: string
          sequence: number
          svc_no: string
          updated_at: string
        }
        Insert: {
          appointment?: string | null
          arm_of_service: string
          category: string
          created_at?: string
          current_unit?: string | null
          date_sos?: string | null
          date_tos?: string | null
          entry_date_time?: string
          full_name: string
          gender: string
          id?: string
          marital_status: string
          no_of_adult_dependents?: number
          no_of_child_dependents?: number
          phone?: string | null
          rank: string
          sequence: number
          svc_no: string
          updated_at?: string
        }
        Update: {
          appointment?: string | null
          arm_of_service?: string
          category?: string
          created_at?: string
          current_unit?: string | null
          date_sos?: string | null
          date_tos?: string | null
          entry_date_time?: string
          full_name?: string
          gender?: string
          id?: string
          marital_status?: string
          no_of_adult_dependents?: number
          no_of_child_dependents?: number
          phone?: string | null
          rank?: string
          sequence?: number
          svc_no?: string
          updated_at?: string
        }
        Relationships: []
      }
      unit_history: {
        Row: {
          created_at: string
          duration_days: number | null
          end_date: string | null
          id: string
          occupant_name: string
          rank: string
          reason_for_leaving: string | null
          service_number: string
          start_date: string
          unit_id: string | null
        }
        Insert: {
          created_at?: string
          duration_days?: number | null
          end_date?: string | null
          id?: string
          occupant_name: string
          rank: string
          reason_for_leaving?: string | null
          service_number: string
          start_date: string
          unit_id?: string | null
        }
        Update: {
          created_at?: string
          duration_days?: number | null
          end_date?: string | null
          id?: string
          occupant_name?: string
          rank?: string
          reason_for_leaving?: string | null
          service_number?: string
          start_date?: string
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unit_history_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "dhq_living_units"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_inventory: {
        Row: {
          created_at: string
          id: string
          item_description: string
          item_location: string
          item_status: string
          note: string | null
          quantity: number
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_description: string
          item_location: string
          item_status?: string
          note?: string | null
          quantity?: number
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          item_description?: string
          item_location?: string
          item_status?: string
          note?: string | null
          quantity?: number
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_inventory_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "dhq_living_units"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_maintenance: {
        Row: {
          cost: number | null
          created_at: string
          description: string
          id: string
          maintenance_date: string
          maintenance_type: string
          notes: string | null
          performed_by: string
          priority: string
          status: string
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          cost?: number | null
          created_at?: string
          description: string
          id?: string
          maintenance_date?: string
          maintenance_type: string
          notes?: string | null
          performed_by: string
          priority?: string
          status?: string
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          cost?: number | null
          created_at?: string
          description?: string
          id?: string
          maintenance_date?: string
          maintenance_type?: string
          notes?: string | null
          performed_by?: string
          priority?: string
          status?: string
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_maintenance_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "dhq_living_units"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_occupants: {
        Row: {
          created_at: string
          email: string | null
          emergency_contact: string | null
          full_name: string
          id: string
          is_current: boolean
          occupancy_start_date: string
          phone: string | null
          rank: string
          service_number: string
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          full_name: string
          id?: string
          is_current?: boolean
          occupancy_start_date?: string
          phone?: string | null
          rank: string
          service_number: string
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          full_name?: string
          id?: string
          is_current?: boolean
          occupancy_start_date?: string
          phone?: string | null
          rank?: string
          service_number?: string
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_occupants_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "dhq_living_units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
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
      get_user_profile: {
        Args: { _user_id: string }
        Returns: {
          id: string
          username: string
          full_name: string
          role: Database["public"]["Enums"]["app_role"]
          roles: Database["public"]["Enums"]["app_role"][]
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "superadmin" | "admin" | "moderator" | "user"
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
      app_role: ["superadmin", "admin", "moderator", "user"],
    },
  },
} as const
