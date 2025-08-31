import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Technology } from "../services/supabase";
import { ProjectService } from "../services/projectService";
import { notifyError, notifySuccess } from "@utils/notify";

interface UseTechnologiesReturn {
  technologies: Technology[];
  techStats: Record<string, number>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addTechnology: (
    technology: Omit<Technology, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
  updateTechnology: (
    id: string,
    technology: Partial<Technology>
  ) => Promise<void>;
  deleteTechnology: (id: string) => Promise<void>;
}

export function useTechnologies(): UseTechnologiesReturn {
  const qc = useQueryClient();

  const techsQuery = useQuery({
    queryKey: ["technologies", "all"],
    queryFn: ProjectService.getAllTechnologies,
  });

  const addMutation = useMutation({
    mutationFn: (
      technologyData: Omit<Technology, "id" | "created_at" | "updated_at">
    ) => ProjectService.createTechnology(technologyData as any),
    onSuccess: async () => {
      notifySuccess("기술이 성공적으로 추가되었습니다.");
      await qc.invalidateQueries({ queryKey: ["technologies", "all"] });
    },
    onError: (e) => notifyError(e, "기술 추가에 실패했습니다."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Technology> }) =>
      ProjectService.updateTechnology(id, data as any),
    onSuccess: async () => {
      notifySuccess("기술이 성공적으로 수정되었습니다.");
      await qc.invalidateQueries({ queryKey: ["technologies", "all"] });
    },
    onError: (e) => notifyError(e, "기술 수정에 실패했습니다."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ProjectService.deleteTechnology(id),
    onSuccess: async () => {
      notifySuccess("기술이 성공적으로 삭제되었습니다.");
      await qc.invalidateQueries({ queryKey: ["technologies", "all"] });
    },
    onError: (e) => notifyError(e, "기술 삭제에 실패했습니다."),
  });

  const technologies = useMemo(() => techsQuery.data || [], [techsQuery.data]);
  const techStats = useMemo(() => {
    const stats: Record<string, number> = { 전체: technologies.length };
    const categoryStats: Record<string, number> = {};
    technologies.forEach((tech) => {
      if (tech.category) {
        const key = tech.category.toLowerCase();
        categoryStats[key] = (categoryStats[key] || 0) + 1;
      }
    });
    return { ...stats, ...categoryStats };
  }, [technologies]);

  const loading = techsQuery.isLoading;
  const error = techsQuery.error ? notifyError(techsQuery.error) : null;

  return {
    technologies,
    techStats,
    loading,
    error,
    refetch: async () => {
      await qc.invalidateQueries({ queryKey: ["technologies", "all"] });
    },
    addTechnology: async (t) => {
      await addMutation.mutateAsync(t);
    },
    updateTechnology: async (id, data) => {
      await updateMutation.mutateAsync({ id, data });
    },
    deleteTechnology: async (id) => {
      await deleteMutation.mutateAsync(id);
    },
  };
}
