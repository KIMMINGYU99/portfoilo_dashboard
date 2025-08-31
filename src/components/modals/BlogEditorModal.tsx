import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import toast from "react-hot-toast";
import ActionButton from "@components/common/ActionButton";
import { BlogService } from "../../services/blogService";
import type { BlogPost } from "../../services/supabase";

interface BlogEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPost?: Partial<BlogPost> | null;
  onSaved?: (post: BlogPost) => void;
}

export default function BlogEditorModal({
  isOpen,
  onClose,
  initialPost,
  onSaved,
}: BlogEditorModalProps) {
  const isEdit = !!initialPost?.id;
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string>("");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialPost && Object.keys(initialPost).length > 0) {
      setTitle(initialPost.title || "");
      setSlug(initialPost.slug || "");
      setCategory((initialPost as any).category || "");
      setTags(((initialPost as any).tags || []).join(", "));
      setStatus((initialPost.status as any) || "draft");
      setContent(initialPost.content || "");
      setUrl(((initialPost as any).url as string) || "");
    } else {
      setTitle("");
      setSlug("");
      setCategory("");
      setTags("");
      setStatus("draft");
      setContent("");
      setUrl("");
    }
  }, [isOpen, initialPost]);

  const disabled = useMemo(
    () => submitting || title.trim().length === 0,
    [submitting, title]
  );

  if (!isOpen) return null;

  const toSlug = (t: string) =>
    t
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">
            {isEdit ? "포스트 수정" : "새 포스트 작성"}
          </h3>
          <div className="flex gap-2">
            <ActionButton
              text="닫기"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            />
            <ActionButton
              text="저장"
              variant="primary"
              loading={submitting}
              onClick={async () => {
                try {
                  setSubmitting(true);
                  if (!title.trim()) {
                    toast.error("제목을 입력해 주세요.");
                    return;
                  }
                  const payload = {
                    title: title.trim(),
                    slug: (slug || toSlug(title)).trim(),
                    content,
                    status,
                    url: url || null,
                    tags: tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                    category: category || null,
                  } as any;
                  let saved: BlogPost | null = null;
                  if (isEdit && initialPost?.id) {
                    saved = (await BlogService.updatePost(
                      initialPost.id,
                      payload
                    )) as BlogPost | null;
                  } else {
                    saved = (await BlogService.createPost(
                      payload
                    )) as BlogPost | null;
                  }
                  if (saved) {
                    toast.success(
                      isEdit
                        ? "포스트를 수정했습니다."
                        : "포스트를 생성했습니다."
                    );
                    onClose();
                    onSaved && onSaved(saved);
                  } else {
                    toast.error("저장에 실패했습니다.");
                  }
                } catch (e) {
                  console.error(e);
                  toast.error("저장 중 오류가 발생했습니다.");
                } finally {
                  setSubmitting(false);
                }
              }}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Editor */}
          <div className="p-6 space-y-4 border-r border-gray-200 dark:border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                placeholder="제목"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                placeholder="슬러그(미입력 시 자동 생성)"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                placeholder="카테고리"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <input
                className="px-3 py-2 border rounded-lg md:col-span-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                placeholder="태그(쉼표로 구분)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
            <input
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              placeholder="외부 URL (카드 클릭 시 이동)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600">상태</label>
              <select
                className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="draft">초안</option>
                <option value="published">발행</option>
              </select>
            </div>
            <textarea
              className="w-full h-[420px] px-3 py-2 border rounded-lg font-mono text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              placeholder={
                "마크다운으로 작성하세요 (GFM 지원)\n\n```ts\nconsole.log('hello');\n```"
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* Preview */}
          <div className="p-6 prose max-w-none overflow-y-auto h-[600px]">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  if (!inline && match) {
                    return (
                      <SyntaxHighlighter
                        style={oneDark as any}
                        language={match[1]}
                        PreTag="div"
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    );
                  }
                  return <code className={className}>{children}</code>;
                },
              }}
            >
              {content || "미리보기 내용이 여기에 표시됩니다."}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
