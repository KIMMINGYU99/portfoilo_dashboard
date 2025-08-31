import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import ActionButton from "@components/common/ActionButton";
// import { CalendarService } from "../services/calendarService";
import { Event } from "../services/supabase";
import PageHeader from "../components/common/PageHeader";
// import toast from "react-hot-toast";
import AddCalendarEventModal from "../components/modals/AddCalendarEventModal";
import EditCalendarEventModal from "../components/modals/EditCalendarEventModal";
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  View,
} from "react-big-calendar";
// Drag & Drop addon
// @ts-ignore
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import {
  format,
  parse,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  getDay,
} from "date-fns";
import { ko } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { ko } as const;
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// DnD wrapper
const DnDCalendar: any = withDragAndDrop(BigCalendar as any);

// 이벤트 타입별 색상 매핑
const eventTypeColors: Record<string, string> = {
  milestone: "bg-blue-500",
  task: "bg-green-500",
  meeting: "bg-purple-500",
  deadline: "bg-red-500",
};

// 이벤트 타입별 한글 표시
const eventTypeLabels: Record<string, string> = {
  milestone: "마일스톤",
  task: "작업",
  meeting: "회의",
  deadline: "마감일",
};

// import LoadingView from "@components/common/LoadingView";
// import ErrorView from "@components/common/ErrorView";
import { useCalendarEvents } from "@hooks/useCalendarEvents";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");

  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const {
    events: qEvents,
    loading: qLoading,
    /* error: qError, */ refetch,
    updateEvent,
  } = useCalendarEvents(rangeStart, rangeEnd);

  // 초기/네비게이션/뷰 변경 시 초기 범위 설정
  useEffect(() => {
    let s: Date;
    let e: Date;
    if (viewMode === "month") {
      s = startOfDay(startOfMonth(currentDate));
      e = endOfDay(endOfMonth(currentDate));
    } else if (viewMode === "week") {
      s = startOfDay(startOfWeek(currentDate, { weekStartsOn: 0 }));
      e = endOfDay(endOfWeek(currentDate, { weekStartsOn: 0 }));
    } else {
      s = startOfDay(currentDate);
      e = endOfDay(currentDate);
    }
    setRangeStart(s);
    setRangeEnd(e);
  }, [currentDate, viewMode]);

  // (react-big-calendar로 대체되어 미사용이 된 유틸 제거)

  // 월 변경
  const changeMonth = (increment: number) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1)
    );
  };

  // 오늘로 이동
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // react-big-calendar로 렌더링

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8"
    >
      <div className="max-w-7xl mx-auto">
        <PageHeader
          pageIcon={CalendarIcon}
          pageName="캘린더"
          title="일정 관리"
          description="프로젝트 일정과 이벤트를 체계적으로 관리하세요"
          actionButton={{
            icon: PlusIcon,
            text: "새 이벤트",
            onClick: () => {
              setAddOpen(true);
            },
          }}
        />

        {/* 캘린더 컨트롤 */}
        <div className="bg-white dark:bg-gray-900 rounded-xl lg:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 mb-8 lg:mb-10 overflow-hidden">
          <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* 월/년 표시 및 네비게이션 */}
              <div className="flex items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                </h2>
                <div className="flex items-center gap-2">
                  <ActionButton
                    icon={ChevronLeftIcon}
                    iconOnly
                    aria-label="이전 달"
                    onClick={() => changeMonth(-1)}
                  />
                  <ActionButton
                    text="오늘"
                    size="sm"
                    variant="outline"
                    onClick={goToToday}
                  />
                  <ActionButton
                    icon={ChevronRightIcon}
                    iconOnly
                    aria-label="다음 달"
                    onClick={() => changeMonth(1)}
                  />
                </div>
              </div>

              {/* 중복된 보기 모드 버튼 제거: 기본 툴바만 노출 */}
            </div>
          </div>

          {/* 이벤트 타입 범례 */}
          <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-900">
            <div className="flex flex-wrap gap-4 sm:gap-6">
              {Object.entries(eventTypeLabels).map(([type, label]) => (
                <div key={type} className="flex items-center gap-3 group">
                  <div
                    className={`w-4 h-4 rounded-full ${eventTypeColors[type]} shadow-sm group-hover:shadow-md transition-all duration-200 transform group-hover:scale-110`}
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 캘린더 그리드 */}
          {qLoading ? (
            <div className="p-8 lg:p-12 text-center">
              <div className="inline-block w-8 h-8 border-3 border-gray-300 border-t-primary-600 rounded-full animate-spin" />
              <p className="text-gray-500 mt-4 font-medium">
                이벤트를 불러오는 중...
              </p>
            </div>
          ) : (
            <div className="h-[70vh] p-2 sm:p-4">
              <DnDCalendar
                localizer={localizer}
                date={currentDate}
                onNavigate={(d: Date) => setCurrentDate(d)}
                view={viewMode}
                onView={(v: View) => setViewMode(v as typeof viewMode)}
                onRangeChange={(range: any) => {
                  // month view: range is { start: Date, end: Date } | Date[] depending on localizer
                  if (Array.isArray(range)) {
                    if (range.length > 0) {
                      setRangeStart(range[0] as Date);
                      setRangeEnd(range[range.length - 1] as Date);
                    }
                  } else if (
                    range &&
                    (range as any).start &&
                    (range as any).end
                  ) {
                    setRangeStart((range as any).start as Date);
                    setRangeEnd((range as any).end as Date);
                  }
                }}
                events={qEvents.map((e) => ({
                  title: e.title,
                  start: new Date(e.start_time),
                  end: new Date(e.end_time || e.start_time),
                  allDay: e.all_day,
                  resource: e,
                }))}
                startAccessor="start"
                endAccessor="end"
                selectable
                resizable
                onEventDrop={async ({ event, start, end }: any) => {
                  const original: Event = event.resource as Event;
                  await updateEvent(original.id, {
                    start_time: (start as Date).toISOString(),
                    end_time: (end as Date).toISOString(),
                  } as any);
                  await refetch();
                }}
                onEventResize={async ({ event, start, end }: any) => {
                  const original: Event = event.resource as Event;
                  await updateEvent(original.id, {
                    start_time: (start as Date).toISOString(),
                    end_time: (end as Date).toISOString(),
                  } as any);
                  await refetch();
                }}
                onSelectSlot={(slotInfo: any) => {
                  setRangeStart(slotInfo.start as Date);
                  setRangeEnd(slotInfo.end as Date);
                  setAddOpen(true);
                }}
                popup
                drilldownView="day"
                culture="ko"
                className="bg-white dark:bg-gray-900 rounded-b-xl"
                eventPropGetter={(event: any) => {
                  const original: Event = event.resource as Event;
                  const colorMap: Record<string, string> = {
                    milestone: "#3B82F6",
                    task: "#10B981",
                    meeting: "#8B5CF6",
                    deadline: "#EF4444",
                  };
                  const bg = colorMap[original.type] || "#6366F1";
                  return {
                    style: {
                      backgroundColor: bg,
                      borderRadius: 8,
                      border: "none",
                      opacity: 0.9,
                      color: "white",
                    },
                  };
                }}
                onSelectEvent={(ev: any) => {
                  const original: Event = ev.resource as Event;
                  setSelectedEvent(original);
                  setEditOpen(true);
                }}
              />
            </div>
          )}
        </div>

        <AddCalendarEventModal
          isOpen={addOpen}
          onClose={() => setAddOpen(false)}
          defaultStart={rangeStart || undefined}
          defaultEnd={rangeEnd || undefined}
          onCreated={async () => {
            await refetch();
          }}
        />

        <EditCalendarEventModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          event={selectedEvent as any}
          onUpdated={async () => {
            await refetch();
          }}
          onDeleted={async () => {
            await refetch();
          }}
        />

        {/* 이벤트 통계 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-gradient-to-br from-slate-50 to-white p-4 sm:p-5 lg:p-6 rounded-xl lg:rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                  {qEvents.length}
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">
                  전체 이벤트
                </div>
              </div>
              <div className="p-2 sm:p-3 bg-gray-100 rounded-lg sm:rounded-xl group-hover:bg-primary-100 transition-all duration-200 transform group-hover:scale-110">
                <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-primary-600 transition-colors" />
              </div>
            </div>
          </motion.div>

          {Object.entries(eventTypeLabels).map(([type, label], index) => {
            const count = qEvents.filter((e) => e.type === type).length;
            const colorClass = eventTypeColors[type];
            const gradientBg =
              type === "milestone"
                ? "from-blue-50 to-blue-100"
                : type === "task"
                ? "from-green-50 to-green-100"
                : type === "meeting"
                ? "from-purple-50 to-purple-100"
                : "from-red-50 to-red-100";

            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                className={`bg-gradient-to-br ${gradientBg} to-white p-4 sm:p-5 lg:p-6 rounded-xl lg:rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer transform hover:scale-105`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                      {count}
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-gray-600">
                      {label}
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl shadow-sm group-hover:shadow-md transition-all duration-200 transform group-hover:scale-110">
                    <div
                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${colorClass} shadow-sm`}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
