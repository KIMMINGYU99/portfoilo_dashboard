import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  BellIcon,
  Bars3Icon,
  MoonIcon,
  SunIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import ActionButton from "@components/common/ActionButton";

interface HeaderProps {
  onSidebarToggle: () => void;
}

export default function Header({ onSidebarToggle }: HeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // 초기 다크 모드 상태 로드 (localStorage > 시스템 설정)
    try {
      const saved = localStorage.getItem("theme");
      const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      const nextDark = saved ? saved === "dark" : prefersDark;
      setIsDarkMode(nextDark);
      const root = document.documentElement;
      if (nextDark) root.classList.add("dark");
      else root.classList.remove("dark");
    } catch {}

    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      if (
        (isMac && e.metaKey && e.key.toLowerCase() === "k") ||
        (!isMac && e.ctrlKey && e.key.toLowerCase() === "k")
      ) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("open-global-search"));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    try {
      const root = document.documentElement;
      if (next) {
        root.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        root.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    } catch {}
  };

  return (
    <header className="bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <ActionButton
            icon={Bars3Icon}
            iconOnly
            aria-label="사이드바 열기"
            onClick={onSidebarToggle}
            styles={{
              variantClass:
                "lg:hidden p-2 bg-white hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700",
            }}
          />

          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search or type command..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() =>
                window.dispatchEvent(new CustomEvent("open-global-search"))
              }
              className="pl-10 pr-4 py-2 w-80 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <kbd className="px-2 py-1 text-xs text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <ActionButton
            icon={isDarkMode ? SunIcon : MoonIcon}
            iconOnly
            aria-label="테마 전환"
            onClick={toggleDarkMode}
            styles={{
              variantClass:
                "p-2 bg-white hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300",
            }}
          />

          {/* Notifications */}
          <div className="relative">
            <ActionButton
              icon={BellIcon}
              iconOnly
              aria-label="알림"
              styles={{
                variantClass:
                  "p-2 bg-white hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300",
              }}
            />
            {/* Notification Badge */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                김민규
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Developer
              </p>
            </div>

            <div className="relative">
              <ActionButton
                icon={UserIcon}
                iconOnly
                aria-label="프로필로 이동"
                onClick={() => navigate("/profile")}
                styles={{
                  variantClass:
                    "w-8 h-8 p-1.5 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-full",
                  iconSizeClass: "w-5 h-5",
                }}
              />

              {/* Profile Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 hidden">
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Profile
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Settings
                </a>
                <hr className="my-1" />
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  Sign out
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
