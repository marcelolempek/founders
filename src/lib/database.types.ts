// ============================================
// Empreendedores de Cristo - Database Types
// ============================================
// Generated from Supabase schema
// ============================================

// Enums
export type ListingType = 'sale' | 'text';
export type PostCondition = 'new' | 'like-new' | 'good' | 'fair' | 'poor';
export type PostStatus = 'active' | 'sold' | 'archived' | 'banned';
export type UserRole = 'user' | 'moderator' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'banned';
export type ReportReason = 'spam' | 'scam' | 'inappropriate' | 'illegal' | 'harassment' | 'other';
export type ReportStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed';
export type VerificationType = 'identity' | 'store' | 'partner';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type ReportPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ReportTargetType = 'post' | 'user' | 'comment';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type PaymentMethod = 'pix' | 'credit_card' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';

// Tables
export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  location_city: string | null;
  location_state: string | null;
  // Geocoding data
  latitude: number | null;
  longitude: number | null;
  postal_code: string | null;
  reputation_score: number | null;
  is_verified: boolean | null;
  role: UserRole | null;
  status: UserStatus | null;
  followers_count: number | null;
  following_count: number | null;
  posts_count: number | null;
  sales_count: number | null;
  reviews_count: number | null;
  onboarding_completed: boolean | null;
  whatsapp_verified: boolean | null;
  default_ships_nationwide: boolean | null;
  last_login_at: string | null;
  login_count: number | null;
  failed_login_count: number | null;
  locked_until: string | null;
  last_seen_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Post {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  location_city: string | null;
  location_state: string | null;
  // Geocoding data
  latitude: number | null;
  longitude: number | null;
  postal_code: string | null;
  formatted_address: string | null;
  neighborhood: string | null;
  category: string;
  condition: PostCondition;
  views_count: number | null;
  likes_count: number | null;
  comments_count: number | null;
  status: PostStatus | null;
  type: ListingType | null;
  is_boosted: boolean | null;
  boosted_until: string | null;
  ships_nationwide: boolean | null;
  bumped_at: string | null;
  sold_at: string | null;
  reported_count: number | null;
  auto_flagged: boolean | null;
  flagged_reason: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Relations
  user?: Profile;
  images?: PostImage[];
}

export interface PostImage {
  id: string;
  post_id: string;
  url: string;
  image_id: string | null; // R2 UUID (null for legacy Supabase)
  is_cover: boolean;
  display_order: number;
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  // Relations
  follower?: Profile;
  following?: Profile;
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  user?: Profile;
  replies?: Comment[];
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  post_id: string | null;
  rating: number;
  comment: string | null;
  is_buyer: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  reviewer?: Profile;
  reviewed_user?: Profile;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  priority: ReportPriority;
  assigned_to: string | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VerificationRequest {
  id: string;
  user_id: string;
  type: VerificationType;
  document_urls: string[];
  status: VerificationStatus;
  notes: string | null;
  reviewed_by: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  verification_request_id: string | null;
  plan_type: VerificationType;
  amount: number;
  currency: string;
  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus;
  payment_reference: string | null;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string | null;
  email: string;
  topic: string;
  message: string;
  status: TicketStatus;
  assigned_to: string | null;
  response: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  data: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface ContactView {
  id: string;
  user_id: string;
  post_id: string;
  viewed_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

// Function return types
export interface FeedPost {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  location_city: string | null;
  location_state: string | null;
  // Geocoding data
  latitude: number | null;
  longitude: number | null;
  postal_code: string | null;
  neighborhood: string | null;
  category: string;
  condition: PostCondition;
  views_count: number | null;
  likes_count: number | null;
  comments_count: number | null;
  status: PostStatus | null;
  type: ListingType | null;
  is_boosted: boolean | null;
  boosted_until: string | null;
  ships_nationwide: boolean | null;
  created_at: string | null;
  author_username: string | null;
  author_avatar: string | null;
  author_is_verified: boolean | null;
  author_reputation_score: number | null;
  author_sales_count: number | null;
  cover_image_url: string | null;
  is_liked: boolean | null;
  is_saved: boolean | null;
  distance_km: number | null;
  relevance_score: number | null;
  author_is_followed: boolean | null;
}

// Post with full relations for detail view
export interface PostWithDetails extends Post {
  user: Profile;
  images: PostImage[];
  comments: (Comment & { user: Profile })[];
}

// Profile with stats for profile view
export interface ProfileComplete extends Profile {
  active_posts_count: number;
  calculated_reputation: number;
  positive_reviews_count: number;
  negative_reviews_count: number;
}

export interface PlatformSettings {
  id: number;
  platform_name: string;
  support_email: string;
  maintenance_mode: boolean;
  updated_at: string;
  updated_by?: string;
}

// Database helper type for Supabase
export interface Database {
  public: {
    Tables: {
      platform_settings: {
        Row: PlatformSettings;
        Insert: Partial<PlatformSettings>;
        Update: Partial<PlatformSettings>;
      };
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; username: string };
        Update: Partial<Profile>;
      };
      posts: {
        Row: Post;
        Insert: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'views_count' | 'likes_count' | 'comments_count' | 'reported_count' | 'auto_flagged'>;
        Update: Partial<Post>;
      };
      post_images: {
        Row: PostImage;
        Insert: Omit<PostImage, 'id' | 'created_at'>;
        Update: Partial<PostImage>;
      };
      follows: {
        Row: Follow;
        Insert: Omit<Follow, 'id' | 'created_at'>;
        Update: Partial<Follow>;
      };
      likes: {
        Row: Like;
        Insert: Omit<Like, 'id' | 'created_at'>;
        Update: Partial<Like>;
      };
      comments: {
        Row: Comment;
        Insert: Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'is_edited'>;
        Update: Partial<Comment>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Review>;
      };
      reports: {
        Row: Report;
        Insert: Omit<Report, 'id' | 'created_at' | 'updated_at' | 'priority'>;
        Update: Partial<Report>;
      };
      verification_requests: {
        Row: VerificationRequest;
        Insert: Omit<VerificationRequest, 'id' | 'submitted_at'>;
        Update: Partial<VerificationRequest>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Subscription>;
      };
      support_tickets: {
        Row: SupportTicket;
        Insert: Omit<SupportTicket, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<SupportTicket>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Notification>;
      };
      contact_views: {
        Row: ContactView;
        Insert: Omit<ContactView, 'id' | 'viewed_at'>;
        Update: Partial<ContactView>;
      };
      badges: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon: string | null;
          type: string;
          default_duration_days: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          type?: string;
          default_duration_days?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          icon?: string | null;
          type?: string;
          default_duration_days?: number | null;
          created_at?: string | null;
        };
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          verified: boolean | null;
          verified_at: string | null;
          expires_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          verified?: boolean | null;
          verified_at?: string | null;
          expires_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_id?: string;
          verified?: boolean | null;
          verified_at?: string | null;
          expires_at?: string | null;
          created_at?: string | null;
        };
      };
    };
    Functions: {
      get_feed_posts: {
        Args: {
          p_user_id?: string;
          p_category?: string;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: FeedPost[];
      };
      check_rate_limit: {
        Args: {
          p_user_id: string;
          p_action: string;
          p_max_count: number;
          p_window_minutes?: number;
        };
        Returns: boolean;
      };
      increment_post_views: {
        Args: { p_post_id: string };
        Returns: void;
      };
      bump_post: {
        Args: { p_post_id: string; p_user_id: string };
        Returns: boolean;
      };
      is_following: {
        Args: { p_follower_id: string; p_following_id: string };
        Returns: boolean;
      };
      has_liked_post: {
        Args: { p_user_id: string; p_post_id: string };
        Returns: boolean;
      };
      get_post_contact: {
        Args: { p_post_id: string; p_user_id: string };
        Returns: { phone: string; username: string }[];
      };
    };
  };
}
