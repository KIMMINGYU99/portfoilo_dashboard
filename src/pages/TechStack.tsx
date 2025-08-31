import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
// import { ProjectService } from "../services/projectService";
import { Technology } from "../services/supabase";
import {
  CodeBracketIcon,
  ServerIcon,
  CircleStackIcon,
  DevicePhoneMobileIcon,
  CloudIcon,
  CpuChipIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PaintBrushIcon,
} from "@heroicons/react/24/outline";
import PageHeader from "../components/common/PageHeader";
import ActionButton from "@components/common/ActionButton";
// import toast from "react-hot-toast";
import AddTechnologyModal from "../components/modals/AddTechnologyModal";
import EditTechnologyModal from "../components/modals/EditTechnologyModal";

// 카테고리별 대표 색상 및 한글 이름 정의
const categoryConfig: Record<
  string,
  {
    bg: string;
    text: string;
    border: string;
    gradient: string;
    icon: string;
    primary: string;
    label: string;
    IconComponent: React.ComponentType<{ className?: string }>;
  }
> = {
  frontend: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    gradient: "from-blue-50 to-blue-100",
    icon: "text-blue-600",
    primary: "#3B82F6",
    label: "Frontend",
    IconComponent: DevicePhoneMobileIcon,
  },
  backend: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    gradient: "from-green-50 to-green-100",
    icon: "text-green-600",
    primary: "#10B981",
    label: "Backend",
    IconComponent: ServerIcon,
  },
  database: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    gradient: "from-purple-50 to-purple-100",
    icon: "text-purple-600",
    primary: "#8B5CF6",
    label: "Database",
    IconComponent: CircleStackIcon,
  },
  devops: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    gradient: "from-orange-50 to-orange-100",
    icon: "text-orange-600",
    primary: "#F97316",
    label: "DevOps",
    IconComponent: CloudIcon,
  },
  mobile: {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
    gradient: "from-cyan-50 to-cyan-100",
    icon: "text-cyan-600",
    primary: "#06B6D4",
    label: "Mobile",
    IconComponent: DevicePhoneMobileIcon,
  },
  design: {
    bg: "bg-pink-50",
    text: "text-pink-700",
    border: "border-pink-200",
    gradient: "from-pink-50 to-pink-100",
    icon: "text-pink-600",
    primary: "#EC4899",
    label: "Design",
    IconComponent: PaintBrushIcon,
  },
};

import LoadingView from "@components/common/LoadingView";
import ErrorView from "@components/common/ErrorView";
import { useTechnologies } from "@hooks/useTechnologies";

const TechStack: React.FC = () => {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<"name" | "created_at" | "category">(
    "name"
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState<Technology | null>(null);

  const normalizeCategory = (cat?: string | null) =>
    (cat || "").trim().toLowerCase();

  const {
    technologies: qTechs,
    loading: qLoading,
    error: qError,
    refetch,
  } = useTechnologies();
  useEffect(() => {
    setTechnologies(qTechs);
    setLoading(qLoading);
  }, [qTechs, qLoading]);

  // 사용 가능한 카테고리들 (실제 데이터에 있는 것만, 정규화)
  const availableCategories = [
    "전체",
    ...Array.from(
      new Set(
        technologies
          .map((tech) => normalizeCategory(tech.category))
          .filter((v) => !!v)
      )
    ).map((cat) => categoryConfig[cat as string]?.label || cat),
  ];

  const filteredTechnologies = technologies.filter((tech) => {
    const matchesCategory =
      selectedCategory === "전체" ||
      categoryConfig[normalizeCategory(tech.category)]?.label ===
        selectedCategory;
    const matchesSearch = tech.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedTechnologies = [...filteredTechnologies].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortBy === "name") {
      return a.name.localeCompare(b.name) * dir;
    }
    if (sortBy === "category") {
      const ca = categoryConfig[normalizeCategory(a.category)]?.label || "";
      const cb = categoryConfig[normalizeCategory(b.category)]?.label || "";
      const cmp = ca.localeCompare(cb);
      if (cmp !== 0) return cmp * dir;
      return a.name.localeCompare(b.name) * dir;
    }
    // created_at
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    if (ta === tb) return a.name.localeCompare(b.name) * dir;
    return (ta - tb) * dir;
  });

  const getCategoryIcon = (category: string, className: string = "h-5 w-5") => {
    const key = normalizeCategory(category);
    const config = categoryConfig[key];
    if (!config) {
      return <CpuChipIcon className={className} />;
    }
    const IconComponent = config.IconComponent;
    return <IconComponent className={className} />;
  };

  const getCategoryColor = (category: string) => {
    const key = normalizeCategory(category);
    return (
      categoryConfig[key] || {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
        gradient: "from-gray-50 to-gray-100",
        icon: "text-gray-600",
        primary: "#6B7280",
        label: "기타",
        IconComponent: CpuChipIcon,
      }
    );
  };

  if (qLoading) {
    return <LoadingView message="기술 스택을 불러오는 중..." />;
  }

  if (qError) {
    return <ErrorView message={qError} onRetry={refetch} fullScreen />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8"
    >
      <div className="max-w-7xl mx-auto">
        <PageHeader
          pageIcon={CodeBracketIcon}
          pageName="기술 스택"
          title="기술 스택"
          description="프로젝트에서 사용하는 다양한 기술들과 도구들을 체계적으로 관리하세요"
          actionButton={{
            icon: PlusIcon,
            text: "새 기술 추가",
            onClick: () => setAddOpen(true),
          }}
        >
          {/* Search */}
          <div className="mb-8 lg:mb-10">
            <div className="relative w-full">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="기술 스택 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="기술 스택 검색"
                inputMode="search"
                className="w-full pl-14 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:shadow-md transition-all duration-200 text-gray-900 placeholder-gray-500 text-sm sm:text-base"
              />
            </div>
          </div>
        </PageHeader>

        {/* Category Filter Buttons + Sort Controls */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-4 lg:mb-6">
          {availableCategories.map((category, index) => {
            const isSelected = selectedCategory === category;
            const isAll = category === "전체";
            const originalCategory = isAll
              ? ""
              : Object.keys(categoryConfig).find(
                  (key) => categoryConfig[key].label === category
                ) || "";
            const colors = isAll
              ? {
                  bg: "bg-gray-50",
                  text: "text-gray-700",
                  border: "border-gray-200",
                }
              : getCategoryColor(originalCategory);

            return (
              <motion.button
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => setSelectedCategory(category as string)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 transform hover:scale-105 ${
                  isSelected
                    ? `${colors.bg} ${colors.text} ${colors.border} border-2 shadow-md`
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {!isAll &&
                  getCategoryIcon(
                    originalCategory,
                    `w-4 h-4 ${
                      isSelected && "icon" in colors
                        ? colors.icon
                        : "text-gray-500"
                    }`
                  )}
                <span className="text-sm">
                  {category}
                  {!isAll && (
                    <span className="ml-1.5 text-xs opacity-75">
                      {
                        technologies.filter((t) => {
                          const techCategory = normalizeCategory(t.category);
                          return (
                            techCategory &&
                            categoryConfig[techCategory]?.label === category
                          );
                        }).length
                      }
                    </span>
                  )}
                  {isAll && (
                    <span className="ml-1.5 text-xs opacity-75">
                      {technologies.length}
                    </span>
                  )}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-end gap-2 mb-8 lg:mb-10">
          <select
            className="px-3 py-2 border rounded-lg text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            aria-label="정렬 기준"
          >
            <option value="name">이름</option>
            <option value="created_at">생성일</option>
            <option value="category">카테고리</option>
          </select>
          <ActionButton
            text={sortDir === "asc" ? "오름차순" : "내림차순"}
            size="sm"
            variant="outline"
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            aria-label="정렬 방향"
          />
        </div>

        {/* Technologies Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {sortedTechnologies.map((tech, index) => {
              const colors = getCategoryColor(tech.category || "");

              return (
                <motion.div
                  key={tech.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary-300 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  <div className="p-6">
                    {/* Category Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} ${colors.border} border`}
                      >
                        {getCategoryIcon(
                          tech.category || "",
                          `w-3 h-3 ${colors.icon}`
                        )}
                        {colors.label}
                      </span>
                      <div
                        className="w-4 h-4 rounded-full shadow-sm border-2 border-white group-hover:scale-110 transition-transform duration-200"
                        style={{
                          backgroundColor: tech.color || colors.primary,
                        }}
                      />
                    </div>

                    {/* Tech Name */}
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 transition-colors mb-2">
                        {tech.name}
                      </h3>
                      <div className="flex justify-center mb-2">
                        <ActionButton
                          text="편집"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTech(tech);
                            setEditOpen(true);
                          }}
                        />
                      </div>
                      {tech.icon_url && (
                        <div className="flex justify-center">
                          <img
                            src={tech.icon_url}
                            alt={tech.name}
                            className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Date */}
                    <div className="text-center">
                      <div className="text-xs text-gray-500 font-medium">
                        {tech.created_at &&
                          new Date(tech.created_at).toLocaleDateString(
                            "ko-KR",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredTechnologies.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 lg:py-20"
          >
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 lg:p-12 max-w-md mx-auto">
              <div className="p-4 bg-white rounded-xl shadow-sm mb-6 inline-block">
                <CpuChipIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchTerm ? "검색 결과가 없습니다" : "기술 스택이 없습니다"}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {searchTerm
                  ? `"${searchTerm}"에 대한 검색 결과를 찾을 수 없습니다.`
                  : selectedCategory === "전체"
                  ? "아직 등록된 기술 스택이 없습니다. 새로운 기술을 추가해보세요."
                  : `${selectedCategory} 카테고리에 등록된 기술이 없습니다.`}
              </p>
              {!searchTerm && (
                <div className="inline-flex">
                  <ActionButton
                    icon={PlusIcon}
                    text="첫 번째 기술 추가하기"
                    variant="primary"
                    size="md"
                    onClick={() => setAddOpen(true)}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
      <AddTechnologyModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={async () => {
          await refetch();
        }}
      />
      <EditTechnologyModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        technology={selectedTech}
        onUpdated={async () => {
          await refetch();
        }}
        onDeleted={async () => {
          await refetch();
        }}
      />
    </motion.div>
  );
};

export default TechStack;
