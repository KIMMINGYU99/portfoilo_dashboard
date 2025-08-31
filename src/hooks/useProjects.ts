import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Project, Technology } from "../services/supabase";
import { ProjectService } from "../services/projectService";
import { notifyError, notifySuccess } from "@utils/notify";

export interface ProjectWithTechnologies extends Project {
  technologies: Technology[];
}

interface UseProjectsReturn {
  projects: ProjectWithTechnologies[];
  projectStats: Record<string, number>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addProject: (
    project: Omit<Project, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export function useProjects(): UseProjectsReturn {
  const qc = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ["projects", "with-tech"],
    queryFn: () => ProjectService.getProjectsWithTechnologies(),
  });

  const statsQuery = useQuery({
    queryKey: ["projects", "stats"],
    queryFn: () => ProjectService.getProjectStats(),
  });

  const addMutation = useMutation({
    mutationFn: (
      projectData: Omit<Project, "id" | "created_at" | "updated_at">
    ) => ProjectService.createProject(projectData),
    onSuccess: async () => {
      notifySuccess("프로젝트가 성공적으로 추가되었습니다.");
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["projects", "with-tech"] }),
        qc.invalidateQueries({ queryKey: ["projects", "stats"] }),
      ]);
    },
    onError: (e) => {
      notifyError(e, "프로젝트 추가에 실패했습니다.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      ProjectService.updateProject(id, data),
    onSuccess: async () => {
      notifySuccess("프로젝트가 성공적으로 수정되었습니다.");
      await qc.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (e) => notifyError(e, "프로젝트 수정에 실패했습니다."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ProjectService.deleteProject(id),
    onSuccess: async () => {
      notifySuccess("프로젝트가 성공적으로 삭제되었습니다.");
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["projects", "with-tech"] }),
        qc.invalidateQueries({ queryKey: ["projects", "stats"] }),
      ]);
    },
    onError: (e) => notifyError(e, "프로젝트 삭제에 실패했습니다."),
  });

  const loading = projectsQuery.isLoading || statsQuery.isLoading;
  const error = (projectsQuery.error || statsQuery.error)
    ? notifyError(projectsQuery.error || statsQuery.error)
    : null;

  const projects = useMemo(
    () => projectsQuery.data || [],
    [projectsQuery.data]
  );
  const projectStats = useMemo(
    () => statsQuery.data || ({} as Record<string, number>),
    [statsQuery.data]
  );

  return {
    projects,
    projectStats,
    loading,
    error,
    refetch: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["projects", "with-tech"] }),
        qc.invalidateQueries({ queryKey: ["projects", "stats"] }),
      ]);
    },
    addProject: async (p) => {
      await addMutation.mutateAsync(p);
    },
    updateProject: async (id, data) => {
      await updateMutation.mutateAsync({ id, data });
    },
    deleteProject: async (id) => {
      await deleteMutation.mutateAsync(id);
    },
  };
}
