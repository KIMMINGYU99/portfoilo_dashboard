import { useEffect, useMemo, useState } from "react";
import { ProjectService } from "../../services/projectService";
import type { Technology } from "../../services/supabase";
import toast from "react-hot-toast";
import ActionButton from "@components/common/ActionButton";

interface AddTechnologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (tech: Technology) => void;
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

export default function AddTechnologyModal({
  isOpen,
  onClose,
  onCreated,
}: AddTechnologyModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("frontend");
  const [color, setColor] = useState("#3B82F6");
  const [iconUrl, setIconUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName("");
    setCategory("frontend");
    setColor("#3B82F6");
    setIconUrl("");
  }, [isOpen]);

  const disabled = useMemo(
    () => submitting || name.trim().length === 0,
    [submitting, name]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">새 기술 추가</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">이름</label>
            <input
              className="w-full px-3 py-2 border rounded-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: React, Next.js"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">카테고리</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
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
                className="w-full h-[42px] px-2 py-2 border rounded-lg"
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
              className="w-full px-3 py-2 border rounded-lg"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
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
              try {
                setSubmitting(true);
                if (!name.trim()) {
                  toast.error("이름을 입력해 주세요.");
                  return;
                }
                const created = await ProjectService.createTechnology({
                  name: name.trim(),
                  category,
                  color,
                  icon_url: iconUrl || undefined,
                });
                if (created) {
                  toast.success("기술이 추가되었습니다.");
                  onClose();
                  onCreated && onCreated(created);
                } else {
                  toast.error("추가에 실패했습니다.");
                }
              } catch (e) {
                console.error(e);
                toast.error("추가 중 오류가 발생했습니다.");
              } finally {
                setSubmitting(false);
              }
            }}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
