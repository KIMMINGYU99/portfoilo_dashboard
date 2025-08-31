import React from "react";
import { HomeIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import ActionButton from "@components/common/ActionButton";

interface PageHeaderProps {
  // 브레드크럼 관련
  pageIcon: React.ComponentType<{ className?: string }>;
  pageName: string;

  // 헤더 컨텐츠
  title: string;
  description: string;

  // 액션 버튼 (선택적)
  actionButton?: {
    icon: React.ComponentType<{ className?: string }>;
    text: string;
    onClick: () => void;
  };

  // 추가 컨텐츠 (검색, 필터 등)
  children?: React.ReactNode;

  // 스타일 옵션
  centered?: boolean; // TechStack처럼 중앙 정렬할지 여부
}

const PageHeader: React.FC<PageHeaderProps> = ({
  pageIcon: PageIcon,
  pageName,
  title,
  description,
  actionButton,
  children,
  centered = false,
}) => {
  return (
    <div>
      {/* 브레드크럼 */}
      <nav className="flex mb-6 lg:mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <HomeIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
            <span className="inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              홈
            </span>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRightIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 mx-1" />
              <PageIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
              <span className="ml-1 text-sm font-medium text-primary-600 md:ml-2 dark:text-primary-400">
                {pageName}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* 헤더 */}
      <header className={`mb-8 lg:mb-10 ${centered ? "text-center" : ""}`}>
        <div
          className={`${
            centered
              ? "mb-6 lg:mb-8"
              : "flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 lg:gap-6 mb-6 lg:mb-8"
          }`}
        >
          <div className={centered ? "" : "flex-1"}>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 lg:mb-3">
              {title}
            </h1>
            <p
              className={`text-base lg:text-lg text-gray-600 dark:text-gray-400 leading-relaxed ${
                centered ? "max-w-2xl mx-auto" : ""
              }`}
            >
              {description}
            </p>
          </div>

          {actionButton && (
            <div className={centered ? "mb-8" : "w-full sm:w-auto"}>
              <ActionButton
                icon={actionButton.icon}
                text={actionButton.text}
                variant="primary"
                size="md"
                onClick={actionButton.onClick}
              />
            </div>
          )}
        </div>

        {/* 추가 컨텐츠 (검색, 필터 등) */}
        {children}
      </header>
    </div>
  );
};

export default PageHeader;
