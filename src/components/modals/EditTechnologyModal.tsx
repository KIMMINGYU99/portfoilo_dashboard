import { useEffect, useMemo, useState } from "react";
import ActionButton from "@components/common/ActionButton";
import { ProjectService } from "../../services/projectService";
import type { Technology } from "../../services/supabase";
import toast from "react-hot-toast";

interface EditTechnologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  technology: Technology | null;
  onUpdated?: (tech: Technology) => void;
  onDeleted?: (id: string) => void;
}

const CATEGORY_OPTIONS = [
  "frontend",
  "backend",
  "database",
  "devops",
  "mobile",
  "design",
  "language",
  "other",
];

export default function EditTechnologyModal({
  isOpen,
  onClose,
  technology,
  onUpdated,
  onDeleted,
}: EditTechnologyModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("frontend");
  const [color, setColor] = useState("#3B82F6");
  const [iconUrl, setIconUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen || !technology) return;
    setName(technology.name);
    setCategory((technology.category || "frontend").toString());
    setColor(technology.color || "#3B82F6");
    setIconUrl(technology.icon_url || "");
  }, [isOpen, technology]);

  const disabled = useMemo(
    () => submitting || !technology || name.trim().length === 0,
    [submitting, technology, name]
  );

  if (!isOpen || !technology) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">기술 편집</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">이름</label>
            <input
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">카테고리</label>
              <select
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                색상(Hex)
              </label>
              <input
                type="color"
                className="w-full h-[42px] px-2 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              아이콘 URL(선택)
            </label>
            <input
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-between gap-2">
          <ActionButton
            text="삭제"
            variant="danger"
            onClick={async () => {
              if (!technology) return;
              if (!confirm("이 기술을 삭제하시겠습니까?")) return;
              try {
                setDeleting(true);
                const ok = await ProjectService.deleteTechnology(technology.id);
                if (ok) {
                  toast.success("기술이 삭제되었습니다.");
                  onClose();
                  onDeleted && onDeleted(technology.id);
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
              onClick={async () => {
                if (!technology) return;
                try {
                  setSubmitting(true);
                  if (!name.trim()) {
                    toast.error("이름을 입력해 주세요.");
                    return;
                  }
                  const updated = await ProjectService.updateTechnology(
                    technology.id,
                    {
                      name: name.trim(),
                      category,
                      color,
                      icon_url: iconUrl || undefined,
                    }
                  );
                  if (updated) {
                    toast.success("기술이 수정되었습니다.");
                    onClose();
                    onUpdated && onUpdated(updated);
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
