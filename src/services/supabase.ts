import { createClient } from "@supabase/supabase-js";

// 환경변수에서 가져오기 (+ 공백/따옴표 제거)
const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "";
const rawAnon = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "";
const supabaseUrl = rawUrl.trim().replace(/^['"]|['"]$/g, "");
const supabaseAnonKey = rawAnon.trim().replace(/^['"]|['"]$/g, "");

// 환경변수 체크
const isValidSupabaseUrl = (url: string) => {
  try {
    const u = new URL(url);
    return (
      (u.protocol === "https:" || u.protocol === "http:") &&
      /supabase\.co$/.test(u.hostname)
    );
  } catch {
    return false;
  }
};

if (!supabaseUrl || !supabaseAnonKey || !isValidSupabaseUrl(supabaseUrl)) {
  const message = [
    "Supabase 설정 오류:",
    `VITE_SUPABASE_URL='${supabaseUrl || "(빈 값)"}'`,
    `VITE_SUPABASE_ANON_KEY='${
      supabaseAnonKey ? supabaseAnonKey.substring(0, 8) + "..." : "(빈 값)"
    }'`,
    "- .env(.local) 파일에 올바른 값을 설정했는지 확인하세요.",
    "- URL은 https://<project-ref>.supabase.co 형식이어야 합니다.",
  ].join("\n");
  throw new Error(message);
}

console.log("Supabase 연결 정보:", {
  supabaseUrl,
  supabaseAnonKey: supabaseAnonKey.substring(0, 20) + "...",
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 새로운 ERD 기준 타입 정의

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  social_links: Record<string, string>;
  certifications: Array<{
    name: string;
    issuer?: string;
    issued_at?: string;
    expires_at?: string;
    credential_id?: string;
    credential_url?: string;
    notes?: string;
  }>;
  career: Array<{
    title: string;
    company: string;
    period: string;
    description: string;
    type: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  detailed_description: Record<string, any>;
  status: "planned" | "in_progress" | "completed" | "on_hold";
  // priority removed
  github_url?: string;
  demo_url?: string;
  images: string[];
  features: string[];
  challenges: string[];
  achievements: Record<string, any>;
  lessons_learned?: string;
  future_plans?: string;
  template_version: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Technology {
  id: string;
  name: string;
  category?: string;
  icon_url?: string;
  color?: string;
  created_at: string;
}

export interface ProjectTechnology {
  id: string;
  project_id: string;
  technology_id: string;
  // proficiency_level removed
  usage_description?: string;
}

export interface ProjectSchedule {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  type: "milestone" | "task" | "meeting" | "deadline";
  start_time: string;
  end_time?: string;
  all_day: boolean;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  created_at: string;
  updated_at?: string;
}

export interface BlogPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  status: "draft" | "published" | "archived";
  tags: string[];
  slug: string;
  url?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CareerTimeline {
  id: string;
  user_id: string;
  title: string;
  organization?: string;
  type?: string;
  description?: string;
  start_date: string;
  end_date?: string;
  current: boolean;
  created_at: string;
}

export interface LearningTrack {
  id: string;
  user_id: string;
  technology_id?: string;
  title: string;
  description?: string;
  progress_percentage: number;
  target_date?: string;
  status: "active" | "completed" | "paused";
  created_at: string;
  updated_at: string;
}

export interface CodeSnippet {
  id: string;
  user_id: string;
  title: string;
  code: string;
  language: string;
  description?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  version: string;
  description?: string;
  template_schema: Record<string, any>;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectReview {
  id: string;
  project_id: string;
  reviewer_name?: string;
  reviewer_email?: string;
  reviewer_role?: string;
  review_type: "general" | "code_review" | "design_review" | "user_feedback";
  rating?: number;
  title?: string;
  content: string;
  strengths: string[];
  improvements: string[];
  technical_feedback: Record<string, any>;
  is_public: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

// 기존 호환성을 위한 별칭
export interface Event extends ProjectSchedule {}
export interface Skill extends Technology {}
export interface SkillsType {
  id: string;
  name: string;
}
export interface ProjectSkill extends ProjectTechnology {}
export interface ReviewMessage extends ProjectReview {}
