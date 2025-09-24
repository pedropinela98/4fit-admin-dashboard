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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      Achievement: {
        Row: {
          achieved_at: string | null
          badge_url: string | null
          created_at: string
          deleted_at: string | null
          id: string
          is_active: boolean
          movement_id: string | null
          target_unit: Database["public"]["Enums"]["movement_unit"]
          target_value: number
          title: string
          updated_at: string
        }
        Insert: {
          achieved_at?: string | null
          badge_url?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          movement_id?: string | null
          target_unit: Database["public"]["Enums"]["movement_unit"]
          target_value: number
          title: string
          updated_at?: string
        }
        Update: {
          achieved_at?: string | null
          badge_url?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          movement_id?: string | null
          target_unit?: Database["public"]["Enums"]["movement_unit"]
          target_value?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Achievement_movement_id_fkey"
            columns: ["movement_id"]
            isOneToOne: false
            referencedRelation: "Movement"
            referencedColumns: ["id"]
          },
        ]
      }
      Achievement_Unlocked: {
        Row: {
          achieved_at: string
          achievement_id: string
          created_at: string
          id: string
          user_id: string
          workout_result_id: string
        }
        Insert: {
          achieved_at: string
          achievement_id: string
          created_at?: string
          id?: string
          user_id: string
          workout_result_id: string
        }
        Update: {
          achieved_at?: string
          achievement_id?: string
          created_at?: string
          id?: string
          user_id?: string
          workout_result_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Achievement_Unlocked_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "Achievement"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Achievement_Unlocked_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User_detail"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Achievement_Unlocked_workout_result_id_fkey"
            columns: ["workout_result_id"]
            isOneToOne: false
            referencedRelation: "Workout_Result"
            referencedColumns: ["id"]
          },
        ]
      }
      Announcement: {
        Row: {
          admin_id: string
          box_id: string
          created_at: string
          deleted_at: string | null
          id: string
          message: string
          send_date: string
          title: string
          updated_at: string
        }
        Insert: {
          admin_id: string
          box_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          message: string
          send_date: string
          title: string
          updated_at?: string
        }
        Update: {
          admin_id?: string
          box_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          message?: string
          send_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Announcement_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "User_detail"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Announcement_box_id_fkey"
            columns: ["box_id"]
            isOneToOne: false
            referencedRelation: "Box"
            referencedColumns: ["id"]
          },
        ]
      }
      Applied_Discount: {
        Row: {
          amount_applied: number
          applied_at: string
          discount_id: string
          id: string
          membership_id: string | null
          session_pack_id: string | null
          user_id: string
        }
        Insert: {
          amount_applied: number
          applied_at?: string
          discount_id: string
          id?: string
          membership_id?: string | null
          session_pack_id?: string | null
          user_id: string
        }
        Update: {
          amount_applied?: number
          applied_at?: string
          discount_id?: string
          id?: string
          membership_id?: string | null
          session_pack_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Applied_Discount_discount_id_fkey"
            columns: ["discount_id"]
            isOneToOne: false
            referencedRelation: "Discount"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Applied_Discount_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "Membership"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Applied_Discount_session_pack_id_fkey"
            columns: ["session_pack_id"]
            isOneToOne: false
            referencedRelation: "User_Session_Pack"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Applied_Discount_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User_detail"
            referencedColumns: ["id"]
          },
        ]
      }
      Box: {
        Row: {
          active: boolean
          created_at: string
          currency: string
          id: string
          latitude: number | null
          location: string
          longitude: number | null
          name: string
          timezone: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          currency?: string
          id?: string
          latitude?: number | null
          location: string
          longitude?: number | null
          name: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          currency?: string
          id?: string
          latitude?: number | null
          location?: string
          longitude?: number | null
          name?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      Box_Member: {
        Row: {
          box_id: string
          created_at: string
          deleted_at: string | null
          id: string
          joined_at: string
          notes: string | null
          seguro_validade: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          box_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          joined_at: string
          notes?: string | null
          seguro_validade?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          box_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          joined_at?: string
          notes?: string | null
          seguro_validade?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Box_Member_box_id_fkey"
            columns: ["box_id"]
            isOneToOne: false
            referencedRelation: "Box"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Box_Member_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User_detail"
            referencedColumns: ["id"]
          },
        ]
      }
      Box_Membership_Request: {
        Row: {
          box_id: string
          created_at: string
          id: string
          processed_at: string | null
          processed_by: string | null
          status: Database["public"]["Enums"]["membership_request_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          box_id: string
          created_at?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: Database["public"]["Enums"]["membership_request_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          box_id?: string
          created_at?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: Database["public"]["Enums"]["membership_request_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Box_Membership_Request_box_id_fkey"
            columns: ["box_id"]
            isOneToOne: false
            referencedRelation: "Box"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Box_Membership_Request_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "Box_Staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Box_Membership_Request_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User_detail"
            referencedColumns: ["id"]
          },
        ]
      }
      Box_Staff: {
        Row: {
          box_id: string
          created_at: string
          end_date: string | null
          id: string
          role: Database["public"]["Enums"]["staff_role"]
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          box_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          role: Database["public"]["Enums"]["staff_role"]
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          box_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          role?: Database["public"]["Enums"]["staff_role"]
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Box_Staff_box_id_fkey"
            columns: ["box_id"]
            isOneToOne: false
            referencedRelation: "Box"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Box_Staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User_detail"
            referencedColumns: ["id"]
          },
        ]
      }
      Class: {
        Row: {
          box_id: string
          coach_id: string | null
          created_at: string
          datetime: string
          deleted_at: string | null
          duration: number
          id: string
          max_capacity: number
          type: string
          updated_at: string
          waitlist_max: number | null
        }
        Insert: {
          box_id: string
          coach_id?: string | null
          created_at?: string
          datetime: string
          deleted_at?: string | null
          duration: number
          id?: string
          max_capacity: number
          type: string
          updated_at?: string
          waitlist_max?: number | null
        }
        Update: {
          box_id?: string
          coach_id?: string | null
          created_at?: string
          datetime?: string
          deleted_at?: string | null
          duration?: number
          id?: string
          max_capacity?: number
          type?: string
          updated_at?: string
          waitlist_max?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Class_box_id_fkey"
            columns: ["box_id"]
            isOneToOne: false
            referencedRelation: "Box"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Class_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "User_detail"
            referencedColumns: ["id"]
          },
        ]
      }
      Class_Attendance: {
        Row: {
          class_id: string
          created_at: string
          deleted_at: string | null
          id: string
          is_dropin: boolean
          membership_id: string | null
          session_pack_id: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_dropin?: boolean
          membership_id?: string | null
          session_pack_id?: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_dropin?: boolean
          membership_id?: string | null
          session_pack_id?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Class_Attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "Class"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Class_Attendance_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "Membership"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Class_Attendance_session_pack_id_fkey"
            columns: ["session_pack_id"]
            isOneToOne: false
            referencedRelation: "User_Session_Pack"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Class_Attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User_detail"
            referencedColumns: ["id"]
          },
        ]
      }
      Class_Waitlist: {
        Row: {
          class_id: string
          created_at: string
          id: string
          joined_at: string
          notification_expires_at: string | null
          notified_at: string | null
          position: number
          updated_at: string
          user_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          joined_at?: string
          notification_expires_at?: string | null
          notified_at?: string | null
          position: number
          updated_at?: string
          user_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          joined_at?: string
          notification_expires_at?: string | null
          notified_at?: string | null
          position?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Class_Waitlist_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "Class"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Class_Waitlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User_detail"
            referencedColumns: ["id"]
          },
        ]
      }
      Discount: {
        Row: {
          active: boolean
          amount: number
          applies_to: Database["public"]["Enums"]["discount_applies_to"]
          code: string
          created_at: string
          deleted_at: string | null
          end_date: string
          id: string
          max_uses: number | null
          start_date: string
          type: Database["public"]["Enums"]["discount_type"]
          updated_at: string
          usage_count: number
        }
        Insert: {
          active?: boolean
          amount: number
          applies_to: Database["public"]["Enums"]["discount_applies_to"]
          code: string
          created_at?: string
          deleted_at?: string | null
          end_date: string
          id?: string
          max_uses?: number | null
          start_date: string
          type: Database["public"]["Enums"]["discount_type"]
          updated_at?: string
          usage_count?: number
        }
        Update: {
          active?: boolean
          amount?: number
          applies_to?: Database["public"]["Enums"]["discount_applies_to"]
          code?: string
          created_at?: string
          deleted_at?: string | null
          end_date?: string
          id?: string
          max_uses?: number | null
          start_date?: string
          type?: Database["public"]["Enums"]["discount_type"]
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      Expense: {
        Row: {
          amount: number
          box_id: string
          created_at: string
          description: string
          expense_date: string
          id: string
          type: Database["public"]["Enums"]["expense_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          box_id: string
          created_at?: string
          description: string
          expense_date: string
          id?: string
          type: Database["public"]["Enums"]["expense_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          box_id?: string
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          type?: Database["public"]["Enums"]["expense_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Expense_box_id_fkey"
            columns: ["box_id"]
            isOneToOne: false
            referencedRelation: "Box"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Expense_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User_detail"
            referencedColumns: ["id"]
          },
        ]
      }
      Membership: {
        Row: {
          created_at: string
          deleted_at: string | null
          end_date: string
          id: string
          is_active: boolean
          payment_status: Database["public"]["Enums"]["payment_status"]
          plan_id: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          end_date: string
          id?: string
          is_active?: boolean
          payment_status: Database["public"]["Enums"]["payment_status"]
          plan_id: string
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          end_date?: string
          id?: string
          is_active?: boolean
          payment_status?: Database["public"]["Enums"]["payment_status"]
          plan_id?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Membership_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "Plan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Membership_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User_detail"
            referencedColumns: ["id"]
          },
        ]
      }
      Movement: {
        Row: {
          category: Database["public"]["Enums"]["movement_category"]
          created_at: string
          id: string
          name: string
          updated_at: string
          url: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["movement_category"]
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["movement_category"]
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      Payment: {
        Row: {
          amount: number
          created_at: string
          deleted_at: string | null
          id: string
          membership_id: string | null
          method: Database["public"]["Enums"]["payment_method"]
          paid_at: string | null
          session_pack_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          deleted_at?: string | null
          id?: string
          membership_id?: string | null
          method: Database["public"]["Enums"]["payment_method"]
          paid_at?: string | null
          session_pack_id?: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          deleted_at?: string | null
          id?: string
          membership_id?: string | null
          method?: Database["public"]["Enums"]["payment_method"]
          paid_at?: string | null
          session_pack_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Payment_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "Membership"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Payment_session_pack_id_fkey"
            columns: ["session_pack_id"]
            isOneToOne: false
            referencedRelation: "User_Session_Pack"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Payment_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User_detail"
            referencedColumns: ["id"]
          },
        ]
      }
      Plan: {
        Row: {
          box_id: string
          created_at: string
          description: string | null
          id: string
          max_sessions: number
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          box_id: string
          created_at?: string
          description?: string | null
          id?: string
          max_sessions: number
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          box_id?: string
          created_at?: string
          description?: string | null
          id?: string
          max_sessions?: number
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Plan_box_id_fkey"
            columns: ["box_id"]
            isOneToOne: false
            referencedRelation: "Box"
            referencedColumns: ["id"]
          },
        ]
      }
      PR: {
        Row: {
          achieved_at: string
          created_at: string
          deleted_at: string | null
          id: string
          movement_id: string
          public: boolean
          unit: Database["public"]["Enums"]["movement_unit"]
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          achieved_at: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          movement_id: string
          public?: boolean
          unit: Database["public"]["Enums"]["movement_unit"]
          updated_at?: string
          user_id: string
          value: number
        }
        Update: {
          achieved_at?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          movement_id?: string
          public?: boolean
          unit?: Database["public"]["Enums"]["movement_unit"]
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "PR_movement_id_fkey"
            columns: ["movement_id"]
            isOneToOne: false
            referencedRelation: "Movement"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "PR_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User_detail"
            referencedColumns: ["id"]
          },
        ]
      }
      Room: {
        Row: {
          active: boolean
          box_id: string
          capacity: number
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          capacity?: number
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          capacity?: number
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      Session_Pack: {
        Row: {
          box_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          price: number
          session_count: number
          updated_at: string
          validity_days: number
        }
        Insert: {
          box_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price: number
          session_count: number
          updated_at?: string
          validity_days: number
        }
        Update: {
          box_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
          session_count?: number
          updated_at?: string
          validity_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "Session_Pack_box_id_fkey"
            columns: ["box_id"]
            isOneToOne: false
            referencedRelation: "Box"
            referencedColumns: ["id"]
          },
        ]
      }
      User_detail: {
        Row: {
          created_at: string
          deleted_at: string | null
          email: string
          email_confirmed_at: string | null
          id: string
          last_sign_in_at: string | null
          name: string
          notification_token: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          email: string
          email_confirmed_at?: string | null
          id: string
          last_sign_in_at?: string | null
          name: string
          notification_token?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          email?: string
          email_confirmed_at?: string | null
          id?: string
          last_sign_in_at?: string | null
          name?: string
          notification_token?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      User_Session_Pack: {
        Row: {
          created_at: string
          expiration_date: string
          id: string
          is_active: boolean
          session_pack_id: string
          sessions_used: number
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expiration_date: string
          id?: string
          is_active?: boolean
          session_pack_id: string
          sessions_used?: number
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expiration_date?: string
          id?: string
          is_active?: boolean
          session_pack_id?: string
          sessions_used?: number
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "User_Session_Pack_session_pack_id_fkey"
            columns: ["session_pack_id"]
            isOneToOne: false
            referencedRelation: "Session_Pack"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "User_Session_Pack_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User_detail"
            referencedColumns: ["id"]
          },
        ]
      }
      Workout: {
        Row: {
          class_id: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          type: Database["public"]["Enums"]["workout_type"]
          updated_at: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          name: string
          type: Database["public"]["Enums"]["workout_type"]
          updated_at?: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["workout_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Workout_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "Class"
            referencedColumns: ["id"]
          },
        ]
      }
      Workout_Result: {
        Row: {
          created_at: string
          date: string
          deleted_at: string | null
          id: string
          public: boolean
          result_type: Database["public"]["Enums"]["result_type"]
          updated_at: string
          user_id: string
          value: string
          workout_id: string
        }
        Insert: {
          created_at?: string
          date: string
          deleted_at?: string | null
          id?: string
          public?: boolean
          result_type: Database["public"]["Enums"]["result_type"]
          updated_at?: string
          user_id: string
          value: string
          workout_id: string
        }
        Update: {
          created_at?: string
          date?: string
          deleted_at?: string | null
          id?: string
          public?: boolean
          result_type?: Database["public"]["Enums"]["result_type"]
          updated_at?: string
          user_id?: string
          value?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Workout_Result_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User_detail"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Workout_Result_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "Workout"
            referencedColumns: ["id"]
          },
        ]
      }
      Workout_Result_Like: {
        Row: {
          created_at: string
          icon: string
          id: string
          result_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          icon: string
          id?: string
          result_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          result_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Workout_Result_Like_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "Workout_Result"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Workout_Result_Like_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User_detail"
            referencedColumns: ["id"]
          },
        ]
      }
      Workout_Section: {
        Row: {
          created_at: string
          duration_minutes: number | null
          id: string
          notes: string | null
          title: string
          type: Database["public"]["Enums"]["workout_type"]
          updated_at: string
          workout_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          title: string
          type: Database["public"]["Enums"]["workout_type"]
          updated_at?: string
          workout_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          title?: string
          type?: Database["public"]["Enums"]["workout_type"]
          updated_at?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Workout_Section_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "Workout"
            referencedColumns: ["id"]
          },
        ]
      }
      Workout_Section_Exercise: {
        Row: {
          created_at: string
          id: string
          load: string | null
          movement_id: string
          notes: string | null
          objective: string | null
          order_number: number
          reps: number | null
          section_id: string
          sets: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          load?: string | null
          movement_id: string
          notes?: string | null
          objective?: string | null
          order_number: number
          reps?: number | null
          section_id: string
          sets?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          load?: string | null
          movement_id?: string
          notes?: string | null
          objective?: string | null
          order_number?: number
          reps?: number | null
          section_id?: string
          sets?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Workout_Section_Exercise_movement_id_fkey"
            columns: ["movement_id"]
            isOneToOne: false
            referencedRelation: "Movement"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Workout_Section_Exercise_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "Workout_Section"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      gbt_bit_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_bool_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_bool_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_bpchar_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_bytea_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_cash_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_cash_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_date_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_date_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_enum_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_enum_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_float4_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_float4_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_float8_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_float8_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_inet_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_int2_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_int2_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_int4_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_int4_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_int8_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_int8_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_intv_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_intv_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_intv_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_macad_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_macad_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_macad8_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_macad8_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_numeric_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_oid_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_oid_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_text_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_time_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_time_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_timetz_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_ts_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_ts_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_tstz_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_uuid_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_uuid_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_var_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_var_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey_var_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey_var_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey16_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey16_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey2_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey2_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey32_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey32_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey4_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey4_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey8_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey8_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      get_class_time_range: {
        Args: { class_uuid: string }
        Returns: unknown
      }
    }
    Enums: {
      attendance_status: "present" | "no_show" | "cancelled"
      discount_applies_to: "plan" | "session_pack" | "all"
      discount_type: "percent" | "fixed"
      expense_type:
        | "cleaning"
        | "maintenance"
        | "material"
        | "equipment"
        | "marketing"
        | "others"
      membership_request_status:
        | "pending"
        | "approved"
        | "rejected"
        | "cancelled"
      movement_category: "weightlifting" | "gymnastics" | "cardio" | "accessory"
      movement_unit: "reps" | "kg" | "meters" | "minutes"
      payment_method: "card" | "mbway" | "cash" | "bank_transfer"
      payment_status: "not_paid" | "paid" | "pending" | "failed"
      result_type:
        | "time"
        | "reps"
        | "weight"
        | "distance"
        | "rounds_plus_reps"
        | "calories"
        | "time(max. time)"
      staff_role: "super_admin" | "admin" | "coach" | "receptionist"
      workout_type: "amrap" | "for_time" | "emom" | "tabata" | "not_timed"
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
      attendance_status: ["present", "no_show", "cancelled"],
      discount_applies_to: ["plan", "session_pack", "all"],
      discount_type: ["percent", "fixed"],
      expense_type: [
        "cleaning",
        "maintenance",
        "material",
        "equipment",
        "marketing",
        "others",
      ],
      membership_request_status: [
        "pending",
        "approved",
        "rejected",
        "cancelled",
      ],
      movement_category: ["weightlifting", "gymnastics", "cardio", "accessory"],
      movement_unit: ["reps", "kg", "meters", "minutes"],
      payment_method: ["card", "mbway", "cash", "bank_transfer"],
      payment_status: ["not_paid", "paid", "pending", "failed"],
      result_type: [
        "time",
        "reps",
        "weight",
        "distance",
        "rounds_plus_reps",
        "calories",
        "time(max. time)",
      ],
      staff_role: ["super_admin", "admin", "coach", "receptionist"],
      workout_type: ["amrap", "for_time", "emom", "tabata", "not_timed"],
    },
  },
} as const
