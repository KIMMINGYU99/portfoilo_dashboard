import { supabase, ProjectSchedule } from "./supabase";

export class CalendarService {
  // Supabase 클라이언트 노출
  static supabase = supabase;

  // 모든 이벤트 가져오기 (생성된 순서대로)
  static async getAllEvents(): Promise<ProjectSchedule[]> {
    try {
      const { data, error } = await supabase
        .from("project_schedules")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching events:", error);
      return [];
    }
  }

  // 특정 날짜 범위의 이벤트 가져오기
  static async getEventsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<ProjectSchedule[]> {
    try {
      // 1) 종료가 있는 이벤트: start_time <= endDate AND end_time >= startDate
      const q1 = supabase
        .from("project_schedules")
        .select("*")
        .not("end_time", "is", null)
        .lte("start_time", endDate)
        .gte("end_time", startDate);

      // 2) 종료가 없는 이벤트: start_time BETWEEN [startDate, endDate]
      const q2 = supabase
        .from("project_schedules")
        .select("*")
        .is("end_time", null)
        .gte("start_time", startDate)
        .lte("start_time", endDate);

      const [{ data: d1, error: e1 }, { data: d2, error: e2 }] =
        await Promise.all([q1, q2]);

      if (e1) throw e1;
      if (e2) throw e2;

      const merged = [...(d1 || []), ...(d2 || [])].sort(
        (a: any, b: any) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
      return merged;
    } catch (error) {
      console.error("Error fetching events by date range:", error);
      return [];
    }
  }

  // 특정 월의 이벤트 가져오기
  static async getEventsByMonth(
    year: number,
    month: number
  ): Promise<ProjectSchedule[]> {
    try {
      // 월 시작~끝 + 버퍼(앞뒤 하루)로 겹치는 이벤트 안정 포착
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      const startDate = new Date(
        start.getTime() - 24 * 60 * 60 * 1000
      ).toISOString();
      const endDate = new Date(
        end.getTime() + 24 * 60 * 60 * 1000
      ).toISOString();

      return await this.getEventsByDateRange(startDate, endDate);
    } catch (error) {
      console.error("Error fetching events by month:", error);
      return [];
    }
  }

  // 특정 이벤트 가져오기
  static async getEvent(id: string): Promise<ProjectSchedule | null> {
    try {
      const { data, error } = await supabase
        .from("project_schedules")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching event:", error);
      return null;
    }
  }

  // 새 이벤트 생성
  static async createEvent(
    eventData: Omit<ProjectSchedule, "id" | "created_at">
  ): Promise<ProjectSchedule | null> {
    try {
      const { data, error } = await supabase
        .from("project_schedules")
        .insert([eventData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating event:", error);
      return null;
    }
  }

  // 이벤트 업데이트
  static async updateEvent(
    id: string,
    eventData: Partial<ProjectSchedule>
  ): Promise<ProjectSchedule | null> {
    try {
      const { data, error } = await supabase
        .from("project_schedules")
        .update(eventData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating event:", error);
      return null;
    }
  }

  // 이벤트 삭제
  static async deleteEvent(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("project_schedules")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting event:", error);
      return false;
    }
  }

  // 프로젝트와 연관된 이벤트 가져오기
  static async getEventsByProject(
    projectId: string
  ): Promise<ProjectSchedule[]> {
    try {
      const { data, error } = await supabase
        .from("project_schedules")
        .select("*")
        .eq("project_id", projectId)
        .order("start_time", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching events by project:", error);
      return [];
    }
  }

  // 이벤트 타입별 통계
  static async getEventStats(): Promise<Record<string, number>> {
    try {
      const events = await this.getAllEvents();

      const stats = events.reduce((acc, event) => {
        const type = event.type || "task";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        전체: events.length,
        ...stats,
      };
    } catch (error) {
      console.error("Error fetching event stats:", error);
      return { 전체: 0 };
    }
  }

  // 오늘의 이벤트 가져오기
  static async getTodayEvents(): Promise<ProjectSchedule[]> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      return await this.getEventsByDateRange(startOfDay, endOfDay);
    } catch (error) {
      console.error("Error fetching today's events:", error);
      return [];
    }
  }

  // 이번 주의 이벤트 가져오기
  static async getWeekEvents(): Promise<ProjectSchedule[]> {
    try {
      const today = new Date();
      const startOfWeek = new Date(
        today.setDate(today.getDate() - today.getDay())
      );
      const endOfWeek = new Date(
        today.setDate(today.getDate() - today.getDay() + 6)
      );

      startOfWeek.setHours(0, 0, 0, 0);
      endOfWeek.setHours(23, 59, 59, 999);

      return await this.getEventsByDateRange(
        startOfWeek.toISOString(),
        endOfWeek.toISOString()
      );
    } catch (error) {
      console.error("Error fetching week events:", error);
      return [];
    }
  }
}
