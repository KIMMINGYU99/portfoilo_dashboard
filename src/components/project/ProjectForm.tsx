import React, { useEffect, useMemo, useState } from "react";
import ActionButton from "@components/common/ActionButton";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Project, Technology } from "../../services/supabase";
import { ProjectService } from "../../services/projectService";
import { StorageService } from "../../services/storageService";

type ProjectFormMode = "create" | "edit";

export interface ProjectFormValues {
  title: string;
  description?: string;
  status: Project["status"];
  github_url?: string;
  demo_url?: string;
  start_date?: string;
  end_date?: string;
  role?: string; // detailed_description.role 로 저장
  markdown?: string; // detailed_description.markdown 로 저장
  technologies?: Array<{
    technology_id: string;
    // proficiency removed
  }>;
}

interface ProjectFormProps {
  mode: ProjectFormMode;
  initialData?: Partial<Project>;
  onSubmit: (values: ProjectFormValues) => Promise<void> | void;
  onCancel: () => void;
  initialTechnologies?: Array<{
    technology_id: string;
  }>;
}

const schema = z
  .object({
    title: z.string().min(1, "프로젝트 제목을 입력해주세요").max(200),
    description: z.string().optional(),
    status: z.enum(["planned", "in_progress", "completed", "on_hold"]),
    github_url: z
      .string()
      .url("올바른 URL 형식이 아닙니다")
      .optional()
      .or(z.literal("")),
    demo_url: z
      .string()
      .url("올바른 URL 형식이 아닙니다")
      .optional()
      .or(z.literal("")),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    role: z.string().optional(),
    markdown: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return new Date(data.end_date) >= new Date(data.start_date);
      }
      return true;
    },
    { message: "종료일은 시작일 이후여야 합니다", path: ["end_date"] }
  );

export const ProjectForm: React.FC<ProjectFormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  initialTechnologies,
}) => {
  const defaults: ProjectFormValues = useMemo(
    () => ({
      title: initialData?.title || "",
      description: initialData?.description || "",
      status: (initialData?.status as ProjectFormValues["status"]) || "planned",
      github_url: initialData?.github_url || "",
      demo_url: initialData?.demo_url || "",
      start_date: initialData?.start_date || "",
      end_date: initialData?.end_date || "",
      role:
        (initialData?.detailed_description as any)?.role ||
        (initialData as any)?.role ||
        "",
      markdown: (initialData?.detailed_description as any)?.markdown || "",
    }),
    [initialData]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
    mode: "onChange",
  });

  // 한글 IME 조합 처리 (검색과 동일한 UX 일관성)
  // IME 조합 상태가 실제 로직에 사용되지 않으므로 주석처리
  // const [isComposingTitle, setIsComposingTitle] = useState(false);

  // 기술 스택 로드 & 선택 상태
  const [techOptions, setTechOptions] = useState<Technology[]>([]);
  const [selectedTech, setSelectedTech] = useState<Record<string, number>>({});
  const [techDesc, setTechDesc] = useState<Record<string, string>>({});
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);

  useEffect(() => {
    ProjectService.getAllTechnologies().then(setTechOptions);
  }, []);

  useEffect(() => {
    if (!initialTechnologies || initialTechnologies.length === 0) return;
    const map: Record<string, number> = {};
    initialTechnologies.forEach((t) => {
      map[t.technology_id] = 1;
    });
    setSelectedTech(map);
  }, [initialTechnologies]);

  const submitHandler = async (values: ProjectFormValues) => {
    await onSubmit(values);
  };

  const statusOptions: Array<{ value: Project["status"]; label: string }> = [
    { value: "planned", label: "계획중" },
    { value: "in_progress", label: "진행중" },
    { value: "completed", label: "완료" },
    { value: "on_hold", label: "보류" },
  ];

  // priority removed

  const startDate = watch("start_date");

  return (
    <form
      onSubmit={handleSubmit(async (vals) => {
        let thumbnailUrl: string | undefined = undefined;
        if (thumbnailFile) {
          const url = await StorageService.uploadPublic(
            "project-media",
            thumbnailFile,
            "thumbnails"
          );
          if (url) thumbnailUrl = url;
        }
        let imageUrls: string[] | undefined = undefined;
        if (screenshotFiles.length > 0) {
          imageUrls = await StorageService.uploadManyPublic(
            "project-media",
            screenshotFiles,
            "screenshots"
          );
        }
        const technologies = Object.entries(selectedTech)
          .filter(([_, level]) => level > 0)
          .map(([technology_id]) => ({
            technology_id,
            usage_description: techDesc[technology_id],
          }));
        const next = { ...vals, technologies } as ProjectFormValues & {
          thumbnail_url?: string;
          image_urls?: string[];
        };
        if (thumbnailUrl) (next as any).thumbnail_url = thumbnailUrl;
        if (imageUrls && imageUrls.length > 0)
          (next as any).image_urls = imageUrls;
        return submitHandler(next as any);
      })}
      className="p-6 space-y-6"
    >
      {/* 제목 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          프로젝트 제목 *
        </label>
        <input
          type="text"
          {...register("title")}
          // onCompositionStart={() => setIsComposingTitle(true)}
          // onCompositionEnd={(e) => {
          //   setIsComposingTitle(false);
          //   setValue("title", (e.target as HTMLInputElement).value, {
          //     shouldValidate: true,
          //     shouldDirty: true,
          //   });
          // }}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
            errors.title
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-600"
          }`}
          placeholder="프로젝트 제목을 입력하세요"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* 설명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          프로젝트 설명
        </label>
        <textarea
          rows={4}
          {...register("description")}
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
          placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
        />
      </div>

      {/* 상태 */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            프로젝트 상태
          </label>
          <select
            {...register("status")}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 역할 (detailed_description.role) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          담당 역할
        </label>
        <input
          type="text"
          {...register("role")}
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
          placeholder="예: Frontend Developer"
        />
      </div>

      {/* 상세 설명 (Markdown) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          상세 설명 (Markdown)
        </label>
        <textarea
          rows={10}
          {...register("markdown")}
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
          placeholder="여기에 마크다운으로 상세 설명을 입력하세요"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          코드 블록은 ```lang 문법을 사용하세요.
        </p>
      </div>

      {/* 기술 스택 선택 (숙련도 제거) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          기술 스택
        </label>
        {techOptions.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            등록된 기술이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {techOptions.map((t) => {
              const checked = t.id in selectedTech;
              return (
                <div
                  key={t.id}
                  className="p-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                >
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        setSelectedTech((prev) => {
                          const next = { ...prev };
                          if (e.target.checked) {
                            next[t.id] = 1; // presence only
                          } else {
                            delete next[t.id];
                          }
                          return next;
                        });
                      }}
                    />
                    <span className="text-sm font-medium">{t.name}</span>
                  </label>
                  {checked && (
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="이 프로젝트에서의 사용 목적/범위 (선택)"
                        className="w-full px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                        value={techDesc[t.id] || ""}
                        onChange={(e) =>
                          setTechDesc((prev) => ({
                            ...prev,
                            [t.id]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 날짜 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            시작일
          </label>
          <input
            type="date"
            {...register("start_date")}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            종료일
          </label>
          <input
            type="date"
            {...register("end_date")}
            min={startDate || undefined}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
              errors.end_date
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
          />
          {errors.end_date && (
            <p className="mt-1 text-sm text-red-600">
              {errors.end_date.message}
            </p>
          )}
        </div>
      </div>

      {/* 링크 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            GitHub 링크
          </label>
          <input
            type="url"
            {...register("github_url")}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
              errors.github_url
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
            placeholder="https://github.com/username/repo"
          />
          {errors.github_url && (
            <p className="mt-1 text-sm text-red-600">
              {errors.github_url.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            데모 링크
          </label>
          <input
            type="url"
            {...register("demo_url")}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
              errors.demo_url
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
            placeholder="https://your-demo.vercel.app"
          />
          {errors.demo_url && (
            <p className="mt-1 text-sm text-red-600">
              {errors.demo_url.message}
            </p>
          )}
        </div>
      </div>

      {/* 썸네일 업로드 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          썸네일 업로드 (선택)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-gray-700 dark:file:text-gray-100 dark:hover:file:bg-gray-600"
        />
      </div>

      {/* 스크린샷 업로드 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          스크린샷 업로드 (여러 장 선택 가능)
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setScreenshotFiles(Array.from(e.target.files || []))}
          className="block w-full text-sm text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-gray-700 dark:file:text-gray-100 dark:hover:file:bg-gray-600"
        />
      </div>

      {/* 액션 */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <ActionButton
          type="button"
          text="취소"
          variant="outline"
          size="md"
          onClick={onCancel}
        />
        <ActionButton
          type="submit"
          text={
            mode === "create"
              ? isSubmitting
                ? "추가 중..."
                : "프로젝트 추가"
              : isSubmitting
              ? "수정 중..."
              : "프로젝트 수정"
          }
          variant="primary"
          size="md"
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
};

export default ProjectForm;
