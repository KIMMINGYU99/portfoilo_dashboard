import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DocumentTextIcon,
  CalendarIcon,
  TagIcon,
  ClockIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";
import PageHeader from "../components/common/PageHeader";
import ActionButton from "@components/common/ActionButton";
import toast from "react-hot-toast";
import { BlogService } from "../services/blogService";
import type { BlogPost as SupaBlogPost } from "../services/supabase";
import BlogEditorModal from "../components/modals/BlogEditorModal";

// Blog Post 타입 정의
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: "published" | "draft";
  featured_image_url?: string;
  tags: string[];
  category?: string;
  views?: number;
  likes?: number;
  comments?: number;
  url?: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [blogStats, setBlogStats] = useState<Record<string, number>>({});
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<SupaBlogPost | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "draft"
  >("all");
  const [sortBy, setSortBy] = useState<"latest" | "views" | "likes">("latest");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        setLoading(true);
        const supaPosts =
          (await BlogService.getPublishedPosts()) as SupaBlogPost[];

        // excerpt가 없을 수 있으므로 content 앞부분으로 대체
        const normalized: BlogPost[] = (supaPosts || []).map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          excerpt: (p as any).excerpt || (p.content || "").slice(0, 140),
          content: p.content || "",
          status: (p.status === "archived" ? "draft" : p.status) as
            | "published"
            | "draft",
          featured_image_url: (p as any).featured_image_url,
          tags: p.tags || [],
          category: (p as any).category,
          views: (p as any).views || 0,
          likes: (p as any).likes || 0,
          comments: (p as any).comments || 0,
          url: (p as any).url || undefined,
          published_at: p.published_at || p.created_at,
          created_at: p.created_at,
          updated_at: p.updated_at,
        }));

        setPosts(normalized);

        // 통계 계산
        const stats: Record<string, number> = {
          전체: normalized.length,
          발행됨: normalized.filter((p) => p.status === "published").length,
          초안: normalized.filter((p) => p.status === "draft").length,
        };

        const categoryStats: Record<string, number> = {};
        normalized.forEach((post) => {
          if (post.category) {
            categoryStats[post.category] =
              (categoryStats[post.category] || 0) + 1;
          }
        });

        setBlogStats({ ...stats, ...categoryStats });
      } catch (error) {
        console.error("블로그 데이터 로딩 실패:", error);
        toast.error("블로그 포스트를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogData();
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(posts.map((post) => post.category).filter(Boolean))),
  ];

  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    const matchesStatus =
      statusFilter === "all" || post.status === statusFilter;
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const sorted = [...filteredPosts].sort((a, b) => {
    if (sortBy === "views") return (b.views || 0) - (a.views || 0);
    if (sortBy === "likes") return (b.likes || 0) - (a.likes || 0);
    return (
      new Date(b.published_at || b.created_at).getTime() -
      new Date(a.published_at || a.created_at).getTime()
    );
  });
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(" ").length || 300;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Frontend: "bg-blue-100 text-blue-800 border-blue-200",
      Backend: "bg-green-100 text-green-800 border-green-200",
      Development: "bg-purple-100 text-purple-800 border-purple-200",
      Design: "bg-pink-100 text-pink-800 border-pink-200",
    };
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-primary-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">
            블로그 포스트를 불러오는 중...
          </p>
        </div>
      </div>
    );
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
          pageIcon={DocumentTextIcon}
          pageName="블로그"
          title="블로그"
          description="개발 경험과 학습한 내용들을 기록하고 공유합니다"
          actionButton={{
            icon: PlusIcon,
            text: "새 포스트 작성",
            onClick: () => {
              setEditingPost(null);
              setEditorOpen(true);
            },
          }}
        >
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mb-6 lg:mb-8">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="포스트 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:shadow-md transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
              />
            </div>
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm min-w-[140px]">
              <FunnelIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-200 font-medium cursor-pointer text-sm sm:text-base w-full"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "All" ? "전체" : category}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm min-w-[140px]">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setPage(1);
                  setStatusFilter(e.target.value as any);
                }}
                className="bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-200 font-medium cursor-pointer text-sm sm:text-base w-full"
              >
                <option value="all">전체 상태</option>
                <option value="published">발행</option>
                <option value="draft">초안</option>
              </select>
            </div>
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm min-w-[140px]">
              <select
                value={sortBy}
                onChange={(e) => {
                  setPage(1);
                  setSortBy(e.target.value as any);
                }}
                className="bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-200 font-medium cursor-pointer text-sm sm:text-base w-full"
              >
                <option value="latest">최신순</option>
                <option value="views">조회순</option>
                <option value="likes">좋아요순</option>
              </select>
            </div>
          </div>
        </PageHeader>

        {/* Blog Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 lg:mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-gradient-to-br from-slate-50 to-white p-4 sm:p-5 lg:p-6 rounded-xl lg:rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                  {blogStats["전체"] || 0}
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">
                  전체 포스트
                </div>
              </div>
              <div className="p-2 sm:p-3 bg-gray-100 rounded-lg sm:rounded-xl group-hover:bg-primary-100 transition-all duration-200 transform group-hover:scale-110">
                <DocumentTextIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-primary-600 transition-colors" />
              </div>
            </div>
          </motion.div>

          {["발행됨", "Frontend", "Backend"].map((category, index) => {
            const count = blogStats[category] || 0;
            const gradientBg =
              category === "발행됨"
                ? "from-green-50 to-green-100"
                : category === "Frontend"
                ? "from-blue-50 to-blue-100"
                : "from-purple-50 to-purple-100";

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                className={`bg-gradient-to-br ${gradientBg} to-white p-4 sm:p-5 lg:p-6 rounded-xl lg:rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer transform hover:scale-105`}
                onClick={() =>
                  category !== "발행됨" && setSelectedCategory(category)
                }
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                      {count}
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-gray-600">
                      {category}
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl shadow-sm group-hover:shadow-md transition-all duration-200 transform group-hover:scale-110">
                    {category === "발행됨" ? (
                      <EyeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-primary-600 transition-colors" />
                    ) : (
                      <DocumentTextIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-primary-600 transition-colors" />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Blog Posts */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {paged.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary-300 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() => {
                  if (post.url && /^https?:\/\//i.test(post.url)) {
                    window.open(post.url, "_blank", "noopener,noreferrer");
                  }
                }}
              >
                <div className="p-6 lg:p-8">
                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <time dateTime={post.published_at}>
                        {formatDate(post.published_at)}
                      </time>
                      <span className="mx-2">•</span>
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>{getReadingTime(post.content)}분 읽기</span>
                    </div>

                    {post.category && (
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(
                          post.category
                        )}`}
                      >
                        {post.category}
                      </span>
                    )}
                  </div>

                  {/* Post Title */}
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {post.title}
                  </h2>

                  {/* Post Excerpt */}
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full hover:bg-primary-100 hover:text-primary-700 transition-colors"
                      >
                        <TagIcon className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-500 text-sm font-medium rounded-full">
                        +{post.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Post Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <EyeIcon className="h-4 w-4" />
                        <span>{post.views || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HeartIcon className="h-4 w-4" />
                        <span>{post.likes || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ChatBubbleLeftIcon className="h-4 w-4" />
                        <span>{post.comments || 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <ActionButton
                        text="더 읽기"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (post.url && /^https?:\/\//i.test(post.url)) {
                            window.open(
                              post.url,
                              "_blank",
                              "noopener,noreferrer"
                            );
                          }
                        }}
                      />
                      <ActionButton
                        text="수정"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingPost(post as any);
                          setEditorOpen(true);
                        }}
                      />
                      <ActionButton
                        text={
                          post.status === "published" ? "발행 취소" : "발행"
                        }
                        size="sm"
                        variant={
                          post.status === "published" ? "danger" : "primary"
                        }
                        onClick={async () => {
                          try {
                            if (post.status === "published") {
                              await BlogService.unpublishPost(post.id);
                              toast.success("초안으로 전환했습니다.");
                            } else {
                              await BlogService.publishPost(post.id);
                              toast.success("발행했습니다.");
                            }
                            setPosts((prev) =>
                              prev.map((p) =>
                                p.id === post.id
                                  ? {
                                      ...p,
                                      status:
                                        p.status === "published"
                                          ? "draft"
                                          : "published",
                                      published_at:
                                        p.status === "published"
                                          ? p.created_at
                                          : new Date().toISOString(),
                                    }
                                  : p
                              )
                            );
                          } catch (e) {
                            console.error(e);
                            toast.error("상태 변경에 실패했습니다.");
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 lg:py-20"
          >
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 lg:p-12 max-w-md mx-auto">
              <div className="p-4 bg-white rounded-xl shadow-sm mb-6 inline-block">
                <DocumentTextIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchTerm
                  ? "검색 결과가 없습니다"
                  : "블로그 포스트가 없습니다"}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {searchTerm
                  ? `"${searchTerm}"에 대한 검색 결과를 찾을 수 없습니다.`
                  : selectedCategory === "All"
                  ? "아직 작성된 블로그 포스트가 없습니다. 첫 번째 포스트를 작성해보세요."
                  : `${selectedCategory} 카테고리에 포스트가 없습니다.`}
              </p>
              {!searchTerm && (
                <div className="inline-flex">
                  <ActionButton
                    icon={PlusIcon}
                    text="첫 번째 포스트 작성하기"
                    variant="primary"
                    size="md"
                    onClick={() => {
                      setEditingPost(null);
                      setEditorOpen(true);
                    }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Load More Button */}
        {!loading && filteredPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-12"
          >
            <div className="inline-flex items-center gap-2">
              <ActionButton
                text="이전"
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              />
              <span className="text-sm text-gray-600">
                {page} / {Math.max(1, Math.ceil(sorted.length / pageSize))}
              </span>
              <ActionButton
                text="다음"
                size="sm"
                variant="outline"
                disabled={page >= Math.ceil(sorted.length / pageSize)}
                onClick={() => setPage((p) => p + 1)}
              />
            </div>
          </motion.div>
        )}
      </div>
      <BlogEditorModal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        initialPost={editingPost || undefined}
        onSaved={async () => {
          try {
            const supaPosts =
              (await BlogService.getPublishedPosts()) as SupaBlogPost[];
            const normalized: BlogPost[] = (supaPosts || []).map((p) => ({
              id: p.id,
              title: p.title,
              slug: p.slug,
              excerpt: (p as any).excerpt || (p.content || "").slice(0, 140),
              content: p.content || "",
              status: (p.status === "archived" ? "draft" : p.status) as
                | "published"
                | "draft",
              featured_image_url: (p as any).featured_image_url,
              tags: p.tags || [],
              category: (p as any).category,
              views: (p as any).views || 0,
              likes: (p as any).likes || 0,
              comments: (p as any).comments || 0,
              published_at: p.published_at || p.created_at,
              created_at: p.created_at,
              updated_at: p.updated_at,
            }));
            setPosts(normalized);
          } catch (e) {
            console.error(e);
          }
        }}
      />
    </motion.div>
  );
};

export default Blog;
