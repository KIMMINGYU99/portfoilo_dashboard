import { useEffect, useMemo, useState } from "react";
import { CalendarService } from "../../services/calendarService";
import ActionButton from "@components/common/ActionButton";
import { ProjectService } from "../../services/projectService";
import type { Project, ProjectSchedule } from "../../services/supabase";
import toast from "react-hot-toast";

interface EditCalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: ProjectSchedule | null;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export default function EditCalendarEventModal({
  isOpen,
  onClose,
  event,
  onUpdated,
  onDeleted,
}: EditCalendarEventModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState<string>("");
  const [type, setType] = useState<
    "milestone" | "task" | "meeting" | "deadline"
  >("milestone");
  const [allDay, setAllDay] = useState(true);
  const [status, setStatus] = useState<
    "scheduled" | "in_progress" | "completed" | "cancelled"
  >("scheduled");
  const [startLocal, setStartLocal] = useState<string>("");
  const [endLocal, setEndLocal] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    if (!isOpen) return;
    ProjectService.getAllProjects()
      .then(setProjects)
      .catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !event) return;
    const toLocal = (d: Date) => {
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
      )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    setTitle(event.title || "");
    setProjectId(event.project_id || "");
    setType(event.type || "milestone");
    setAllDay(!!event.all_day);
    setStatus(event.status || "scheduled");
    setStartLocal(toLocal(new Date(event.start_time)));
    setEndLocal(toLocal(new Date(event.end_time || event.start_time)));
    setDescription(event.description || "");
  }, [isOpen, event]);

  const disabled = useMemo(
    () => submitting || !event || title.trim().length === 0,
    [submitting, event, title]
  );

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">일정 편집</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">제목</label>
            <input
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">프로젝트</label>
              <select
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                <option value="">선택 안 함</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">유형</label>
              <select
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="milestone">마일스톤</option>
                <option value="task">작업</option>
                <option value="meeting">회의</option>
                <option value="deadline">마감</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">시작</label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                value={startLocal}
                onChange={(e) => setStartLocal(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">종료</label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                value={endLocal}
                onChange={(e) => setEndLocal(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
              />
              <span className="text-sm">하루 종일</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <span className="text-sm text-gray-600">상태</span>
              <select
                className="px-2 py-1 border rounded-md text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="scheduled">예정</option>
                <option value="in_progress">진행중</option>
                <option value="completed">완료</option>
                <option value="cancelled">취소</option>
              </select>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">설명</label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-between gap-2">
          <ActionButton
            text="삭제"
            variant="danger"
            onClick={async () => {
              if (!event) return;
              if (!confirm("이 일정을 삭제하시겠습니까?")) return;
              try {
                setDeleting(true);
                const ok = await CalendarService.deleteEvent(event.id);
                if (ok) {
                  toast.success("일정이 삭제되었습니다.");
                  onClose();
                  onDeleted && onDeleted();
                } else {
                  toast.error("삭제에 실패했습니다.");
                }
              } finally {
                setDeleting(false);
              }
            }}
            disabled={deleting || submitting}
          />
          <div className="flex gap-2">
            <ActionButton
              text="취소"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            />
            <ActionButton
              text="저장"
              variant="primary"
              loading={submitting}
              onClick={async () => {
                if (!event) return;
                try {
                  setSubmitting(true);
                  if (!title.trim()) {
                    toast.error("제목을 입력해 주세요.");
                    return;
                  }
                  const toIso = (local: string) =>
                    new Date(local).toISOString();
                  const updated = await CalendarService.updateEvent(event.id, {
                    project_id: projectId || undefined,
                    title: title.trim(),
                    description: description || undefined,
                    type,
                    start_time: toIso(startLocal),
                    end_time: endLocal ? toIso(endLocal) : undefined,
                    all_day: allDay,
                    status,
                  } as any);
                  if (updated) {
                    toast.success("일정을 수정했습니다.");
                    onClose();
                    onUpdated && onUpdated();
                  } else {
                    toast.error("수정에 실패했습니다.");
                  }
                } catch (e) {
                  console.error(e);
                  toast.error("수정 중 오류가 발생했습니다.");
                } finally {
                  setSubmitting(false);
                }
              }}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
