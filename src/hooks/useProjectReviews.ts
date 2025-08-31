import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ReviewService } from "@services/reviewService";
import type { ProjectReview } from "@services/supabase";

export type ReviewsOptions = {
  page?: number;
  limit?: number;
  sortBy?: "latest" | "rating";
  filterType?: "all" | "general" | "code_review" | "design_review" | "user_feedback";
  minRating?: number;
};

export function useProjectReviews(projectId: string | undefined, options: ReviewsOptions) {
  const qc = useQueryClient();
  const { page = 1, limit = 5, sortBy = "latest", filterType = "all", minRating } = options;

  const key = [
    "reviews",
    projectId || "",
    page,
    limit,
    sortBy,
    filterType,
    typeof minRating === "number" ? minRating : ""
  ];

  const query = useQuery({
    queryKey: key,
    enabled: !!projectId,
    queryFn: async () => {
      const { reviews, total } = await ReviewService.getReviewsByProjectPaged(projectId as string, {
        page,
        limit,
        sortBy,
        filterType,
        minRating,
      });
      return { reviews, total };
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });

  const stats = useMemo(() => {
    const r = (query.data?.reviews || []) as ProjectReview[];
    const count = r.length;
    const sum = r.reduce((acc, it) => acc + (it.rating || 0), 0);
    const average = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    r.forEach((it) => {
      const rt = Math.max(1, Math.min(5, Math.round(it.rating || 0)));
      distribution[rt] = (distribution[rt] || 0) + 1;
    });
    return { average, distribution };
  }, [query.data]);

  return {
    reviews: (query.data?.reviews || []) as ProjectReview[],
    total: query.data?.total || 0,
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    stats,
    refetch: async () => qc.invalidateQueries({ queryKey: key }),
  };
}
