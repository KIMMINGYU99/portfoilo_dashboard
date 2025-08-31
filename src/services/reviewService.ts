import { supabase, ProjectReview } from "./supabase";

export class ReviewService {
  static supabase = supabase;

  static async getReviewsByProject(
    projectId: string
  ): Promise<ProjectReview[]> {
    try {
      const { data, error } = await supabase
        .from("project_reviews")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as ProjectReview[]) || [];
    } catch (e) {
      console.error("Error fetching project reviews:", e);
      return [];
    }
  }

  static async createReview(
    data: Omit<ProjectReview, "id" | "created_at" | "updated_at">
  ): Promise<ProjectReview | null> {
    try {
      const { data: created, error } = await supabase
        .from("project_reviews")
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return created as ProjectReview;
    } catch (e) {
      console.error("Error creating review:", e);
      return null;
    }
  }

  // 페이징 지원 리뷰 조회
  static async getReviewsByProjectPaged(
    projectId: string,
    options: {
      page?: number;
      limit?: number;
      sortBy?: "latest" | "rating";
      filterType?:
        | "all"
        | "general"
        | "code_review"
        | "design_review"
        | "user_feedback";
      minRating?: number;
    } = {}
  ): Promise<{ reviews: ProjectReview[]; total: number }> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const sortBy = options.sortBy ?? "latest";
    const filterType = options.filterType ?? "all";

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    try {
      let query = supabase
        .from("project_reviews")
        .select("*", { count: "exact" })
        .eq("project_id", projectId);
      if (typeof options.minRating === "number") {
        query = query.gte("rating", options.minRating);
      }

      if (filterType !== "all") {
        query = query.eq("review_type", filterType);
      }

      if (sortBy === "rating") {
        query = query
          .order("rating", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error, count } = await query.range(from, to);
      if (error) throw error;
      return { reviews: (data as ProjectReview[]) || [], total: count ?? 0 };
    } catch (e) {
      console.error("Error fetching project reviews paged:", e);
      return { reviews: [], total: 0 };
    }
  }

  static async updateReview(
    id: string,
    data: Partial<ProjectReview>
  ): Promise<ProjectReview | null> {
    try {
      const { data: updated, error } = await supabase
        .from("project_reviews")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return updated as ProjectReview;
    } catch (e) {
      console.error("Error updating review:", e);
      return null;
    }
  }

  static async deleteReview(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("project_reviews")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Error deleting review:", e);
      return false;
    }
  }
}
