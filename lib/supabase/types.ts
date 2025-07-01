export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      todos: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          emoji: string | null
          priority: string
          completed: boolean
          starred: boolean
          due_date: string | null
          project_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          emoji?: string | null
          priority?: string
          completed?: boolean
          starred?: boolean
          due_date?: string | null
          project_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          emoji?: string | null
          priority?: string
          completed?: boolean
          starred?: boolean
          due_date?: string | null
          project_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          emoji: string | null
          color: string
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          emoji?: string | null
          color?: string
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          emoji?: string | null
          color?: string
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      daily_focuses: {
        Row: {
          id: string
          user_id: string
          focus_date: string
          title: string
          description: string | null
          completed: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          focus_date: string
          title: string
          description?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          focus_date?: string
          title?: string
          description?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      daily_reflections: {
        Row: {
          id: string
          user_id: string
          reflection_date: string
          accomplishments: string | null
          learnings: string | null
          improvements: string | null
          mood_rating: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          reflection_date: string
          accomplishments?: string | null
          learnings?: string | null
          improvements?: string | null
          mood_rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          reflection_date?: string
          accomplishments?: string | null
          learnings?: string | null
          improvements?: string | null
          mood_rating?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
