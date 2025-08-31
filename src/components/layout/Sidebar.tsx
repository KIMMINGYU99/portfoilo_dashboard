import { Link, useLocation } from "react-router-dom";
import {
  FolderIcon,
  CalendarIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserIcon,
  // Cog6ToothIcon,
  // Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  { id: "projects", label: "Projects", icon: FolderIcon, href: "/" },
  { id: "calendar", label: "Calendar", icon: CalendarIcon, href: "/calendar" },
  {
    id: "techstack",
    label: "Tech Stack",
    icon: CodeBracketIcon,
    href: "/techstack",
  },
  { id: "blog", label: "Blog", icon: DocumentTextIcon, href: "/blog" },
  {
    id: "analytics",
    label: "Analytics",
    icon: ChartBarIcon,
    href: "/analytics",
  },
];

const supportItems = [
  { id: "profile", label: "Profile", icon: UserIcon, href: "/profile" },
];

const navItems = [...menuItems, ...supportItems];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 280 : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-800 z-50 lg:sticky lg:top-0 lg:h-screen lg:z-0 ${
          isOpen ? "lg:w-70" : "lg:w-0"
        } lg:opacity-100 overflow-y-auto overflow-x-hidden`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
            <a
              href="/"
              className="flex items-center space-x-3 select-none"
              aria-label="포트폴리오 홈으로 이동"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Portfolio
              </h1>
            </a>
            <button
              onClick={onToggle}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-primary-50 text-primary-700 border-r-2 border-primary-600 dark:bg-primary-900/20 dark:text-primary-300 dark:border-primary-400"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              ))}
              <div className="my-3 h-px bg-gray-200 dark:bg-gray-800" />
            </div>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                <UserIcon className="h-6 w-6 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  김민규
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  kmk4604@gmail.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
