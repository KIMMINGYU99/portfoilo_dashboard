import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ActionButton from "@components/common/ActionButton";
import { ProjectService } from "../../services/projectService";
import { Project } from "../../services/supabase";
import ProjectForm, { ProjectFormValues } from "../project/ProjectForm";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectAdded: (project: Project) => void;
}

// 기존 간이 폼에서 템플릿화된 폼으로 교체

export default function AddProjectModal({
  isOpen,
  onClose,
  onProjectAdded,
}: AddProjectModalProps) {
  const handleSubmit = async (
    values: ProjectFormValues & {
      thumbnail_url?: string;
      image_urls?: string[];
    }
  ) => {
    const { data, error } = await ProjectService.supabase
      .from("projects")
      .insert([
        {
          title: values.title,
          description: values.description || null,
          github_url: values.github_url || null,
          demo_url: values.demo_url || null,
          start_date: values.start_date || null,
          end_date: values.end_date || null,
          status: values.status,
          detailed_description: {
            role: values.role,
            thumbnail: values.thumbnail_url,
            images: values.image_urls || [],
          },
        },
      ])
      .select()
      .single();

    if (error) throw error;
    // 기술 스택 반영
    await ProjectService.setProjectTechnologies(
      (data as Project).id,
      (values.technologies || []).map((t) => ({
        technology_id: t.technology_id,
        usage_description: (t as any).usage_description,
      }))
    );
    onProjectAdded(data as Project);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 백드롭 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* 모달 */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* 헤더 */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  새 프로젝트 추가
                </h2>
                <ActionButton
                  icon={XMarkIcon}
                  iconOnly
                  aria-label="닫기"
                  onClick={handleClose}
                />
              </div>

              {/* 폼 */}
              <ProjectForm
                mode="create"
                onCancel={handleClose}
                onSubmit={handleSubmit}
              />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
