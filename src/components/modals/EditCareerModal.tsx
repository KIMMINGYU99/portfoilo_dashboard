import { useEffect, useMemo, useState } from "react";
import ActionButton from "@components/common/ActionButton";
import type { CareerTimeline } from "@services/supabase";

interface EditCareerModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CareerTimeline | null;
  onSaved?: () => void;
  onDeleted?: () => void;
}

export default function EditCareerModal({
  isOpen,
  onClose,
  item,
  onSaved,
  onDeleted,
}: EditCareerModalProps) {
  const [title, setTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [type, setType] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [current, setCurrent] = useState(false);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!isOpen || !item) return;
    setTitle(item.title || "");
    setOrganization(item.organization || "");
    setType(item.type || "");
    const toLocal = (d?: string | null) => {
      if (!d) return "";
      const dt = new Date(d);
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(
        dt.getDate()
      )}`;
    };
    setStart(toLocal(item.start_date));
    setEnd(toLocal(item.end_date));
    setCurrent(!!item.current);
    setDescription(item.description || "");
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">경력 편집</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">직함</label>
              <input
                className="w-full px-3 py-2 border rounded-lg"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">조직</label>
              <input
                className="w-full px-3 py-2 border rounded-lg"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">유형</label>
              <input
                className="w-full px-3 py-2 border rounded-lg"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="full-time / contract 등"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  checked={current}
                  onChange={(e) => setCurrent(e.target.checked)}
                />
                <span className="text-sm">현재 재직</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">시작일</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-lg"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">종료일</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-lg"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                disabled={current}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">설명</label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg"
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
            onClick={() => onDeleted && onDeleted()}
          />
          <div className="flex gap-2">
            <ActionButton text="취소" variant="outline" onClick={onClose} />
            <ActionButton
              text="저장"
              variant="primary"
              onClick={() => onSaved && onSaved()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
