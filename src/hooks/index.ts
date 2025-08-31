// 데이터 관리 훅들
export { useProjects, type ProjectWithTechnologies } from "./useProjects";
export { useTechnologies } from "./useTechnologies";
export { useEvents } from "./useEvents";

// UI 상태 관리 훅들
export { useModal, useModals } from "./useModal";
export {
  useLoading,
  useMultipleLoading,
  useGlobalLoading,
  useGlobalLoadingKey,
} from "./useLoading";

// 검색 및 필터링 훅들
export { useSearch, useAdvancedSearch } from "./useSearch";
export {
  useFilter,
  useFilterAndSearch,
  createStatusFilter,
  createCategoryFilter,
  createDateRangeFilter,
} from "./useFilter";

// 사용 예시:
/*
// 프로젝트 데이터 관리
const { projects, loading, addProject, updateProject, deleteProject } = useProjects();

// 모달 상태 관리
const addModal = useModal();
const editModal = useModal<Project>();

// 검색 및 필터링
const { searchTerm, setSearchTerm, filteredData } = useSearch(projects, {
  searchFields: ['title', 'description']
});

const { filters, setFilter, filteredData } = useFilter(projects, {
  status: createStatusFilter(['completed', 'in_progress', 'planned']),
  category: createCategoryFilter(['frontend', 'backend', 'mobile'])
});

// 로딩 상태 관리
const { loading, withLoading } = useLoading();
const result = await withLoading(() => fetchData());
*/
