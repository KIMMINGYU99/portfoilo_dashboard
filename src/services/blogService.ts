import { supabase, BlogPost } from "./supabase";

export class BlogService {
  static supabase = supabase;

  // 모든 블로그 포스트 가져오기
  static async getAllPosts(): Promise<BlogPost[]> {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      return [];
    }
  }

  // 발행된 포스트만 가져오기
  static async getPublishedPosts(): Promise<BlogPost[]> {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching published posts:", error);
      return [];
    }
  }

  // 특정 포스트 가져오기
  static async getPost(id: string): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching blog post:", error);
      return null;
    }
  }

  // 슬러그로 포스트 가져오기
  static async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching blog post by slug:", error);
      return null;
    }
  }

  // 포스트 생성
  static async createPost(
    postData: Omit<BlogPost, "id" | "created_at" | "updated_at">
  ): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .insert([postData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating blog post:", error);
      return null;
    }
  }

  // 포스트 업데이트
  static async updatePost(
    id: string,
    postData: Partial<BlogPost>
  ): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .update({
          ...postData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating blog post:", error);
      return null;
    }
  }

  // 포스트 삭제
  static async deletePost(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting blog post:", error);
      return false;
    }
  }

  // 포스트 발행
  static async publishPost(id: string): Promise<BlogPost | null> {
    return this.updatePost(id, {
      status: "published",
      published_at: new Date().toISOString(),
    });
  }

  // 포스트 발행 취소(초안으로 전환)
  static async unpublishPost(id: string): Promise<BlogPost | null> {
    return this.updatePost(id, {
      status: "draft",
      published_at: null as any,
    });
  }

  // 태그별 포스트 가져오기
  static async getPostsByTag(tag: string): Promise<BlogPost[]> {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .contains("tags", [tag])
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching posts by tag:", error);
      return [];
    }
  }
}
