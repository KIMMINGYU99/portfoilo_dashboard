import { useState, useEffect } from "react";
import { Event } from "../services/supabase";
import { CalendarService } from "../services/calendarService";
import toast from "react-hot-toast";

interface UseEventsReturn {
  events: Event[];
  eventStats: Record<string, number>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  fetchEventsByMonth: (year: number, month: number) => Promise<void>;
  addEvent: (
    event: Omit<Event, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

export function useEvents(
  initialYear?: number,
  initialMonth?: number
): UseEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventStats, setEventStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const eventsData = await CalendarService.getAllEvents();
      setEvents(eventsData);

      // 통계 계산
      const stats: Record<string, number> = {
        전체: eventsData.length,
      };

      const typeStats: Record<string, number> = {};
      eventsData.forEach((event) => {
        if (event.type) {
          typeStats[event.type] = (typeStats[event.type] || 0) + 1;
        }
      });

      setEventStats({ ...stats, ...typeStats });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "이벤트를 불러오는데 실패했습니다.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventsByMonth = async (year: number, month: number) => {
    try {
      setLoading(true);
      setError(null);

      const eventsData = await CalendarService.getEventsByMonth(year, month);
      setEvents(eventsData);

      // 통계 계산
      const stats: Record<string, number> = {
        전체: eventsData.length,
      };

      const typeStats: Record<string, number> = {};
      eventsData.forEach((event) => {
        if (event.type) {
          typeStats[event.type] = (typeStats[event.type] || 0) + 1;
        }
      });

      setEventStats({ ...stats, ...typeStats });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "이벤트를 불러오는데 실패했습니다.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (
    eventData: Omit<Event, "id" | "created_at" | "updated_at">
  ) => {
    try {
      // Note: CalendarService에 createEvent 메서드가 없다면 추가해야 함
      // const newEvent = await CalendarService.createEvent(eventData);

      // 임시로 로컬 생성 (실제로는 서비스에서 생성해야 함)
      const newEvent: Event = {
        id: `temp-${Date.now()}`,
        ...eventData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setEvents((prev) => [newEvent, ...prev]);

      // 통계 업데이트
      setEventStats((prev) => ({
        ...prev,
        전체: prev.전체 + 1,
        [newEvent.type || "other"]: (prev[newEvent.type || "other"] || 0) + 1,
      }));

      toast.success("이벤트가 성공적으로 추가되었습니다.");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "이벤트 추가에 실패했습니다.";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateEvent = async (id: string, eventData: Partial<Event>) => {
    try {
      // Note: CalendarService에 updateEvent 메서드가 없다면 추가해야 함
      // const updatedEvent = await CalendarService.updateEvent(id, eventData);

      // 임시로 로컬 업데이트 (실제로는 서비스에서 업데이트해야 함)
      setEvents((prev) =>
        prev.map((event) =>
          event.id === id
            ? { ...event, ...eventData, updated_at: new Date().toISOString() }
            : event
        )
      );

      toast.success("이벤트가 성공적으로 수정되었습니다.");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "이벤트 수정에 실패했습니다.";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const eventToDelete = events.find((e) => e.id === id);
      if (!eventToDelete) {
        throw new Error("삭제할 이벤트를 찾을 수 없습니다.");
      }

      // Note: CalendarService에 deleteEvent 메서드가 없다면 추가해야 함
      // await CalendarService.deleteEvent(id);

      // 임시로 로컬 삭제 (실제로는 서비스에서 삭제해야 함)
      setEvents((prev) => prev.filter((event) => event.id !== id));

      // 통계 업데이트
      setEventStats((prev) => ({
        ...prev,
        전체: prev.전체 - 1,
        [eventToDelete.type || "other"]:
          (prev[eventToDelete.type || "other"] || 0) - 1,
      }));

      toast.success("이벤트가 성공적으로 삭제되었습니다.");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "이벤트 삭제에 실패했습니다.";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    if (initialYear && initialMonth) {
      fetchEventsByMonth(initialYear, initialMonth);
    } else {
      fetchEvents();
    }
  }, [initialYear, initialMonth]);

  return {
    events,
    eventStats,
    loading,
    error,
    refetch: fetchEvents,
    fetchEventsByMonth,
    addEvent,
    updateEvent,
    deleteEvent,
  };
}
