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
            admin_logs: {
                Row: {
                    action: string
                    admin_id: string
                    created_at: string | null
                    details: Json | null
                    id: string
                    ip_address: unknown
                    target_id: string | null
                    target_type: string | null
                    user_agent: string | null
                }
                Insert: {
                    action: string
                    admin_id: string
                    created_at?: string | null
                    details?: Json | null
                    id?: string
                    ip_address?: unknown
                    target_id?: string | null
                    target_type?: string | null
                    user_agent?: string | null
                }
                Update: {
                    action?: string
                    admin_id?: string
                    created_at?: string | null
                    details?: Json | null
                    id?: string
                    ip_address?: unknown
                    target_id?: string | null
                    target_type?: string | null
                    user_agent?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "admin_logs_admin_id_fkey"
                        columns: ["admin_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            comments: {
                Row: {
                    content: string
                    created_at: string | null
                    id: string
                    is_edited: boolean | null
                    parent_id: string | null
                    post_id: string
                    tenant_id: string | null
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    content: string
                    created_at?: string | null
                    id?: string
                    is_edited?: boolean | null
                    parent_id?: string | null
                    post_id: string
                    tenant_id?: string | null
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    content?: string
                    created_at?: string | null
                    id?: string
                    is_edited?: boolean | null
                    parent_id?: string | null
                    post_id?: string
                    tenant_id?: string | null
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "comments_parent_id_fkey"
                        columns: ["parent_id"]
                        isOneToOne: false
                        referencedRelation: "comments"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "comments_parent_id_fkey"
                        columns: ["parent_id"]
                        isOneToOne: false
                        referencedRelation: "comments_with_author"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "comments_post_id_fkey"
                        columns: ["post_id"]
                        isOneToOne: false
                        referencedRelation: "posts"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "comments_post_id_fkey"
                        columns: ["post_id"]
                        isOneToOne: false
                        referencedRelation: "posts_with_author"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "comments_tenant_id_fkey"
                        columns: ["tenant_id"]
                        isOneToOne: false
                        referencedRelation: "tenants"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "comments_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            contact_views: {
                Row: {
                    id: string
                    post_id: string
                    user_id: string
                    viewed_at: string | null
                }
                Insert: {
                    id?: string
                    post_id: string
                    user_id: string
                    viewed_at?: string | null
                }
                Update: {
                    id?: string
                    post_id?: string
                    user_id?: string
                    viewed_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "contact_views_post_id_fkey"
                        columns: ["post_id"]
                        isOneToOne: false
                        referencedRelation: "posts"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "contact_views_post_id_fkey"
                        columns: ["post_id"]
                        isOneToOne: false
                        referencedRelation: "posts_with_author"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "contact_views_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            follows: {
                Row: {
                    created_at: string | null
                    follower_id: string
                    following_id: string
                    id: string
                }
                Insert: {
                    created_at?: string | null
                    follower_id: string
                    following_id: string
                    id?: string
                }
                Update: {
                    created_at?: string | null
                    follower_id?: string
                    following_id?: string
                    id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "follows_follower_id_fkey"
                        columns: ["follower_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "follows_following_id_fkey"
                        columns: ["following_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            likes: {
                Row: {
                    created_at: string | null
                    id: string
                    post_id: string
                    tenant_id: string | null
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    post_id: string
                    tenant_id?: string | null
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    post_id?: string
                    tenant_id?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "likes_post_id_fkey"
                        columns: ["post_id"]
                        isOneToOne: false
                        referencedRelation: "posts"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "likes_post_id_fkey"
                        columns: ["post_id"]
                        isOneToOne: false
                        referencedRelation: "posts_with_author"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "likes_tenant_id_fkey"
                        columns: ["tenant_id"]
                        isOneToOne: false
                        referencedRelation: "tenants"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "likes_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            notifications: {
                Row: {
                    created_at: string | null
                    data: Json | null
                    id: string
                    is_read: boolean | null
                    message: string | null
                    read_at: string | null
                    tenant_id: string | null
                    title: string
                    type: string
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    data?: Json | null
                    id?: string
                    is_read?: boolean | null
                    message?: string | null
                    read_at?: string | null
                    tenant_id?: string | null
                    title: string
                    type: string
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    data?: Json | null
                    id?: string
                    is_read?: boolean | null
                    message?: string | null
                    read_at?: string | null
                    tenant_id?: string | null
                    title?: string
                    type?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "notifications_tenant_id_fkey"
                        columns: ["tenant_id"]
                        isOneToOne: false
                        referencedRelation: "tenants"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "notifications_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            post_images: {
                Row: {
                    created_at: string | null
                    display_order: number | null
                    image_id: string
                    is_cover: boolean | null
                    post_id: string
                    url: string | null
                }
                Insert: {
                    created_at?: string | null
                    display_order?: number | null
                    image_id?: string
                    is_cover?: boolean | null
                    post_id: string
                    url?: string | null
                }
                Update: {
                    created_at?: string | null
                    display_order?: number | null
                    image_id?: string
                    is_cover?: boolean | null
                    post_id?: string
                    url?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "post_images_post_id_fkey"
                        columns: ["post_id"]
                        isOneToOne: false
                        referencedRelation: "posts"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "post_images_post_id_fkey"
                        columns: ["post_id"]
                        isOneToOne: false
                        referencedRelation: "posts_with_author"
                        referencedColumns: ["id"]
                    },
                ]
            }
            posts: {
                Row: {
                    auto_flagged: boolean | null
                    boosted_until: string | null
                    bumped_at: string | null
                    category: string | null
                    comments_count: number | null
                    condition: Database["public"]["Enums"]["post_condition"] | null
                    created_at: string | null
                    currency: string | null
                    description: string
                    flagged_reason: string | null
                    formatted_address: string | null
                    id: string
                    is_boosted: boolean | null
                    is_bumped: boolean | null
                    latitude: number | null
                    likes_count: number | null
                    location_city: string | null
                    location_state: string | null
                    longitude: number | null
                    neighborhood: string | null
                    postal_code: string | null
                    price: number | null
                    reported_count: number | null
                    shares_count: number | null
                    ships_nationwide: boolean | null
                    sold_at: string | null
                    status: Database["public"]["Enums"]["post_status"] | null
                    tenant_id: string | null
                    title: string
                    type: Database["public"]["Enums"]["listing_type"] | null
                    updated_at: string | null
                    user_id: string
                    views_count: number | null
                }
                Insert: {
                    auto_flagged?: boolean | null
                    boosted_until?: string | null
                    bumped_at?: string | null
                    category?: string | null
                    comments_count?: number | null
                    condition?: Database["public"]["Enums"]["post_condition"] | null
                    created_at?: string | null
                    currency?: string | null
                    description: string
                    flagged_reason?: string | null
                    formatted_address?: string | null
                    id?: string
                    is_boosted?: boolean | null
                    is_bumped?: boolean | null
                    latitude?: number | null
                    likes_count?: number | null
                    location_city?: string | null
                    location_state?: string | null
                    longitude?: number | null
                    neighborhood?: string | null
                    postal_code?: string | null
                    price?: number | null
                    reported_count?: number | null
                    shares_count?: number | null
                    ships_nationwide?: boolean | null
                    sold_at?: string | null
                    status?: Database["public"]["Enums"]["post_status"] | null
                    tenant_id?: string | null
                    title: string
                    type?: Database["public"]["Enums"]["listing_type"] | null
                    updated_at?: string | null
                    user_id: string
                    views_count?: number | null
                }
                Update: {
                    auto_flagged?: boolean | null
                    boosted_until?: string | null
                    bumped_at?: string | null
                    category?: string | null
                    comments_count?: number | null
                    condition?: Database["public"]["Enums"]["post_condition"] | null
                    created_at?: string | null
                    currency?: string | null
                    description?: string
                    flagged_reason?: string | null
                    formatted_address?: string | null
                    id?: string
                    is_boosted?: boolean | null
                    is_bumped?: boolean | null
                    latitude?: number | null
                    likes_count?: number | null
                    location_city?: string | null
                    location_state?: string | null
                    longitude?: number | null
                    neighborhood?: string | null
                    postal_code?: string | null
                    price?: number | null
                    reported_count?: number | null
                    shares_count?: number | null
                    ships_nationwide?: boolean | null
                    sold_at?: string | null
                    status?: Database["public"]["Enums"]["post_status"] | null
                    tenant_id?: string | null
                    title?: string
                    type?: Database["public"]["Enums"]["listing_type"] | null
                    updated_at?: string | null
                    user_id?: string
                    views_count?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "posts_tenant_id_fkey"
                        columns: ["tenant_id"]
                        isOneToOne: false
                        referencedRelation: "tenants"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "posts_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    bio: string | null
                    created_at: string | null
                    followers_count: number | null
                    following_count: number | null
                    full_name: string | null
                    id: string
                    is_verified: boolean | null
                    last_seen_at: string | null
                    latitude: number | null
                    location_city: string | null
                    location_state: string | null
                    longitude: number | null
                    onboarding_completed: boolean | null
                    phone: string | null
                    postal_code: string | null
                    posts_count: number | null
                    profession: string | null
                    reputation_score: number | null
                    reviews_count: number | null
                    role: Database["public"]["Enums"]["user_role"] | null
                    sales_count: number | null
                    status: Database["public"]["Enums"]["user_status"] | null
                    tenant_id: string | null
                    updated_at: string | null
                    username: string
                    website: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    bio?: string | null
                    created_at?: string | null
                    followers_count?: number | null
                    following_count?: number | null
                    full_name?: string | null
                    id: string
                    is_verified?: boolean | null
                    last_seen_at?: string | null
                    latitude?: number | null
                    location_city?: string | null
                    location_state?: string | null
                    longitude?: number | null
                    onboarding_completed?: boolean | null
                    phone?: string | null
                    postal_code?: string | null
                    posts_count?: number | null
                    profession?: string | null
                    reputation_score?: number | null
                    reviews_count?: number | null
                    role?: Database["public"]["Enums"]["user_role"] | null
                    sales_count?: number | null
                    status?: Database["public"]["Enums"]["user_status"] | null
                    tenant_id?: string | null
                    updated_at?: string | null
                    username: string
                    website?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    bio?: string | null
                    created_at?: string | null
                    followers_count?: number | null
                    following_count?: number | null
                    full_name?: string | null
                    id?: string
                    is_verified?: boolean | null
                    last_seen_at?: string | null
                    latitude?: number | null
                    location_city?: string | null
                    location_state?: string | null
                    longitude?: number | null
                    onboarding_completed?: boolean | null
                    phone?: string | null
                    postal_code?: string | null
                    posts_count?: number | null
                    profession?: string | null
                    reputation_score?: number | null
                    reviews_count?: number | null
                    role?: Database["public"]["Enums"]["user_role"] | null
                    sales_count?: number | null
                    status?: Database["public"]["Enums"]["user_status"] | null
                    tenant_id?: string | null
                    updated_at?: string | null
                    username?: string
                    website?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_tenant_id_fkey"
                        columns: ["tenant_id"]
                        isOneToOne: false
                        referencedRelation: "tenants"
                        referencedColumns: ["id"]
                    },
                ]
            }
            tenant_memberships: {
                Row: {
                    id: string
                    joined_at: string | null
                    role: string | null
                    tenant_id: string
                    user_id: string
                }
                Insert: {
                    id?: string
                    joined_at?: string | null
                    role?: string | null
                    tenant_id: string
                    user_id: string
                }
                Update: {
                    id?: string
                    joined_at?: string | null
                    role?: string | null
                    tenant_id?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "tenant_memberships_tenant_id_fkey"
                        columns: ["tenant_id"]
                        isOneToOne: false
                        referencedRelation: "tenants"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "tenant_memberships_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            tenants: {
                Row: {
                    access_code: string | null
                    avatar_url: string | null
                    created_at: string | null
                    description: string | null
                    id: string
                    is_private: boolean | null
                    name: string
                    owner_id: string | null
                    slug: string
                    updated_at: string | null
                }
                Insert: {
                    access_code?: string | null
                    avatar_url?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    is_private?: boolean | null
                    name: string
                    owner_id?: string | null
                    slug: string
                    updated_at?: string | null
                }
                Update: {
                    access_code?: string | null
                    avatar_url?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    is_private?: boolean | null
                    name?: string
                    owner_id?: string | null
                    slug?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "tenants_owner_id_fkey"
                        columns: ["owner_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            active_tenant_id: { Args: never; Returns: string }
            join_tenant: {
                Args: { p_access_code?: string; p_tenant_id: string }
                Returns: Json
            }
            leave_tenant: { Args: { p_tenant_id: string }; Returns: Json }
        }
        Enums: {
            listing_type: "sale" | "trade" | "auction" | "text"
            post_condition: "new" | "like-new" | "good" | "fair" | "poor"
            post_status: "active" | "sold" | "archived" | "banned"
            user_role: "user" | "moderator" | "admin"
            user_status: "active" | "suspended" | "banned"
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
