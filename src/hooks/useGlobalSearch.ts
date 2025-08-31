import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@services/supabase";
import { getProjectThumbnailUrl } from "@utils/media";

export type GlobalSearchResult =
  | {
      type: "project";
      id: string;
      title: string;
      description?: string | null;
      thumbnail?: string | null;
      status?: string | null;
    }
  | {
      type: "blog";
      id: string;
      title: string;
      slug: string;
      status?: string | null;
      tags?: string[];
    }
  | {
      type: "tech";
      id: string;
      name: string;
      category?: string | null;
    };

export type GlobalSearchFilters = {
  type?: "all" | "project" | "blog" | "tech";
  projectStatus?: "all" | "planned" | "in_progress" | "completed" | "on_hold";
  blogStatus?: "all" | "draft" | "published" | "archived";
  blogTag?: string;
  limit?: number;
  debounceMs?: number;
};

export function useGlobalSearch(query: string, filters: GlobalSearchFilters = {}) {
  const { debounceMs = 300, limit = 10 } = filters;
  const [debounced, setDebounced] = useState(query);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), debounceMs);
    return () => clearTimeout(id);
  }, [query, debounceMs]);

  const enabled = debounced.trim().length > 0;

  const qKey = useMemo(
    () => [
      "global-search",
      debounced.trim(),
      filters.type || "all",
      filters.projectStatus || "all",
      filters.blogStatus || "all",
      (filters.blogTag || "").trim().toLowerCase(),
      limit,
    ],
    [debounced, filters.type, filters.projectStatus, filters.blogStatus, filters.blogTag, limit]
  );

  const queryFn = async (): Promise<GlobalSearchResult[]> => {
    const term = `%${debounced.trim()}%`;

    const wantProject = filters.type === "all" || filters.type === "project";
    const wantBlog = filters.type === "all" || filters.type === "blog";
    const wantTech = filters.type === "all" || filters.type === "tech";

    const tasks: Array<Promise<any>> = [];

    if (wantProject) {
      let req = supabase
        .from("projects")
        .select("id,title,description,status,detailed_description")
        .ilike("title", term)
        .limit(limit);
      if (filters.projectStatus && filters.projectStatus !== "all") {
        req = req.eq("status", filters.projectStatus);
      }
      tasks.push(req);
    } else {
      tasks.push(Promise.resolve({ data: [] }));
    }

    if (wantBlog) {
      let req = supabase
        .from("blog_posts")
        .select("id,title,slug,status,tags")
        .or(`title.ilike.${term},slug.ilike.${term}`)
        .limit(limit);
      if (filters.blogStatus && filters.blogStatus !== "all") {
        req = req.eq("status", filters.blogStatus);
      }
      if (filters.blogTag && filters.blogTag.trim()) {
        // tags is array<string>
        req = req.contains("tags", [filters.blogTag.trim()]);
      }
      tasks.push(req);
    } else {
      tasks.push(Promise.resolve({ data: [] }));
    }

    if (wantTech) {
      const req = supabase
        .from("technologies")
        .select("id,name,category")
        .ilike("name", term)
        .limit(limit);
      tasks.push(req);
    } else {
      tasks.push(Promise.resolve({ data: [] }));
    }

    const [proj, blog, tech] = await Promise.all(tasks);

    const projItems: GlobalSearchResult[] = (proj.data || []).map((p: any) => {
      const details: any = p.detailed_description || {};
      const url = getProjectThumbnailUrl(details);
      return {
        type: "project",
        id: p.id,
        title: p.title,
        description: p.description,
        status: p.status,
        thumbnail: url,
      };
    });

    const blogItems: GlobalSearchResult[] = (blog.data || []).map((b: any) => ({
      type: "blog",
      id: b.id,
      title: b.title,
      slug: b.slug,
      status: b.status,
      tags: b.tags,
    }));

    const techItems: GlobalSearchResult[] = (tech.data || []).map((t: any) => ({
      type: "tech",
      id: t.id,
      name: t.name,
      category: t.category,
    }));

    return [...projItems, ...blogItems, ...techItems];
  };

  const q = useQuery({
    queryKey: qKey,
    enabled,
    queryFn,
    // 캐시 유지로 입력 중 깜빡임 줄이기
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });

  return {
    results: (q.data || []) as GlobalSearchResult[],
    loading: q.isLoading,
    error: q.error ? (q.error as Error).message : null,
  };
}
