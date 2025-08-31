import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";

// Pages
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import TechStack from "./pages/TechStack";
import Blog from "./pages/Blog";
import Analytics from "./pages/Analytics";
import ProjectDetailPage from "./pages/ProjectDetailPage";

// Components
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import GlobalSearchModal from "./components/modals/GlobalSearchModal";
import Profile from "./pages/Profile";

import { queryClient } from "@services/queryClient";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  // Listen to global open event from Header
  useEffect(() => {
    const open = () => setSearchOpen(true);
    window.addEventListener("open-global-search", open as any);
    return () => window.removeEventListener("open-global-search", open as any);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:flex">
          {/* Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />

          {/* Main Content */}
          <div className="flex-1 flex flex-col lg:min-h-screen">
            <Header onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/techstack" element={<TechStack />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/projects/:id" element={<ProjectDetailPage />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </main>
          </div>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
            }}
          />
        </div>
        <GlobalSearchModal
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
        />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
