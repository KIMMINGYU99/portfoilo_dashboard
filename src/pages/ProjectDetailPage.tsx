import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import ActionButton from "@components/common/ActionButton";
import EditProjectModal from "@components/modals/EditProjectModal";
import { useModal } from "../hooks";
import { ProjectService } from "../services/projectService";
import { getProjectThumbnailUrl } from "../utils/media";
import { CalendarService } from "../services/calendarService";
import { ReviewService } from "../services/reviewService";
import StarRating from "../components/common/StarRating";
import type {
  Project,
  Technology,
  ProjectSchedule,
} from "../services/supabase";
import AddReviewModal from "../components/modals/AddReviewModal";
import EditReviewModal from "../components/modals/EditReviewModal";
import toast from "react-hot-toast";

import LoadingView from "@components/common/LoadingView";
import ErrorView from "@components/common/ErrorView";
import ReviewStats from "@components/common/ReviewStats";
import { useProjectReviews } from "@hooks/useProjectReviews";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [reviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [events, setEvents] = useState<ProjectSchedule[]>([]);
  // 탭 제거: 단일 페이지에 개요와 리뷰가 순차 배치되도록 합니다.
  const [reviewOpen, setReviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<any | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"latest" | "rating">("latest");
  const [minRating, setMinRating] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalReviews] = useState<number>(0);
  const pageSize = 5;
  const editProjectModal = useModal<Project & { technologies: Technology[] }>();
  const [lightbox, setLightbox] = useState<{ open: boolean; index: number }>({
    open: false,
    index: 0,
  });

  const {
    reviews: qReviews,
    total: qTotal,
    loading: qLoading,
    error: qError,
    stats,
  } = useProjectReviews(id, {
    page,
    limit: pageSize,
    sortBy,
    filterType: filterType as any,
    minRating,
  });

  useEffect(() => {
    if (!id) return;
    const run = async () => {
      setLoading(true);
      try {
        const [p, techs, evts] = await Promise.all([
          ProjectService.getProject(id),
          ProjectService.getProjectTechnologies(id),
          CalendarService.getEventsByProject(id),
        ]);
        setProject(p);
        setTechnologies(techs);
        setEvents(evts);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  if (loading || qLoading) {
    return <LoadingView message="프로젝트 상세를 불러오는 중..." />;
  }

  if (qError) {
    return <ErrorView message={qError} fullScreen />;
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        프로젝트가 없습니다.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8"
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold flex items-center gap-3 text-gray-900 dark:text-gray-100">
            {project.title}
            {reviews.length > 0 && (
              <span className="inline-flex items-center gap-2">
                <StarRating
                  value={
                    Math.round(
                      (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) /
                        reviews.length) *
                        10
                    ) / 10
                  }
                  size={16}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {(
                    reviews.reduce((acc, r) => acc + (r.rating || 0), 0) /
                    reviews.length
                  ).toFixed(1)}
                </span>
              </span>
            )}
          </h1>
          <div className="flex items-center gap-2">
            <ActionButton
              icon={PencilSquareIcon}
              text="편집"
              variant="outline"
              onClick={() => editProjectModal.open(project as any)}
              aria-label="프로젝트 편집"
            />
            <ActionButton
              icon={TrashIcon}
              text="삭제"
              variant="danger"
              onClick={async () => {
                if (!confirm("이 프로젝트를 삭제하시겠습니까?")) return;
                await ProjectService.deleteProject(project.id);
                window.history.back();
              }}
              aria-label="프로젝트 삭제"
            />
          </div>
        </div>
        {/* 탭 제거 */}
        {project.description && (
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {project.description}
          </p>
        )}

        {/* 썸네일 (detailed_description.thumbnail) */}
        {(() => {
          const url = getProjectThumbnailUrl(
            (project.detailed_description as any) || {}
          );
          return url ? (
            <div className="mb-6">
              <img
                src={url}
                alt={project.title}
                className="w-full max-h-[320px] object-cover rounded-xl border dark:border-gray-700"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          ) : null;
        })()}

        {(() => {
          const details: any = (project.detailed_description as any) || {};
          const images: string[] = Array.isArray(details.images)
            ? details.images
            : [];
          if (!images.length) return null;
          return (
            <div className="mb-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {images.map((src, idx) => (
                  <button
                    key={`${src}-${idx}`}
                    type="button"
                    onClick={() => setLightbox({ open: true, index: idx })}
                    className="block focus:outline-none"
                  >
                    <img
                      src={src}
                      alt={`${project.title} screenshot ${idx + 1}`}
                      className="w-full h-40 object-cover rounded-lg border"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {/* 라이트박스 */}
        {(() => {
          const details: any = (project.detailed_description as any) || {};
          const images: string[] = Array.isArray(details.images)
            ? details.images
            : [];
          if (!lightbox.open || !images.length) return null;
          const current = images[lightbox.index] || images[0];
          return (
            <div
              className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
              role="dialog"
              aria-modal="true"
              aria-label="이미지 미리보기"
              onClick={() => setLightbox({ open: false, index: 0 })}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setLightbox({ open: false, index: 0 });
                } else if (e.key === "ArrowLeft") {
                  e.stopPropagation();
                  setLightbox((s) => ({
                    open: true,
                    index: (s.index - 1 + images.length) % images.length,
                  }));
                } else if (e.key === "ArrowRight") {
                  e.stopPropagation();
                  setLightbox((s) => ({
                    open: true,
                    index: (s.index + 1) % images.length,
                  }));
                }
              }}
              tabIndex={-1}
            >
              <img
                src={current}
                alt="preview"
                className="max-w-[90vw] max-h-[85vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="absolute top-4 right-4">
                <ActionButton
                  icon={XMarkIcon}
                  iconOnly
                  aria-label="닫기"
                  onClick={() => setLightbox({ open: false, index: 0 })}
                  styles={{
                    variantClass:
                      "bg-black/40 text-white hover:bg-black/60 border border-white/20",
                  }}
                />
              </div>
              {images.length > 1 && (
                <>
                  <div className="absolute left-4">
                    <ActionButton
                      icon={ChevronLeftIcon}
                      iconOnly
                      aria-label="이전"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightbox((s) => ({
                          open: true,
                          index: (s.index - 1 + images.length) % images.length,
                        }));
                      }}
                      styles={{
                        variantClass:
                          "bg-black/40 text-white hover:bg-black/60 border border-white/20",
                      }}
                    />
                  </div>
                  <div className="absolute right-4">
                    <ActionButton
                      icon={ChevronRightIcon}
                      iconOnly
                      aria-label="다음"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightbox((s) => ({
                          open: true,
                          index: (s.index + 1) % images.length,
                        }));
                      }}
                      styles={{
                        variantClass:
                          "bg-black/40 text-white hover:bg-black/60 border border-white/20",
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          );
        })()}

        {/* 상세 설명 + 메타 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold mb-4">상세 설명</h2>
            {(() => {
              const d: any = (project.detailed_description as any) || {};
              const hasPretty = d.role || d.project_summary;
              if (!hasPretty) {
                return (
                  <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(project.detailed_description, null, 2)}
                  </pre>
                );
              }
              return (
                <div className="space-y-5 text-sm text-gray-800">
                  {d.role && (
                    <div className="rounded-xl border bg-blue-50/60 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 p-4">
                      <div className="flex items-start gap-2">
                        <div>
                          <div className="text-blue-800 dark:text-blue-300 font-semibold">
                            담당 역할
                          </div>
                          <div className="mt-1 text-blue-900/90 dark:text-blue-200 whitespace-pre-wrap">
                            {d.role}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {d.project_summary && (
                    <div className="rounded-xl border bg-amber-50/60 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 p-4">
                      <div className="flex items-start gap-2">
                        <div>
                          <div className="text-amber-800 dark:text-amber-300 font-semibold">
                            프로젝트 요약
                          </div>
                          <div className="mt-1 text-amber-900/90 dark:text-amber-200 whitespace-pre-wrap">
                            {d.project_summary}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {typeof d.markdown === "string" &&
                    d.markdown.trim().length > 0 && (
                      <div className="prose max-w-none">
                        {(() => {
                          const React = require("react");
                          const Markdown = require("react-markdown").default;
                          const remarkGfm = require("remark-gfm");
                          const {
                            Prism: SyntaxHighlighter,
                          } = require("react-syntax-highlighter");
                          const prismStyles = require("react-syntax-highlighter/dist/cjs/styles/prism");
                          return React.createElement(Markdown, {
                            children: d.markdown,
                            remarkPlugins: [remarkGfm],
                            components: {
                              code({
                                node,
                                inline,
                                className,
                                children,
                                ...props
                              }: any) {
                                const match = /language-(\w+)/.exec(
                                  className || ""
                                );
                                return !inline && match
                                  ? React.createElement(
                                      SyntaxHighlighter,
                                      {
                                        style: prismStyles.oneDark,
                                        language: match[1],
                                        PreTag: "div",
                                        ...props,
                                      },
                                      String(children).replace(/\n$/, "")
                                    )
                                  : React.createElement(
                                      "code",
                                      { className: className, ...props },
                                      children
                                    );
                              },
                            },
                          });
                        })()}
                      </div>
                    )}
                </div>
              );
            })()}
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold mb-4">메타</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <div>상태: {project.status}</div>
              <div>
                기간: {project.start_date || "-"} ~ {project.end_date || "-"}
              </div>
            </div>
          </div>
        </div>

        {/* 기술 스택 */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">기술 스택</h2>
          {technologies.length === 0 ? (
            <div className="text-gray-500 text-sm">연결된 기술이 없습니다.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {technologies.map((t) => (
                <span
                  key={t.id}
                  className="px-3 py-1.5 text-sm rounded-full border inline-flex items-center gap-1"
                  style={{
                    backgroundColor: t.color ? `${t.color}22` : undefined,
                    borderColor: t.color || undefined,
                    color: t.color || undefined,
                  }}
                  title={
                    ((t as any).usage_description
                      ? (t as any).usage_description + "\n"
                      : "") + (t.category || "")
                  }
                >
                  {t.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 기술 사용 설명 (선택적으로 목록 표시) */}
        {(() => {
          const items = technologies
            .map((t) => {
              const raw = (t as any).usage_description;
              const desc = typeof raw === "string" ? raw.trim() : "";
              return { name: t.name, desc };
            })
            .filter((x) => {
              if (!x.desc) return false;
              const lower = x.desc.toLowerCase();
              // 무의미한 값은 제거하여 섹션 자체가 노출되지 않도록 함
              const emptyLike = [
                "-",
                "--",
                "none",
                "n/a",
                "na",
                "없음",
                "no info",
                "no information",
                "핵심 기술",
                "프로젝트에서 활용한 핵심 기술",
                "core tech",
                "core technology",
              ];
              // 기술명과 동일하거나 포함만 하는 템플릿성 문구도 제외
              const equalsTechName =
                x.desc.replace(/\s+/g, " ").trim().toLowerCase() ===
                x.name.trim().toLowerCase();
              const placeholderRegex = /(핵심\s*기술|core\s*tech)/i;
              return !(
                emptyLike.includes(lower) ||
                equalsTechName ||
                placeholderRegex.test(x.desc)
              );
            });
          if (items.length === 0) return null;
          return (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-8">
              <h3 className="text-base font-semibold mb-3">기술 사용 설명</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                {items.map((it) => (
                  <li key={it.name}>
                    <span className="font-medium mr-2">{it.name}</span>
                    <span className="whitespace-pre-wrap">{it.desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}

        {/* 일정 */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">일정</h2>
          {events.length === 0 ? (
            <div className="text-gray-500 text-sm">등록된 일정이 없습니다.</div>
          ) : (
            <ul className="space-y-3">
              {events.map((ev) => (
                <li key={ev.id} className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{ev.title}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(ev.start_time).toLocaleString()} ~{" "}
                      {ev.end_time
                        ? new Date(ev.end_time).toLocaleString()
                        : ""}
                    </div>
                    {ev.description && (
                      <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                        {ev.description}
                      </div>
                    )}
                  </div>
                  {ev.status && (
                    <span className="ml-4 px-2 py-0.5 text-xs rounded border bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700/60 dark:text-gray-100 dark:border-gray-600">
                      {ev.status}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 리뷰 섹션 (개요 아래) */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold mb-4">리뷰 ({qTotal})</h2>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <select
              className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              value={filterType}
              onChange={(e) => {
                setPage(1);
                setFilterType(e.target.value);
              }}
            >
              <option value="all">전체 유형</option>
              <option value="general">일반 리뷰</option>
              <option value="code_review">코드 리뷰</option>
              <option value="design_review">디자인 리뷰</option>
              <option value="user_feedback">사용자 피드백</option>
            </select>
            <select
              className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              value={sortBy}
              onChange={(e) => {
                setPage(1);
                setSortBy(e.target.value as any);
              }}
            >
              <option value="latest">최신순</option>
              <option value="rating">평점순</option>
            </select>
            <select
              className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              value={minRating}
              onChange={(e) => {
                setPage(1);
                setMinRating(parseInt(e.target.value, 10));
              }}
            >
              <option value={0}>별점 전체</option>
              <option value={1}>1점 이상</option>
              <option value={2}>2점 이상</option>
              <option value={3}>3점 이상</option>
              <option value={4}>4점 이상</option>
              <option value={5}>5점만</option>
            </select>
          </div>
          <div className="mb-4">
            <ActionButton
              text="리뷰 작성"
              variant="primary"
              size="md"
              onClick={() => setReviewOpen(true)}
            />
          </div>
          <ReviewStats
            average={stats.average}
            distribution={stats.distribution}
          />
          {qReviews.length === 0 ? (
            <div className="text-gray-500">아직 리뷰가 없습니다.</div>
          ) : (
            <div className="space-y-4">
              {qReviews.map((r) => (
                <div key={r.id} className="border rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">
                    {new Date(r.created_at).toLocaleString()}
                  </div>
                  {r.title && <div className="font-semibold">{r.title}</div>}
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {r.content}
                  </div>
                  {typeof r.rating === "number" && (
                    <div className="mt-2">
                      <StarRating value={r.rating} />
                    </div>
                  )}
                  <div className="mt-3 flex gap-2">
                    <ActionButton
                      text="수정"
                      variant="outline"
                      onClick={() => {
                        setEditingReview(r);
                        setEditOpen(true);
                      }}
                    />
                    <ActionButton
                      text="삭제"
                      variant="danger"
                      onClick={async () => {
                        if (!confirm("이 리뷰를 삭제하시겠습니까?")) return;
                        const ok = await ReviewService.deleteReview(r.id);
                        if (ok) {
                          toast.success("리뷰가 삭제되었습니다.");
                          setPage(1);
                        } else {
                          toast.error("삭제에 실패했습니다.");
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
              {/* Pagination */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <ActionButton
                  text="이전"
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                />
                <span className="text-sm text-gray-600">
                  {page} / {Math.max(1, Math.ceil(totalReviews / pageSize))}
                </span>
                <ActionButton
                  text="다음"
                  size="sm"
                  variant="outline"
                  disabled={page >= Math.ceil(totalReviews / pageSize)}
                  onClick={() => setPage((p) => p + 1)}
                />
              </div>
            </div>
          )}
        </div>
        <AddReviewModal
          isOpen={reviewOpen}
          onClose={() => setReviewOpen(false)}
          projectId={id as string}
          onCreated={async () => {
            if (!id) return;
            setPage(1);
          }}
        />
        <EditReviewModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          review={editingReview}
          onUpdated={async () => {
            if (!id) return;
            // 유지 중인 페이지/정렬/필터로 재조회는 상단 useEffect에서 처리됨
          }}
        />
      </div>
      <EditProjectModal
        isOpen={editProjectModal.isOpen}
        onClose={editProjectModal.close}
        onProjectUpdated={(p) => setProject(p)}
        project={project as any}
      />
    </motion.div>
  );
}
