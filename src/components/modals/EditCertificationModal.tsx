import { useEffect, useState } from "react";
import ActionButton from "@components/common/ActionButton";

export interface CertificationItem {
  name: string;
  issuer?: string;
  issued_at?: string; // ISO
  expires_at?: string; // ISO
  credential_id?: string;
  credential_url?: string;
  notes?: string;
}

interface EditCertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CertificationItem | null;
  onSaved?: (item: CertificationItem) => void;
  onDeleted?: () => void;
}

export default function EditCertificationModal({
  isOpen,
  onClose,
  item,
  onSaved,
  onDeleted,
}: EditCertificationModalProps) {
  const [form, setForm] = useState<CertificationItem>({ name: "" });

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      item || {
        name: "",
        issuer: "",
        issued_at: "",
        expires_at: "",
        credential_id: "",
        credential_url: "",
        notes: "",
      }
    );
  }, [isOpen, item]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          자격증 {item ? "편집" : "추가"}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">이름 *</label>
            <input
              className="w-full px-3 py-2 border rounded-lg"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">발급기관</label>
              <input
                className="w-full px-3 py-2 border rounded-lg"
                value={form.issuer || ""}
                onChange={(e) => setForm({ ...form, issuer: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">자격번호</label>
              <input
                className="w-full px-3 py-2 border rounded-lg"
                value={form.credential_id || ""}
                onChange={(e) =>
                  setForm({ ...form, credential_id: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">취득일</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-lg"
                value={form.issued_at || ""}
                onChange={(e) =>
                  setForm({ ...form, issued_at: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">만료일</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-lg"
                value={form.expires_at || ""}
                onChange={(e) =>
                  setForm({ ...form, expires_at: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">검증 링크</label>
            <input
              type="url"
              className="w-full px-3 py-2 border rounded-lg"
              value={form.credential_url || ""}
              onChange={(e) =>
                setForm({ ...form, credential_url: e.target.value })
              }
              placeholder="https://"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">메모</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border rounded-lg"
              value={form.notes || ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-between gap-2">
          {item && (
            <ActionButton
              text="삭제"
              variant="danger"
              onClick={() => onDeleted && onDeleted()}
            />
          )}
          <div className="flex gap-2">
            <ActionButton text="취소" variant="outline" onClick={onClose} />
            <ActionButton
              text="저장"
              variant="primary"
              onClick={() => onSaved && onSaved(form)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
