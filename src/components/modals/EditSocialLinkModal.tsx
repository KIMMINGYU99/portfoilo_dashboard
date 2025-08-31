import React, { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ActionButton from "@components/common/ActionButton";

export interface SocialLinkForm {
  key: string;
  url: string;
}

interface EditSocialLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  initial?: SocialLinkForm | null;
  onSaved: (form: SocialLinkForm) => Promise<void> | void;
}

const isValidUrl = (value: string): boolean => {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
};

export default function EditSocialLinkModal({
  isOpen,
  onClose,
  initial,
  onSaved,
}: EditSocialLinkModalProps) {
  const [key, setKey] = React.useState<string>(initial?.key || "website");
  const [url, setUrl] = React.useState<string>(initial?.url || "https://");
  const [submitting, setSubmitting] = React.useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setKey(initial?.key || "website");
    setUrl(initial?.url || "https://");
  }, [isOpen, initial]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!key.trim() || !isValidUrl(url.trim())) return;
    setSubmitting(true);
    try {
      await onSaved({ key: key.trim(), url: url.trim() });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            소셜 링크 {initial ? "편집" : "추가"}
          </h3>
          <ActionButton icon={XMarkIcon} iconOnly aria-label="닫기" onClick={onClose} />
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              키(예: website, github, linkedin)
            </label>
            <input
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="website"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              URL
            </label>
            <input
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://"
              type="url"
              inputMode="url"
            />
            {!isValidUrl(url || "") && (
              <p className="mt-1 text-xs text-red-500">올바른 URL을 입력하세요.</p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 p-5 border-t border-gray-200 dark:border-gray-700">
          <ActionButton text="취소" variant="outline" onClick={onClose} />
          <ActionButton
            text="저장"
            variant="primary"
            loading={submitting}
            disabled={submitting || !key.trim() || !isValidUrl(url || "")}
            onClick={handleSave}
          />
        </div>
      </div>
    </div>
  );
}


