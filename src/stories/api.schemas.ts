export type ApiParam = {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
};

export type ApiMethod = {
  name: string;
  description?: string;
  params?: ApiParam[];
  returns?: string;
  example?: string;
  responseExample?: unknown;
  notes?: string[];
};

export type ApiService = {
  name: string;
  module: string;
  methods: ApiMethod[];
};

const sampleUser = {
  id: '9b2c5f4a-1234-4cde-81ab-1234567890ab',
  email: 'developer@example.com',
  name: '홍길동',
  avatar_url: null,
  bio: 'Frontend developer',
  social_links: { github: 'https://github.com/you' },
  skills: [{ name: 'React', level: 5, years: 4 }],
  career: [{ title: 'Frontend', company: 'Acme', period: '2023-', description: 'Building dashboards', type: 'full-time' }],
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-02T00:00:00.000Z',
};

const sampleTechnology = { id: 'tech-1', name: 'React', category: 'frontend', color: '#61dafb', created_at: '2024-01-01T00:00:00.000Z' };

const sampleProject = {
  id: 'proj-1',
  user_id: sampleUser.id,
  title: 'Project Dashboard',
  description: '프로젝트 관리 대시보드',
  detailed_description: { sections: [] },
  status: 'in_progress',
  github_url: 'https://github.com/you/project',
  demo_url: 'https://example.com',
  images: [],
  features: ['Auth', 'Charts'],
  challenges: ['RLS', 'Caching'],
  achievements: { stability: '99.9%' },
  lessons_learned: 'Zustand for state',
  future_plans: 'Edge functions',
  template_version: '1.0.0',
  start_date: '2024-05-01',
  end_date: null,
  created_at: '2024-05-01T00:00:00.000Z',
  updated_at: '2024-06-01T00:00:00.000Z',
};

const sampleSchedule = {
  id: 'sch-1',
  project_id: 'proj-1',
  title: 'Kickoff',
  description: 'Initial meeting',
  type: 'meeting',
  start_time: '2025-08-01T09:00:00.000Z',
  end_time: '2025-08-01T10:00:00.000Z',
  all_day: false,
  status: 'completed',
  created_at: '2025-08-01T08:00:00.000Z',
};

const samplePost = {
  id: 'post-1', user_id: sampleUser.id, title: '첫 글', content: '내용', status: 'published', tags: ['supabase'], slug: 'first-post', url: '/blog/first-post', published_at: '2025-01-01T00:00:00.000Z', created_at: '2024-12-31T00:00:00.000Z', updated_at: '2025-01-01T00:00:00.000Z'
};

const sampleReview = {
  id: 'rev-1', project_id: 'proj-1', reviewer_name: 'Alice', reviewer_role: 'PM', review_type: 'general', rating: 5, title: 'Great', content: 'Nice work', strengths: ['UX'], improvements: ['Tests'], technical_feedback: { coverage: '80%' }, is_public: true, is_featured: false, created_at: '2025-01-02T00:00:00.000Z', updated_at: '2025-01-02T00:00:00.000Z'
};

export const apiServices: ApiService[] = [
  {
    name: 'UserService',
    module: 'src/services/userService.ts',
    methods: [
      { name: 'getAllUsers', description: '모든 사용자 조회', returns: 'Promise<User[]>', responseExample: [sampleUser] },
      { name: 'getUser', description: '특정 사용자 조회', params: [{ name: 'id', type: 'string', required: true }], returns: 'Promise<User | null>', responseExample: sampleUser },
      { name: 'getUserByEmail', description: '이메일로 사용자 조회', params: [{ name: 'email', type: 'string', required: true }], returns: 'Promise<User | null>', responseExample: sampleUser },
      { name: 'getDefaultUser', description: '기본 사용자 조회', returns: 'Promise<User | null>', responseExample: sampleUser },
      { name: 'createUser', description: '사용자 생성', params: [{ name: 'userData', type: "Omit<User, 'id' | 'created_at' | 'updated_at'>", required: true }], returns: 'Promise<User | null>', responseExample: sampleUser },
      { name: 'updateUser', description: '사용자 업데이트', params: [{ name: 'id', type: 'string', required: true }, { name: 'userData', type: 'Partial<User>', required: true }], returns: 'Promise<User | null>', responseExample: { ...sampleUser, name: '홍길동 수정' } },
      { name: 'deleteUser', description: '사용자 삭제', params: [{ name: 'id', type: 'string', required: true }], returns: 'Promise<boolean>', responseExample: true },
    ],
  },
  {
    name: 'ProjectService',
    module: 'src/services/projectService.ts',
    methods: [
      { name: 'getAllProjects', description: '모든 프로젝트 조회', returns: 'Promise<Project[]>', responseExample: [sampleProject] },
      { name: 'getProject', description: '프로젝트 단건 조회', params: [{ name: 'id', type: 'string', required: true }], returns: 'Promise<Project | null>', responseExample: sampleProject },
      { name: 'createProject', description: '프로젝트 생성', params: [{ name: 'projectData', type: 'Partial<Project>', required: true }], returns: 'Promise<Project | null>', responseExample: sampleProject },
      { name: 'updateProject', description: '프로젝트 업데이트', params: [{ name: 'id', type: 'string', required: true }, { name: 'projectData', type: 'Partial<Project>', required: true }], returns: 'Promise<Project | null>', responseExample: { ...sampleProject, title: 'Project Dashboard v2' } },
      { name: 'deleteProject', description: '프로젝트 삭제', params: [{ name: 'id', type: 'string', required: true }], returns: 'Promise<boolean>', responseExample: true },
      { name: 'getProjectTechnologies', description: '프로젝트의 기술 목록', params: [{ name: 'projectId', type: 'string', required: true }], returns: 'Promise<Technology[]>', responseExample: [sampleTechnology] },
      { name: 'getAllTechnologies', description: '모든 기술 조회', returns: 'Promise<Technology[]>', responseExample: [sampleTechnology] },
      { name: 'createTechnology', description: '기술 생성', params: [{ name: 'payload', type: 'Partial<Technology>', required: true }], returns: 'Promise<Technology | null>', responseExample: sampleTechnology },
      { name: 'updateTechnology', description: '기술 업데이트', params: [{ name: 'id', type: 'string', required: true }, { name: 'payload', type: 'Partial<Technology>', required: true }], returns: 'Promise<Technology | null>', responseExample: { ...sampleTechnology, color: '#000000' } },
      { name: 'deleteTechnology', description: '기술 삭제', params: [{ name: 'id', type: 'string', required: true }], returns: 'Promise<boolean>', responseExample: true },
      { name: 'addProjectTechnology', description: '프로젝트에 기술 추가', params: [{ name: 'projectId', type: 'string', required: true }, { name: 'technologyId', type: 'string', required: true }, { name: 'usageDescription', type: 'string', required: false }], returns: 'Promise<boolean>', responseExample: true },
      { name: 'setProjectTechnologies', description: '프로젝트 기술 일괄 설정', params: [{ name: 'projectId', type: 'string', required: true }, { name: 'selections', type: '{ technology_id: string; usage_description?: string }[]', required: true }], returns: 'Promise<boolean>', responseExample: true },
      { name: 'getProjectsWithTechnologies', description: '프로젝트+기술 결합 조회', returns: 'Promise<(Project & { technologies: Technology[] })[]>', responseExample: [{ ...sampleProject, technologies: [sampleTechnology] }] },
      { name: 'getProjectStats', description: '프로젝트 상태 통계', returns: 'Promise<Record<string, number>>', responseExample: { 전체: 10, in_progress: 4, completed: 6 } },
      { name: 'getProjectTemplates', description: '프로젝트 템플릿 조회', returns: 'Promise<ProjectTemplate[]>' },
    ],
  },
  {
    name: 'CalendarService',
    module: 'src/services/calendarService.ts',
    methods: [
      { name: 'getAllEvents', description: '모든 이벤트 조회', returns: 'Promise<ProjectSchedule[]>', responseExample: [sampleSchedule] },
      { name: 'getEventsByDateRange', description: '기간별 이벤트 조회', params: [{ name: 'startDate', type: 'string(ISO)', required: true }, { name: 'endDate', type: 'string(ISO)', required: true }], returns: 'Promise<ProjectSchedule[]>', responseExample: [sampleSchedule] },
      { name: 'getEventsByMonth', description: '월별 이벤트 조회', params: [{ name: 'year', type: 'number', required: true }, { name: 'month', type: 'number', required: true }], returns: 'Promise<ProjectSchedule[]>', responseExample: [sampleSchedule] },
      { name: 'getEvent', description: '이벤트 단건 조회', params: [{ name: 'id', type: 'string', required: true }], returns: 'Promise<ProjectSchedule | null>', responseExample: sampleSchedule },
      { name: 'createEvent', description: '이벤트 생성', params: [{ name: 'eventData', type: "Omit<ProjectSchedule, 'id' | 'created_at'>", required: true }], returns: 'Promise<ProjectSchedule | null>', responseExample: sampleSchedule },
      { name: 'updateEvent', description: '이벤트 업데이트', params: [{ name: 'id', type: 'string', required: true }, { name: 'eventData', type: 'Partial<ProjectSchedule>', required: true }], returns: 'Promise<ProjectSchedule | null>', responseExample: { ...sampleSchedule, title: 'Kickoff v2' } },
      { name: 'deleteEvent', description: '이벤트 삭제', params: [{ name: 'id', type: 'string', required: true }], returns: 'Promise<boolean>', responseExample: true },
      { name: 'getEventsByProject', description: '프로젝트별 이벤트', params: [{ name: 'projectId', type: 'string', required: true }], returns: 'Promise<ProjectSchedule[]>', responseExample: [sampleSchedule] },
      { name: 'getEventStats', description: '이벤트 타입 통계', returns: 'Promise<Record<string, number>>', responseExample: { 전체: 12, meeting: 5, task: 7 } },
      { name: 'getTodayEvents', description: '오늘의 이벤트', returns: 'Promise<ProjectSchedule[]>', responseExample: [sampleSchedule] },
      { name: 'getWeekEvents', description: '이번 주 이벤트', returns: 'Promise<ProjectSchedule[]>', responseExample: [sampleSchedule] },
    ],
  },
  {
    name: 'BlogService',
    module: 'src/services/blogService.ts',
    methods: [
      { name: 'getAllPosts', description: '모든 포스트 조회', returns: 'Promise<BlogPost[]>', responseExample: [samplePost] },
      { name: 'getPublishedPosts', description: '발행 포스트 조회', returns: 'Promise<BlogPost[]>', responseExample: [samplePost] },
      { name: 'getPost', description: '포스트 단건', params: [{ name: 'id', type: 'string', required: true }], returns: 'Promise<BlogPost | null>', responseExample: samplePost },
      { name: 'getPostBySlug', description: '슬러그로 포스트', params: [{ name: 'slug', type: 'string', required: true }], returns: 'Promise<BlogPost | null>', responseExample: samplePost },
      { name: 'createPost', description: '포스트 생성', params: [{ name: 'postData', type: "Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>", required: true }], returns: 'Promise<BlogPost | null>', responseExample: samplePost },
      { name: 'updatePost', description: '포스트 업데이트', params: [{ name: 'id', type: 'string', required: true }, { name: 'postData', type: 'Partial<BlogPost>', required: true }], returns: 'Promise<BlogPost | null>', responseExample: { ...samplePost, title: '수정된 제목' } },
      { name: 'deletePost', description: '포스트 삭제', params: [{ name: 'id', type: 'string', required: true }], returns: 'Promise<boolean>', responseExample: true },
      { name: 'publishPost', description: '포스트 발행', params: [{ name: 'id', type: 'string', required: true }], returns: 'Promise<BlogPost | null>', responseExample: { ...samplePost, status: 'published' } },
      { name: 'unpublishPost', description: '발행 취소', params: [{ name: 'id', type: 'string', required: true }], returns: 'Promise<BlogPost | null>', responseExample: { ...samplePost, status: 'draft' } },
      { name: 'getPostsByTag', description: '태그 기반 포스트', params: [{ name: 'tag', type: 'string', required: true }], returns: 'Promise<BlogPost[]>', responseExample: [samplePost] },
    ],
  },
  {
    name: 'ReviewService',
    module: 'src/services/reviewService.ts',
    methods: [
      { name: 'getReviewsByProject', description: '프로젝트 리뷰 조회', params: [{ name: 'projectId', type: 'string', required: true }], returns: 'Promise<ProjectReview[]>', responseExample: [sampleReview] },
      { name: 'createReview', description: '리뷰 생성', params: [{ name: 'data', type: "Omit<ProjectReview, 'id' | 'created_at' | 'updated_at'>", required: true }], returns: 'Promise<ProjectReview | null>', responseExample: sampleReview },
      { name: 'getReviewsByProjectPaged', description: '리뷰 페이징 조회', params: [{ name: 'projectId', type: 'string', required: true }, { name: 'options', type: '{ page?: number; limit?: number; sortBy?: "latest" | "rating"; filterType?: "all"|"general"|"code_review"|"design_review"|"user_feedback"; minRating?: number; }', required: false }], returns: 'Promise<{ reviews: ProjectReview[]; total: number }>', responseExample: { reviews: [sampleReview], total: 1 } },
      { name: 'updateReview', description: '리뷰 업데이트', params: [{ name: 'id', type: 'string', required: true }, { name: 'data', type: 'Partial<ProjectReview>', required: true }], returns: 'Promise<ProjectReview | null>', responseExample: { ...sampleReview, rating: 4 } },
      { name: 'deleteReview', description: '리뷰 삭제', params: [{ name: 'id', type: 'string', required: true }], returns: 'Promise<boolean>', responseExample: true },
    ],
  },
  {
    name: 'StorageService',
    module: 'src/services/storageService.ts',
    methods: [
      { name: 'uploadPublic', description: '퍼블릭 업로드', params: [{ name: 'bucket', type: 'string', required: true }, { name: 'file', type: 'File', required: true }, { name: 'pathPrefix', type: 'string', required: false }], returns: 'Promise<string | null>', responseExample: 'https://xyz.supabase.co/storage/v1/object/public/images/1700000000_img.png' },
      { name: 'uploadManyPublic', description: '다중 업로드', params: [{ name: 'bucket', type: 'string', required: true }, { name: 'files', type: 'File[]', required: true }, { name: 'pathPrefix', type: 'string', required: false }], returns: 'Promise<string[]>', responseExample: ['https://.../1.png', 'https://.../2.png'] },
      { name: 'deletePublicUrl', description: '퍼블릭 URL 삭제', params: [{ name: 'url', type: 'string', required: true }], returns: 'Promise<boolean>', responseExample: true },
    ],
  },
];