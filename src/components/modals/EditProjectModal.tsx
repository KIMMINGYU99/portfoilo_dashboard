import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ActionButton from "@components/common/ActionButton";
import { ProjectService } from "../../services/projectService";
import { Project, Technology } from "../../services/supabase";
import ProjectForm, { ProjectFormValues } from "../project/ProjectForm";
import { StorageService } from "../../services/storageService";

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectUpdated: (project: Project) => void;
  project: (Project & { technologies: Technology[] }) | null;
}

// 기존 폼을 공통 ProjectForm으로 대체

export default function EditProjectModal({
  isOpen,
  onClose,
  onProjectUpdated,
  project,
}: EditProjectModalProps) {
  if (!project) return null;

  const initialImages: string[] = Array.isArray(
    (project.detailed_description as any)?.images
  )
    ? ((project.detailed_description as any).images as string[])
    : [];
  const [images, setImages] = useState<string[]>(initialImages);
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const currentThumb: string | undefined = (project.detailed_description as any)
    ?.thumbnail;

  useEffect(() => {
    const fresh: string[] = Array.isArray(
      (project.detailed_description as any)?.images
    )
      ? ((project.detailed_description as any).images as string[])
      : [];
    setImages(fresh);
  }, [project]);

  const handleSubmit = async (
    values: ProjectFormValues & {
      thumbnail_url?: string;
      image_urls?: string[];
    }
  ) => {
    const { data, error } = await ProjectService.supabase
      .from("projects")
      .update({
        title: values.title,
        description: values.description || null,
        github_url: values.github_url || null,
        demo_url: values.demo_url || null,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        status: values.status,
        detailed_description: {
          ...(project.detailed_description || {}),
          role: values.role,
          markdown: values.markdown,
          thumbnail:
            values.thumbnail_url ||
            (project.detailed_description as any)?.thumbnail,
          images:
            (values.image_urls && values.image_urls.length > 0
              ? values.image_urls
              : (project.detailed_description as any)?.images) || [],
        },
      })
      .eq("id", project.id)
      .select()
      .single();

    if (error) throw error;
    // 기술 스택 반영
    await ProjectService.setProjectTechnologies(
      project.id,
      (values.technologies || []).map((t) => ({
        technology_id: t.technology_id,
        usage_description: (t as any).usage_description,
      }))
    );
    onProjectUpdated(data as Project);
    onClose();
  };

  const applyImagesUpdate = async (nextImages: string[]) => {
    const { data, error } = await ProjectService.supabase
      .from("projects")
      .update({
        detailed_description: {
          ...(project.detailed_description || {}),
          images: nextImages,
        },
      })
      .eq("id", project.id)
      .select()
      .single();
    if (error) throw error;
    setImages(nextImages);
    onProjectUpdated(data as Project);
  };

  const handleAddScreenshots = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsWorking(true);
    try {
      const uploaded = await StorageService.uploadManyPublic(
        "project-media",
        Array.from(files),
        "screenshots"
      );
      if (uploaded.length > 0) {
        await applyImagesUpdate([...(images || []), ...uploaded]);
      }
    } finally {
      setIsWorking(false);
    }
  };

  const handleDeleteScreenshot = async (url: string) => {
    setIsWorking(true);
    try {
      await StorageService.deletePublicUrl(url);
      const next = (images || []).filter((u) => u !== url);
      await applyImagesUpdate(next);
    } finally {
      setIsWorking(false);
    }
  };

  const handleReplaceThumbnail = async (fileList: FileList | null) => {
    if (!fileList || !fileList[0]) return;
    setIsWorking(true);
    try {
      const file = fileList[0];
      const newUrl = await StorageService.uploadPublic(
        "project-media",
        file,
        "thumbnails"
      );
      if (!newUrl) return;
      // delete old thumb if it was a public URL
      if (
        currentThumb &&
        (currentThumb.startsWith("http://") ||
          currentThumb.startsWith("https://"))
      ) {
        await StorageService.deletePublicUrl(currentThumb);
      }
      const { data, error } = await ProjectService.supabase
        .from("projects")
        .update({
          detailed_description: {
            ...(project.detailed_description || {}),
            thumbnail: newUrl,
          },
        })
        .eq("id", project.id)
        .select()
        .single();
      if (error) throw error;
      onProjectUpdated(data as Project);
    } finally {
      setIsWorking(false);
    }
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
            onClick={onClose}
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
                  프로젝트 편집
                </h2>
                <ActionButton
                  icon={XMarkIcon}
                  iconOnly
                  aria-label="닫기"
                  onClick={onClose}
                />
              </div>

              {/* 폼 */}
              <ProjectForm
                mode="edit"
                initialData={project}
                initialTechnologies={(project.technologies || []).map((t) => ({
                  technology_id: t.id,
                }))}
                onCancel={onClose}
                onSubmit={handleSubmit}
              />

              {/* 스크린샷 관리 */}
              <div className="px-6 pb-6">
                {/* 썸네일 교체 */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      대표 썸네일
                    </h3>
                    <ActionButton
                      text="교체"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = (e: any) =>
                          handleReplaceThumbnail(e.target.files);
                        input.click();
                      }}
                      disabled={isWorking}
                    />
                  </div>
                  <div className="rounded-lg border p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    {currentThumb ? (
                      <img
                        src={currentThumb}
                        alt="thumbnail"
                        className="w-full max-h-48 object-cover rounded"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        등록된 썸네일이 없습니다.
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      스크린샷 관리
                    </h3>
                    <ActionButton
                      text="이미지 추가"
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.multiple = true;
                        input.accept = "image/*";
                        input.onchange = (e: any) =>
                          handleAddScreenshots(e.target.files);
                        input.click();
                      }}
                      disabled={isWorking}
                    />
                  </div>
                  {!images || images.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      등록된 이미지가 없습니다.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {images.map((src) => (
                        <div key={src} className="relative group">
                          <img
                            src={src}
                            alt="screenshot"
                            className="w-full h-32 object-cover rounded-lg border dark:border-gray-600"
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ActionButton
                              size="sm"
                              variant="danger"
                              text="삭제"
                              disabled={isWorking}
                              onClick={() => handleDeleteScreenshot(src)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
