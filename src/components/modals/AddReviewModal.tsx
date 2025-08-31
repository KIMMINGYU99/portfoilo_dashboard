import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ActionButton from "@components/common/ActionButton";
import { ReviewService } from "../../services/reviewService";
import toast from "react-hot-toast";

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onCreated: () => void;
}

export default function AddReviewModal({
  isOpen,
  onClose,
  projectId,
  onCreated,
}: AddReviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    reviewer_name: "",
    reviewer_role: "",
    review_type: "general",
    title: "",
    content: "",
    rating: 0,
    is_public: false,
    is_featured: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.reviewer_name || !form.reviewer_role || !form.content) {
      toast.error("필수 항목을 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      const created = await ReviewService.createReview({
        project_id: projectId,
        reviewer_name: form.reviewer_name,
        reviewer_role: form.reviewer_role,
        review_type: form.review_type as any,
        rating: form.rating || null,
        title: form.title || null,
        content: form.content,
        strengths: [],
        improvements: [],
        technical_feedback: {},
        is_public: form.is_public,
        is_featured: form.is_featured,
        reviewer_email: null,
        created_at: "",
        updated_at: "",
        id: "",
      } as any);
      if (!created) throw new Error("생성 실패");
      toast.success("리뷰가 추가되었습니다.");
      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("리뷰 추가에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">리뷰 작성</h2>
                <ActionButton
                  icon={XMarkIcon}
                  iconOnly
                  aria-label="닫기"
                  className="p-2"
                  onClick={onClose}
                />
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl"
                    placeholder="리뷰어 이름 *"
                    value={form.reviewer_name}
                    onChange={(e) =>
                      setForm({ ...form, reviewer_name: e.target.value })
                    }
                  />
                  <input
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl"
                    placeholder="리뷰어 역할 *"
                    value={form.reviewer_role}
                    onChange={(e) =>
                      setForm({ ...form, reviewer_role: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl"
                    value={form.review_type}
                    onChange={(e) =>
                      setForm({ ...form, review_type: e.target.value })
                    }
                  >
                    <option value="general">일반 리뷰</option>
                    <option value="code_review">코드 리뷰</option>
                    <option value="design_review">디자인 리뷰</option>
                    <option value="user_feedback">사용자 피드백</option>
                  </select>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl"
                    placeholder="평점(선택, 0~5)"
                    value={form.rating}
                    onChange={(e) =>
                      setForm({ ...form, rating: Number(e.target.value) })
                    }
                  />
                </div>
                <input
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl"
                  placeholder="제목(선택)"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <textarea
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl resize-none"
                  rows={6}
                  placeholder="리뷰 내용을 입력하세요 *"
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                />
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <ActionButton
                    type="button"
                    text="취소"
                    variant="outline"
                    onClick={onClose}
                  />
                  <ActionButton
                    type="submit"
                    text="리뷰 등록"
                    variant="primary"
                    loading={loading}
                    disabled={loading}
                  />
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
