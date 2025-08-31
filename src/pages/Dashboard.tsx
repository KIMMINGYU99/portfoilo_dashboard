import { motion } from "framer-motion";
import { useState } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import { Project } from "../services/supabase";
import { getProjectThumbnailUrl } from "../utils/media";
import { useNavigate } from "react-router-dom";
import AddProjectModal from "../components/modals/AddProjectModal";
import PageHeader from "../components/common/PageHeader";
import {
  useProjects,
  useFilterAndSearch,
  createStatusFilter,
  useModal,
} from "../hooks";

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-800",
  in_progress: "bg-blue-100 text-blue-800",
  planned: "bg-yellow-100 text-yellow-800",
  on_hold: "bg-gray-100 text-gray-800",
  // 한국어 호환성
  완료: "bg-green-100 text-green-800",
  진행중: "bg-blue-100 text-blue-800",
  계획중: "bg-yellow-100 text-yellow-800",
  보류: "bg-gray-100 text-gray-800",
};

export default function Dashboard() {
  const navigate = useNavigate();
  // 커스텀 훅들 사용
  const { projects, projectStats, loading, addProject } = useProjects();
  const addModal = useModal();
  // 편집은 상세 페이지에서 처리

  // 검색 및 필터링
  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    filteredData: filteredProjects,
  } = useFilterAndSearch(
    projects,
    {
      status: createStatusFilter([
        "completed",
        "in_progress",
        "planned",
        "on_hold",
      ]),
    },
    ["title", "description"]
  );

  const selectedStatus = (filters.status as string) || "전체";

  // 한글 IME 조합 처리: 조합 중에는 onChange 반영을 지연하고, 조합 종료 시 반영
  const [isComposing, setIsComposing] = useState(false);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isComposing) return; // 조합 중엔 무시
    setSearchTerm(value);
  };
  const handleCompositionStart = () => setIsComposing(true);
  const handleCompositionEnd = (
    e: React.CompositionEvent<HTMLInputElement>
  ) => {
    setIsComposing(false);
    const target = e.target as HTMLInputElement;
    setSearchTerm(target.value);
  };

  // 핸들러 함수들
  const handleProjectAdded = async (newProject: Project) => {
    try {
      await addProject(newProject);
      addModal.close();
    } catch (error) {
      // 에러는 커스텀 훅에서 처리됨
    }
  };

  // 카드에서는 편집/삭제를 제공하지 않음 (상세 페이지에서 수행)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container-page"
    >
      <div className="content-max-width">
        <PageHeader
          pageIcon={FolderIcon}
          pageName="프로젝트"
          title="프로젝트 관리"
          description="내 프로젝트들을 관리하고 진행 상황을 추적하세요"
          actionButton={{
            icon: PlusIcon,
            text: "새 프로젝트",
            onClick: () => addModal.open(),
          }}
        >
          {/* 검색 및 필터 */}
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
            {/* 검색바 */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="프로젝트 검색..."
                value={searchTerm}
                onChange={handleSearchChange}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                aria-label="프로젝트 검색"
                inputMode="search"
                className="input-search pl-14 text-sm sm:text-base"
              />
            </div>

            {/* 상태 필터 */}
            <div className="flex items-center gap-3 bg-white dark:bg-gray-900 px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm min-w-[140px]">
              <FunnelIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <select
                value={selectedStatus}
                onChange={(e) =>
                  setFilter(
                    "status",
                    e.target.value === "전체" ? "" : e.target.value
                  )
                }
                className="bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-200 font-medium cursor-pointer text-sm sm:text-base w-full"
              >
                <option value="전체">전체</option>
                <option value="completed">완료</option>
                <option value="in_progress">진행중</option>
                <option value="planned">계획중</option>
                <option value="on_hold">보류</option>
              </select>
            </div>
          </div>
        </PageHeader>

        {/* 프로젝트 통계 */}
        <div className="grid-stats section-spacing">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="card-gradient p-4 sm:p-5 lg:p-6 hover-glow"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {loading ? "..." : projectStats["전체"] || 0}
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  전체 프로젝트
                </div>
              </div>
              <div className="p-2 sm:p-3 bg-gray-100 rounded-lg sm:rounded-xl">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-gradient-blue p-6 rounded-2xl border border-blue-200 card-base hover-glow"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {loading ? "..." : projectStats["in_progress"] || 0}
                </div>
                <div className="text-sm font-medium text-blue-700">진행중</div>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-gradient-green p-6 rounded-2xl border border-green-200 card-base hover-glow"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {loading ? "..." : projectStats["completed"] || 0}
                </div>
                <div className="text-sm font-medium text-green-700">완료</div>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-gradient-orange p-6 rounded-2xl border border-yellow-200 card-base hover-glow"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-yellow-600 mb-1">
                  {loading ? "..." : projectStats["planned"] || 0}
                </div>
                <div className="text-sm font-medium text-yellow-700">
                  계획중
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="flex-center py-12">
            <div className="spinner"></div>
            <span className="ml-2 text-gray-600">
              프로젝트 데이터를 불러오는 중...
            </span>
          </div>
        )}

        {/* 프로젝트 목록 */}
        {!loading && (
          <div className="grid-projects">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group card-interactive"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                {/* 카드 이미지 (썸네일) */}
                {(() => {
                  const url = getProjectThumbnailUrl(
                    (project as any).detailed_description || {}
                  );
                  return url ? (
                    <div className="h-40 sm:h-48 bg-gray-100 rounded-t-xl overflow-hidden">
                      <img
                        src={url}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  ) : null;
                })()}

                {/* 카드 컨텐츠 */}
                <div className="p-4 sm:p-5 lg:p-6">
                  {/* 프로젝트 헤더 */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    <span
                      className={`status-badge flex-shrink-0 ml-2 ${
                        statusColors[project.status]
                      }`}
                    >
                      {project.status === "completed"
                        ? "완료"
                        : project.status === "in_progress"
                        ? "진행중"
                        : project.status === "planned"
                        ? "계획중"
                        : project.status === "on_hold"
                        ? "보류"
                        : project.status}
                    </span>
                  </div>

                  {/* 프로젝트 설명 */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>

                  {/* 역할 정보 */}
                  {project.detailed_description?.role && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        담당 역할
                      </div>
                      <span className="inline-block px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-medium rounded-full">
                        {project.detailed_description.role}
                      </span>
                    </div>
                  )}

                  {/* 기술 스택 */}
                  <div className="mb-6">
                    <div className="text-sm font-medium text-gray-700 mb-3">
                      기술 스택
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.slice(0, 4).map((tech) => (
                        <span
                          key={tech.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 hover:scale-105"
                          style={{
                            backgroundColor: tech.color
                              ? `${tech.color}15`
                              : "#f3f4f6",
                            borderColor: tech.color
                              ? `${tech.color}40`
                              : "#e5e7eb",
                            color: tech.color || "#374151",
                          }}
                        >
                          {tech.name}
                        </span>
                      ))}
                      {project.technologies.length > 4 && (
                        <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full border border-gray-200">
                          +{project.technologies.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 프로젝트 메타 정보 */}
                  <div className="space-y-3">
                    {/* 날짜 정보 */}
                    <div className="flex items-center text-sm text-gray-500">
                      <svg
                        className="w-4 h-4 mr-2 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>
                        {project.start_date && project.end_date
                          ? `${project.start_date} ~ ${project.end_date}`
                          : project.start_date
                          ? `${project.start_date} ~`
                          : "날짜 미정"}
                      </span>
                    </div>

                    {/* GitHub/Demo 링크 */}
                    {(project.github_url || project.demo_url) && (
                      <div className="flex gap-3">
                        {project.github_url && (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium rounded-lg transition-colors"
                          >
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                            </svg>
                            GitHub
                          </a>
                        )}
                        {project.demo_url && (
                          <a
                            href={project.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg transition-colors"
                          >
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                            Demo
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 카드 액션 버튼 제거: 상세 페이지에서 편집/삭제 제공 */}
              </motion.div>
            ))}
          </div>
        )}

        {/* 빈 상태 */}
        {!loading && filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              다른 검색어를 시도해보세요.
            </p>
          </div>
        )}
      </div>

      {/* 새 프로젝트 추가 모달 */}
      <AddProjectModal
        isOpen={addModal.isOpen}
        onClose={addModal.close}
        onProjectAdded={handleProjectAdded}
      />

      {/* 프로젝트 편집은 상세 페이지에서 처리합니다 */}
    </motion.div>
  );
}
