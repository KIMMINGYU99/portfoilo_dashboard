import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";

type SearchResult =
  | {
      type: "project";
      id: string;
      title: string;
      description?: string | null;
      thumbnail?: string | null;
    }
  | {
      type: "blog";
      id: string;
      title: string;
      slug: string;
      status?: string | null;
    }
  | { type: "tech"; id: string; name: string; category?: string | null };

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEBOUNCE_MS = 250;

import { useGlobalSearch } from "@hooks/useGlobalSearch";

export default function GlobalSearchModal({
  isOpen,
  onClose,
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, Math.max(0, results.length - 1)));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const item = results[activeIndex];
        if (item) handleSelect(item);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, results, activeIndex]);

  const { results: qr, loading: ql } = useGlobalSearch(query, {
    type: "all",
    debounceMs: DEBOUNCE_MS,
    limit: 10,
  });

  useEffect(() => {
    if (!isOpen) return;
    if (!query.trim()) {
      setResults([]);
      setActiveIndex(0);
      return;
    }
    setResults(qr as any);
    setActiveIndex(0);
    setLoading(ql);
  }, [qr, ql, isOpen, query]);

  const handleSelect = (item: SearchResult) => {
    if (item.type === "project") {
      navigate(`/projects/${item.id}`);
    } else if (item.type === "blog") {
      navigate(`/blog?slug=${encodeURIComponent((item as any).slug)}`);
    } else if (item.type === "tech") {
      navigate(`/techstack`);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="프로젝트/블로그/기술 통합 검색..."
            className="w-full outline-none text-sm py-1"
          />
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-sm text-gray-500">검색중...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">
              검색 결과가 없습니다.
            </div>
          ) : (
            <ul className="py-1">
              {results.map((r, idx) => (
                <li
                  key={`${r.type}-${r.id}`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => handleSelect(r)}
                  className={`px-4 py-2 cursor-pointer flex items-center gap-3 ${
                    idx === activeIndex ? "bg-primary-50" : ""
                  }`}
                >
                  {r.type === "project" ? (
                    (r as any).thumbnail ? (
                      <img
                        src={(r as any).thumbnail}
                        alt="thumb"
                        className="w-8 h-8 rounded object-cover border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <FolderIcon className="w-4 h-4 text-primary-600" />
                    )
                  ) : r.type === "blog" ? (
                    <DocumentTextIcon className="w-4 h-4 text-green-600" />
                  ) : (
                    <CodeBracketIcon className="w-4 h-4 text-blue-600" />
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {r.type === "tech" ? (r as any).name : (r as any).title}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {r.type === "project" && (r as any).description}
                      {r.type === "blog" && (r as any).slug}
                      {r.type === "tech" && (r as any).category}
                    </div>
                  </div>
                  <div className="ml-auto text-[10px] uppercase text-gray-400">
                    {r.type}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
