import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarService } from "@services/calendarService";
import type { ProjectSchedule } from "@services/supabase";
import { notifyError, notifySuccess } from "@utils/notify";

function toIso(d: Date) {
  return new Date(d).toISOString();
}

export function useCalendarEvents(rangeStart: Date | null, rangeEnd: Date | null) {
  const qc = useQueryClient();
  const enabled = !!rangeStart && !!rangeEnd;
  const startIso = rangeStart ? toIso(rangeStart) : undefined;
  const endIso = rangeEnd ? toIso(rangeEnd) : undefined;
  const key = useMemo(
    () => ["calendar", "range", startIso || "", endIso || ""],
    [startIso, endIso]
  );

  const eventsQuery = useQuery({
    queryKey: key,
    enabled,
    queryFn: async () => {
      return CalendarService.getEventsByDateRange(startIso as string, endIso as string);
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: Omit<ProjectSchedule, "id" | "created_at">) =>
      CalendarService.createEvent(payload as any),
    onSuccess: async () => {
      notifySuccess("일정을 추가했습니다.");
      await qc.invalidateQueries({ queryKey: key });
    },
    onError: (e) => notifyError(e, "일정 추가에 실패했습니다."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProjectSchedule> }) =>
      CalendarService.updateEvent(id, data),
    onSuccess: async () => {
      notifySuccess("일정을 수정했습니다.");
      await qc.invalidateQueries({ queryKey: key });
    },
    onError: (e) => notifyError(e, "일정 수정에 실패했습니다."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => CalendarService.deleteEvent(id),
    onSuccess: async () => {
      notifySuccess("일정을 삭제했습니다.");
      await qc.invalidateQueries({ queryKey: key });
    },
    onError: (e) => notifyError(e, "일정 삭제에 실패했습니다."),
  });

  return {
    events: eventsQuery.data || [],
    loading: eventsQuery.isLoading,
    error: eventsQuery.error ? (eventsQuery.error as Error).message : null,
    refetch: async () => qc.invalidateQueries({ queryKey: key }),
    createEvent: async (p: Omit<ProjectSchedule, "id" | "created_at">) =>
      createMutation.mutateAsync(p as any),
    updateEvent: async (id: string, data: Partial<ProjectSchedule>) =>
      updateMutation.mutateAsync({ id, data }),
    deleteEvent: async (id: string) => deleteMutation.mutateAsync(id),
  };
}
