export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type LearningMode = "standard" | "adhd" | "dyslexia" | "visual" | "auditory";
export type SubscriptionTier = "free" | "starter" | "pro" | "team";
export type SubscriptionStatus = "inactive" | "active" | "canceled" | "past_due";
export type UserRole = "student" | "teacher" | "admin";
export type MaterialStatus = "pending" | "processing" | "completed" | "failed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          learning_mode: LearningMode;
          subscription_tier: SubscriptionTier;
          subscription_status: SubscriptionStatus;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          learning_mode?: LearningMode;
          subscription_tier?: SubscriptionTier;
          subscription_status?: SubscriptionStatus;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          learning_mode?: LearningMode;
          subscription_tier?: SubscriptionTier;
          subscription_status?: SubscriptionStatus;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          teacher_id: string;
          title: string;
          description: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          title: string;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          title?: string;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      enrollments: {
        Row: {
          id: string;
          course_id: string;
          student_id: string;
          enrolled_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          student_id: string;
          enrolled_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          student_id?: string;
          enrolled_at?: string;
        };
      };
      materials: {
        Row: {
          id: string;
          course_id: string | null;
          teacher_id: string;
          title: string;
          description: string | null;
          audio_url: string | null;
          audio_duration: number | null;
          google_drive_file_id: string | null;
          status: MaterialStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id?: string | null;
          teacher_id: string;
          title: string;
          description?: string | null;
          audio_url?: string | null;
          audio_duration?: number | null;
          google_drive_file_id?: string | null;
          status?: MaterialStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string | null;
          teacher_id?: string;
          title?: string;
          description?: string | null;
          audio_url?: string | null;
          audio_duration?: number | null;
          google_drive_file_id?: string | null;
          status?: MaterialStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      transcriptions: {
        Row: {
          id: string;
          material_id: string;
          content: string;
          language: string;
          word_count: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          material_id: string;
          content: string;
          language?: string;
          word_count?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          material_id?: string;
          content?: string;
          language?: string;
          word_count?: number | null;
          created_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          material_id: string;
          learning_mode: LearningMode;
          content: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          material_id: string;
          learning_mode: LearningMode;
          content: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          material_id?: string;
          learning_mode?: LearningMode;
          content?: Json;
          created_at?: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          material_id: string;
          title: string;
          questions: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          material_id: string;
          title: string;
          questions: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          material_id?: string;
          title?: string;
          questions?: Json;
          created_at?: string;
        };
      };
      quiz_attempts: {
        Row: {
          id: string;
          quiz_id: string;
          student_id: string;
          answers: Json;
          score: number;
          max_score: number;
          completed_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          student_id: string;
          answers: Json;
          score: number;
          max_score: number;
          completed_at?: string;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          student_id?: string;
          answers?: Json;
          score?: number;
          max_score?: number;
          completed_at?: string;
        };
      };
      flashcard_decks: {
        Row: {
          id: string;
          material_id: string;
          title: string;
          cards: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          material_id: string;
          title: string;
          cards: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          material_id?: string;
          title?: string;
          cards?: Json;
          created_at?: string;
        };
      };
      flashcard_progress: {
        Row: {
          id: string;
          deck_id: string;
          student_id: string;
          card_index: number;
          ease_factor: number;
          interval: number;
          repetitions: number;
          next_review: string;
          last_reviewed: string | null;
        };
        Insert: {
          id?: string;
          deck_id: string;
          student_id: string;
          card_index: number;
          ease_factor?: number;
          interval?: number;
          repetitions?: number;
          next_review?: string;
          last_reviewed?: string | null;
        };
        Update: {
          id?: string;
          deck_id?: string;
          student_id?: string;
          card_index?: number;
          ease_factor?: number;
          interval?: number;
          repetitions?: number;
          next_review?: string;
          last_reviewed?: string | null;
        };
      };
    };
  };
}
