import React, { useEffect, useMemo, useState } from "react";
import {
  ChartBarIcon,
  EyeIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { supabase } from "../services/supabase";
import toast from "react-hot-toast";
import LoadingView from "@components/common/LoadingView";

// 색상 팔레트
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

// 간단 세션 캐시 (5분 TTL)
const CACHE_KEY = "analytics_cache_v1";
const CACHE_TTL_MS = 5 * 60 * 1000;

const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [projectCount, setProjectCount] = useState(0);
  const [publishedPostCount, setPublishedPostCount] = useState(0);
  const [scheduleCount, setScheduleCount] = useState(0);
  const [technologyCount, setTechnologyCount] = useState(0);
  const [projects, setProjects] = useState<
    Array<{ status: string; created_at: string }>
  >([]);
  const [posts, setPosts] = useState<
    Array<{ published_at: string | null; created_at: string }>
  >([]);
  const [statusCountsMap, setStatusCountsMap] = useState<
    Record<string, number>
  >({});
  const [monthlyProjectsMap, setMonthlyProjectsMap] = useState<
    Record<string, number>
  >({});
  const [monthlyPostsMap, setMonthlyPostsMap] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const cachedRaw = sessionStorage.getItem(CACHE_KEY);
        const now = Date.now();
        if (cachedRaw) {
          try {
            const cached = JSON.parse(cachedRaw);
            if (now - cached.ts < CACHE_TTL_MS) {
              setProjectCount(cached.projectCount);
              setPublishedPostCount(cached.publishedPostCount);
              setScheduleCount(cached.scheduleCount);
              setTechnologyCount(cached.technologyCount);
              setProjects(cached.projects);
              setPosts(cached.posts);
              return; // 캐시 사용
            }
          } catch {}
        }

        // counts (head=true for cheap counts)
        const [
          { count: pCount },
          { count: bCount },
          { count: sCount },
          { count: tCount },
        ] = await Promise.all([
          supabase
            .from("projects")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("blog_posts")
            .select("id", { count: "exact", head: true })
            .eq("status", "published"),
          supabase
            .from("project_schedules")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("technologies")
            .select("id", { count: "exact", head: true }),
        ]);
        const pc = pCount || 0;
        const bc = bCount || 0;
        const sc = sCount || 0;
        const tc = tCount || 0;
        setProjectCount(pc);
        setPublishedPostCount(bc);
        setScheduleCount(sc);
        setTechnologyCount(tc);

        const [statusCounts, projMonthly, postMonthly] = await Promise.all([
          supabase.from("project_status_counts").select("status,count"),
          supabase.from("project_monthly_counts").select("month,projects"),
          supabase.from("published_post_monthly_counts").select("month,posts"),
        ]);

        // 상태 분포는 counts를 확장해 재사용 (현재 파이차트 계산 로직 유지)
        const scMap: Record<string, number> = {};
        ((statusCounts.data as any[]) || []).forEach((row) => {
          scMap[row.status] = row.count;
        });
        setStatusCountsMap(scMap);
        const projData = ((statusCounts.data as any[]) || []).flatMap((row) =>
          Array.from({ length: row.count }).map(() => ({
            status: row.status as string,
            created_at: new Date().toISOString(),
          }))
        );
        setProjects(projData);

        // 월별 추이를 위해 posts state를 더미 날짜로 채우고 실제 값은 후단 useMemo에서 maps로 계산
        const months: string[] = [];
        const nowD = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(nowD.getFullYear(), nowD.getMonth() - i, 1);
          months.push(
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
          );
        }
        const projMap: Record<string, number> = {};
        ((projMonthly.data as any[]) || []).forEach((r) => {
          projMap[r.month] = r.projects;
        });
        const postMap: Record<string, number> = {};
        ((postMonthly.data as any[]) || []).forEach((r) => {
          postMap[r.month] = r.posts;
        });
        setMonthlyProjectsMap(projMap);
        setMonthlyPostsMap(postMap);
        setPosts(
          months.map((m) => ({ published_at: null, created_at: m + "-01" }))
        );

        // 캐시 저장
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            ts: now,
            projectCount: pc,
            publishedPostCount: bc,
            scheduleCount: sc,
            technologyCount: tc,
            projects: projData,
            posts: months.map((m) => ({
              published_at: null,
              created_at: m + "-01",
            })),
          })
        );

        // 세션 캐시 저장 (월 배열 더미를 저장)
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            ts: now,
            projectCount: pc,
            publishedPostCount: bc,
            scheduleCount: sc,
            technologyCount: tc,
            projects: projData,
            posts: months.map((m) => ({
              published_at: null,
              created_at: m + "-01",
            })),
          })
        );
      } catch (e) {
        console.error(e);
        toast.error("분석 데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // 상태 분포 파이차트 데이터
  const statusPieData = useMemo(() => {
    const source = Object.keys(statusCountsMap).length
      ? statusCountsMap
      : projects.reduce((acc, p) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
    return Object.entries(source).map(([name, value]) => ({ name, value }));
  }, [statusCountsMap, projects]);

  // 월별 추이 데이터(최근 6개월): 프로젝트/포스트 생성
  const monthlyTrend = useMemo(() => {
    const months: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      );
    }
    const projectByMonth = Object.keys(monthlyProjectsMap).length
      ? monthlyProjectsMap
      : {};
    const postByMonth = Object.keys(monthlyPostsMap).length
      ? monthlyPostsMap
      : {};
    return months.map((m) => ({
      name: m,
      projects: projectByMonth[m] || 0,
      posts: postByMonth[m] || 0,
    }));
  }, [monthlyProjectsMap, monthlyPostsMap, projects, posts]);

  const stats = [
    {
      name: "프로젝트",
      value: projectCount.toLocaleString(),
      change: "",
      changeType: "positive",
      icon: UserGroupIcon,
    },
    {
      name: "발행 포스트",
      value: publishedPostCount.toLocaleString(),
      change: "",
      changeType: "positive",
      icon: EyeIcon,
    },
    {
      name: "일정",
      value: scheduleCount.toLocaleString(),
      change: "",
      changeType: "positive",
      icon: ClockIcon,
    },
    {
      name: "기술 수",
      value: technologyCount.toLocaleString(),
      change: "",
      changeType: "positive",
      icon: ArrowTrendingUpIcon,
    },
  ];

  if (loading) {
    return <LoadingView message="분석 데이터를 불러오는 중..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            웹사이트 분석
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            포트폴리오 사이트의 방문자 통계와 성능 분석 데이터입니다.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <stat.icon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Visits & Page Views Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              최근 6개월 프로젝트/포스트 추이
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={monthlyTrend}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="projects" fill="#3B82F6" name="프로젝트" />
                <Bar dataKey="posts" fill="#10B981" name="포스트" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Device Usage Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <DevicePhoneMobileIcon className="h-5 w-5 mr-2" />
              프로젝트 상태 분포
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={0}
                >
                  {statusPieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid #334155",
                    color: "#e2e8f0",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Line Trend (동일 데이터 시각화) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
            최근 6개월 추이(라인)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={monthlyTrend}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid #334155",
                  color: "#e2e8f0",
                }}
              />
              <Line
                type="monotone"
                dataKey="projects"
                stroke="#3B82F6"
                strokeWidth={2}
                name="프로젝트"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="posts"
                stroke="#10B981"
                strokeWidth={2}
                name="포스트"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
