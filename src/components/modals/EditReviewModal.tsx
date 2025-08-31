import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ActionButton from "@components/common/ActionButton";
import { ReviewService } from "../../services/reviewService";
import toast from "react-hot-toast";

interface EditReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: any | null;
  onUpdated: () => void;
}

export default function EditReviewModal({
  isOpen,
  onClose,
  review,
  onUpdated,
}: EditReviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", rating: 0 });

  useEffect(() => {
    if (review) {
      setForm({
        title: review.title || "",
        content: review.content || "",
        rating: review.rating || 0,
      });
    }
  }, [review]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!review) return;
    if (!form.content) {
      toast.error("내용을 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      const updated = await ReviewService.updateReview(review.id, {
        title: form.title || null,
        content: form.content,
        rating: form.rating || null,
      } as any);
      if (!updated) throw new Error("수정 실패");
      toast.success("리뷰가 수정되었습니다.");
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">리뷰 수정</h2>
                <ActionButton icon={XMarkIcon} iconOnly aria-label="닫기" onClick={onClose} />
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <input
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl"
                  placeholder="제목(선택)"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <textarea
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl resize-none"
                  rows={6}
                  placeholder="리뷰 내용을 입력하세요 *"
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                />
                <input
                  type="number"
                  min={0}
                  max={5}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl"
                  placeholder="평점(선택, 0~5)"
                  value={form.rating}
                  onChange={(e) =>
                    setForm({ ...form, rating: Number(e.target.value) })
                  }
                />
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <ActionButton type="button" text="취소" variant="outline" onClick={onClose} />
                  <ActionButton type="submit" text="수정 저장" variant="primary" loading={loading} disabled={loading} />
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
