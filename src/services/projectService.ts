import { supabase, Project, Technology, ProjectTemplate } from "./supabase";

export class ProjectService {
  // Supabase 클라이언트 노출 (모달에서 사용)
  static supabase = supabase;

  // 기본 사용자 ID 가져오기 (임시)
  static async getDefaultUserId(): Promise<string> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("email", "developer@example.com")
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error("Error fetching default user:", error);
      throw error;
    }
  }

  // 모든 프로젝트 가져오기 (시작 날짜순, 같으면 끝난 날짜순)
  static async getAllProjects(): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("start_date", { ascending: true })
        .order("end_date", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [];
    }
  }

  // 특정 프로젝트 가져오기
  static async getProject(id: string): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching project:", error);
      return null;
    }
  }

  // 프로젝트 생성
  static async createProject(
    projectData: Partial<Project>
  ): Promise<Project | null> {
    try {
      const userId = await this.getDefaultUserId();

      const { data, error } = await supabase
        .from("projects")
        .insert({
          ...projectData,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating project:", error);
      return null;
    }
  }

  // 프로젝트 업데이트
  static async updateProject(
    id: string,
    projectData: Partial<Project>
  ): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from("projects")
        .update({
          ...projectData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating project:", error);
      return null;
    }
  }

  // 프로젝트 삭제
  static async deleteProject(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting project:", error);
      return false;
    }
  }

  // 프로젝트의 기술 스택 가져오기
  static async getProjectTechnologies(
    projectId: string
  ): Promise<Technology[]> {
    try {
      const { data, error } = await supabase
        .from("project_technologies")
        .select(
          `
          technology_id,
          usage_description,
          technologies (
            id,
            name,
            category,
            color
          )
        `
        )
        .eq("project_id", projectId);

      if (error) throw error;

      // technologies 데이터만 추출
      return (
        data
          ?.map((item: any) => ({
            ...item.technologies,
            usage_description: item.usage_description,
          }))
          .filter(Boolean) || []
      );
    } catch (error) {
      console.error("Error fetching project technologies:", error);
      return [];
    }
  }

  // 모든 기술 스택 가져오기 (생성된 순서대로)
  static async getAllTechnologies(): Promise<Technology[]> {
    try {
      const { data, error } = await supabase
        .from("technologies")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching technologies:", error);
      return [];
    }
  }

  // 기술 생성
  static async createTechnology(
    payload: Partial<Technology>
  ): Promise<Technology | null> {
    try {
      const normalized = {
        name: payload.name,
        category: (payload.category || "")?.toLowerCase().trim() || null,
        color: payload.color || null,
        icon_url: payload.icon_url || null,
      } as any;
      const { data, error } = await supabase
        .from("technologies")
        .insert(normalized)
        .select()
        .single();
      if (error) throw error;
      return data as Technology;
    } catch (e) {
      console.error("Error creating technology:", e);
      return null;
    }
  }

  // 기술 수정
  static async updateTechnology(
    id: string,
    payload: Partial<Technology>
  ): Promise<Technology | null> {
    try {
      const normalized = {
        name: payload.name,
        category: (payload.category || "")?.toLowerCase().trim() || null,
        color: payload.color || null,
        icon_url: payload.icon_url || null,
      } as any;
      const { data, error } = await supabase
        .from("technologies")
        .update(normalized)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Technology;
    } catch (e) {
      console.error("Error updating technology:", e);
      return null;
    }
  }

  // 기술 삭제
  static async deleteTechnology(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("technologies")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Error deleting technology:", e);
      return false;
    }
  }

  // 프로젝트에 기술 스택 추가
  static async addProjectTechnology(
    projectId: string,
    technologyId: string,
    usageDescription?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from("project_technologies").insert({
        project_id: projectId,
        technology_id: technologyId,
        usage_description: usageDescription,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error adding project technology:", error);
      return false;
    }
  }

  // 프로젝트 기술 스택 일괄 설정(업서트 + 제거)
  static async setProjectTechnologies(
    projectId: string,
    selections: Array<{
      technology_id: string;
      usage_description?: string;
    }>
  ): Promise<boolean> {
    try {
      // 현재 연결 조회
      const { data: current, error: e1 } = await supabase
        .from("project_technologies")
        .select("technology_id")
        .eq("project_id", projectId);
      if (e1) throw e1;

      const currentIds = new Set(
        (current || []).map((r: any) => r.technology_id)
      );
      const nextIds = new Set(selections.map((s) => s.technology_id));

      // 제거할 항목
      const toDelete: string[] = [];
      currentIds.forEach((id: string) => {
        if (!nextIds.has(id)) toDelete.push(id);
      });

      if (toDelete.length > 0) {
        const { error: eDel } = await supabase
          .from("project_technologies")
          .delete()
          .eq("project_id", projectId)
          .in("technology_id", toDelete);
        if (eDel) throw eDel;
      }

      if (selections.length > 0) {
        const rows = selections.map((s) => ({
          project_id: projectId,
          technology_id: s.technology_id,
          usage_description: s.usage_description,
        }));

        const { error: eUp } = await supabase
          .from("project_technologies")
          .upsert(rows, { onConflict: "project_id,technology_id" });
        if (eUp) throw eUp;
      }

      return true;
    } catch (error) {
      console.error("Error setting project technologies:", error);
      return false;
    }
  }

  // 프로젝트와 기술 스택을 함께 가져오기
  static async getProjectsWithTechnologies(): Promise<
    (Project & { technologies: Technology[] })[]
  > {
    try {
      const projects = await this.getAllProjects();

      const projectsWithTechnologies = await Promise.all(
        projects.map(async (project) => {
          const technologies = await this.getProjectTechnologies(project.id);
          return { ...project, technologies };
        })
      );

      return projectsWithTechnologies;
    } catch (error) {
      console.error("Error fetching projects with technologies:", error);
      return [];
    }
  }

  // 상태별 프로젝트 통계
  static async getProjectStats(): Promise<Record<string, number>> {
    try {
      const projects = await this.getAllProjects();

      const stats = projects.reduce((acc, project) => {
        const status = project.status || "unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        전체: projects.length,
        ...stats,
      };
    } catch (error) {
      console.error("Error fetching project stats:", error);
      return { 전체: 0 };
    }
  }

  // 프로젝트 템플릿 가져오기
  static async getProjectTemplates(): Promise<ProjectTemplate[]> {
    try {
      const { data, error } = await supabase
        .from("project_templates")
        .select("*")
        .eq("is_active", true)
        .order("is_default", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching project templates:", error);
      return [];
    }
  }

  // 기존 호환성을 위한 별칭 메서드들
  static getProjectsWithSkills = this.getProjectsWithTechnologies;
  static getAllSkills = this.getAllTechnologies;
  static getProjectSkills = this.getProjectTechnologies;
}
