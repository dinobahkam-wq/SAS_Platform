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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      authors: {
        Row: {
          auth_user_id: string | null
          avatar_asset_id: string | null
          bio: string | null
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          slug: string
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          avatar_asset_id?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          slug: string
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          avatar_asset_id?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "authors_avatar_asset_id_fkey"
            columns: ["avatar_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      briefing_development_relations: {
        Row: {
          created_at: string
          created_by: string
          id: string
          note_ar: string | null
          relation_type: string
          source_development_id: string
          target_development_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          id?: string
          note_ar?: string | null
          relation_type: string
          source_development_id: string
          target_development_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          note_ar?: string | null
          relation_type?: string
          source_development_id?: string
          target_development_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "briefing_development_relations_source_development_id_fkey"
            columns: ["source_development_id"]
            isOneToOne: false
            referencedRelation: "briefing_developments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "briefing_development_relations_target_development_id_fkey"
            columns: ["target_development_id"]
            isOneToOne: false
            referencedRelation: "briefing_developments"
            referencedColumns: ["id"]
          },
        ]
      }
      briefing_development_sources: {
        Row: {
          accessed_at: string
          attribution_note: string | null
          created_at: string
          created_by: string
          development_id: string
          display_order: number
          display_publicly: boolean
          source_excerpt: string | null
          source_id: string
          source_role: string
        }
        Insert: {
          accessed_at?: string
          attribution_note?: string | null
          created_at?: string
          created_by?: string
          development_id: string
          display_order?: number
          display_publicly?: boolean
          source_excerpt?: string | null
          source_id: string
          source_role?: string
        }
        Update: {
          accessed_at?: string
          attribution_note?: string | null
          created_at?: string
          created_by?: string
          development_id?: string
          display_order?: number
          display_publicly?: boolean
          source_excerpt?: string | null
          source_id?: string
          source_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "briefing_development_sources_development_id_fkey"
            columns: ["development_id"]
            isOneToOne: false
            referencedRelation: "briefing_developments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "briefing_development_sources_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "content_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      briefing_developments: {
        Row: {
          category: string
          created_at: string
          created_by: string
          geographic_scope: string
          headline_ar: string
          id: string
          information_class: string
          location_text: string | null
          occurred_at: string | null
          occurred_on: string | null
          related_content_item_id: string | null
          status: string
          summary_ar: string
          time_precision: string
          updated_at: string
          updated_by: string | null
          verification_note_ar: string | null
          verification_status: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string
          geographic_scope?: string
          headline_ar: string
          id?: string
          information_class: string
          location_text?: string | null
          occurred_at?: string | null
          occurred_on?: string | null
          related_content_item_id?: string | null
          status?: string
          summary_ar: string
          time_precision?: string
          updated_at?: string
          updated_by?: string | null
          verification_note_ar?: string | null
          verification_status?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          geographic_scope?: string
          headline_ar?: string
          id?: string
          information_class?: string
          location_text?: string | null
          occurred_at?: string | null
          occurred_on?: string | null
          related_content_item_id?: string | null
          status?: string
          summary_ar?: string
          time_precision?: string
          updated_at?: string
          updated_by?: string | null
          verification_note_ar?: string | null
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "briefing_developments_related_content_item_id_fkey"
            columns: ["related_content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      briefing_edition_events: {
        Row: {
          actor_id: string | null
          created_at: string
          edition_id: string
          event_data: Json
          event_type: string
          from_status: string | null
          id: number
          note_ar: string | null
          revision_id: string | null
          to_status: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          edition_id: string
          event_data?: Json
          event_type: string
          from_status?: string | null
          id?: never
          note_ar?: string | null
          revision_id?: string | null
          to_status?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          edition_id?: string
          event_data?: Json
          event_type?: string
          from_status?: string | null
          id?: never
          note_ar?: string | null
          revision_id?: string | null
          to_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "briefing_edition_events_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "briefing_editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "briefing_edition_events_revision_id_fkey"
            columns: ["revision_id"]
            isOneToOne: false
            referencedRelation: "briefing_revisions"
            referencedColumns: ["id"]
          },
        ]
      }
      briefing_edition_items: {
        Row: {
          context_ar: string | null
          created_at: string
          development_id: string
          display_order: number
          display_section: string
          headline_override_ar: string | null
          id: string
          revision_id: string
          summary_text_ar: string | null
          what_changed_ar: string | null
          why_it_matters_ar: string | null
        }
        Insert: {
          context_ar?: string | null
          created_at?: string
          development_id: string
          display_order: number
          display_section: string
          headline_override_ar?: string | null
          id?: string
          revision_id: string
          summary_text_ar?: string | null
          what_changed_ar?: string | null
          why_it_matters_ar?: string | null
        }
        Update: {
          context_ar?: string | null
          created_at?: string
          development_id?: string
          display_order?: number
          display_section?: string
          headline_override_ar?: string | null
          id?: string
          revision_id?: string
          summary_text_ar?: string | null
          what_changed_ar?: string | null
          why_it_matters_ar?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "briefing_edition_items_development_id_fkey"
            columns: ["development_id"]
            isOneToOne: false
            referencedRelation: "briefing_developments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "briefing_edition_items_revision_id_fkey"
            columns: ["revision_id"]
            isOneToOne: false
            referencedRelation: "briefing_revisions"
            referencedColumns: ["id"]
          },
        ]
      }
      briefing_editions: {
        Row: {
          created_at: string
          created_by: string
          current_revision_id: string | null
          edition_date: string
          edition_no: number
          edition_type: string
          id: string
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          current_revision_id?: string | null
          edition_date: string
          edition_no?: never
          edition_type?: string
          id?: string
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          current_revision_id?: string | null
          edition_date?: string
          edition_no?: never
          edition_type?: string
          id?: string
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "briefing_editions_current_revision_fkey"
            columns: ["id", "current_revision_id"]
            isOneToOne: false
            referencedRelation: "briefing_revisions"
            referencedColumns: ["edition_id", "id"]
          },
        ]
      }
      briefing_revisions: {
        Row: {
          analysis_ar: string
          approved_at: string | null
          approved_by: string | null
          based_on_revision_id: string | null
          change_reason_ar: string | null
          checked_at: string
          coverage_note_ar: string
          created_at: string
          created_by: string
          edition_id: string
          id: string
          methodology_ar: string
          published_at: string | null
          published_by: string | null
          published_snapshot: Json | null
          review_note_ar: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          revision_kind: string
          revision_no: number
          status: string
          submitted_at: string | null
          submitted_by: string | null
          title_ar: string
          updated_at: string
          window_end: string
          window_start: string
        }
        Insert: {
          analysis_ar: string
          approved_at?: string | null
          approved_by?: string | null
          based_on_revision_id?: string | null
          change_reason_ar?: string | null
          checked_at?: string
          coverage_note_ar: string
          created_at?: string
          created_by?: string
          edition_id: string
          id?: string
          methodology_ar: string
          published_at?: string | null
          published_by?: string | null
          published_snapshot?: Json | null
          review_note_ar?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          revision_kind?: string
          revision_no: number
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          title_ar: string
          updated_at?: string
          window_end: string
          window_start: string
        }
        Update: {
          analysis_ar?: string
          approved_at?: string | null
          approved_by?: string | null
          based_on_revision_id?: string | null
          change_reason_ar?: string | null
          checked_at?: string
          coverage_note_ar?: string
          created_at?: string
          created_by?: string
          edition_id?: string
          id?: string
          methodology_ar?: string
          published_at?: string | null
          published_by?: string | null
          published_snapshot?: Json | null
          review_note_ar?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          revision_kind?: string
          revision_no?: number
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          title_ar?: string
          updated_at?: string
          window_end?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "briefing_revisions_edition_id_based_on_revision_id_fkey"
            columns: ["edition_id", "based_on_revision_id"]
            isOneToOne: false
            referencedRelation: "briefing_revisions"
            referencedColumns: ["edition_id", "id"]
          },
          {
            foreignKeyName: "briefing_revisions_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "briefing_editions"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_authors: {
        Row: {
          author_id: string
          author_order: number
          content_id: string
          contribution_label: string | null
          created_at: string
        }
        Insert: {
          author_id: string
          author_order?: number
          content_id: string
          contribution_label?: string | null
          created_at?: string
        }
        Update: {
          author_id?: string
          author_order?: number
          content_id?: string
          contribution_label?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_authors_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_authors_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      content_items: {
        Row: {
          body: Json | null
          category_id: string | null
          cover_asset_id: string | null
          created_at: string
          created_by: string | null
          excerpt: string | null
          format: string
          id: string
          is_featured: boolean
          published_at: string | null
          section: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          body?: Json | null
          category_id?: string | null
          cover_asset_id?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          format: string
          id?: string
          is_featured?: boolean
          published_at?: string | null
          section: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          body?: Json | null
          category_id?: string | null
          cover_asset_id?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          format?: string
          id?: string
          is_featured?: boolean
          published_at?: string | null
          section?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_items_cover_asset_id_fkey"
            columns: ["cover_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      content_source_links: {
        Row: {
          attribution_text: string | null
          content_id: string
          created_at: string
          display_order: number
          id: string
          source_id: string
          source_role: string
        }
        Insert: {
          attribution_text?: string | null
          content_id: string
          created_at?: string
          display_order?: number
          id?: string
          source_id: string
          source_role?: string
        }
        Update: {
          attribution_text?: string | null
          content_id?: string
          created_at?: string
          display_order?: number
          id?: string
          source_id?: string
          source_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_source_links_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_source_links_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "content_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      content_sources: {
        Row: {
          attribution_note: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          language_code: string | null
          organization_name: string | null
          publication_date: string | null
          published_at: string | null
          source_name: string
          source_reference: string | null
          source_title: string | null
          source_type: string
          source_url: string | null
          updated_at: string
        }
        Insert: {
          attribution_note?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          language_code?: string | null
          organization_name?: string | null
          publication_date?: string | null
          published_at?: string | null
          source_name: string
          source_reference?: string | null
          source_title?: string | null
          source_type: string
          source_url?: string | null
          updated_at?: string
        }
        Update: {
          attribution_note?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          language_code?: string | null
          organization_name?: string | null
          publication_date?: string | null
          published_at?: string | null
          source_name?: string
          source_reference?: string | null
          source_title?: string | null
          source_type?: string
          source_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      content_tags: {
        Row: {
          content_id: string
          created_at: string
          tag_id: string
        }
        Insert: {
          content_id: string
          created_at?: string
          tag_id: string
        }
        Update: {
          content_id?: string
          created_at?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_tags_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          alt_text: string | null
          bucket_id: string
          caption: string | null
          created_at: string
          credit: string | null
          file_name: string
          file_size: number
          height: number | null
          id: string
          mime_type: string
          object_path: string
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          bucket_id?: string
          caption?: string | null
          created_at?: string
          credit?: string | null
          file_name: string
          file_size: number
          height?: number | null
          id?: string
          mime_type: string
          object_path: string
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          bucket_id?: string
          caption?: string | null
          created_at?: string
          credit?: string | null
          file_name?: string
          file_size?: number
          height?: number | null
          id?: string
          mime_type?: string
          object_path?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_by: string | null
          created_at: string
          is_active: boolean
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          is_active?: boolean
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          is_active?: boolean
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_briefing_revision: {
        Args: { p_note_ar?: string; p_revision_id: string }
        Returns: undefined
      }
      create_briefing_correction: {
        Args: { p_change_reason_ar: string; p_edition_id: string }
        Returns: string
      }
      create_briefing_edition: {
        Args: {
          p_analysis_ar: string
          p_coverage_note_ar: string
          p_edition_date: string
          p_edition_type: string
          p_methodology_ar: string
          p_slug: string
          p_title_ar: string
          p_window_end: string
          p_window_start: string
        }
        Returns: Json
      }
      get_public_briefing: { Args: { p_slug: string }; Returns: Json }
      get_public_briefing_archive: {
        Args: {
          p_before_date?: string
          p_before_edition_no?: number
          p_limit?: number
        }
        Returns: Json
      }
      publish_briefing_revision: {
        Args: { p_revision_id: string }
        Returns: Json
      }
      return_briefing_revision: {
        Args: { p_note_ar: string; p_revision_id: string }
        Returns: undefined
      }
      submit_briefing_revision: {
        Args: { p_revision_id: string }
        Returns: undefined
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
