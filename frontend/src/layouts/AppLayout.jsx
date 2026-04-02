import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/common/Sidebar.jsx";
import Topbar from "../components/common/Topbar.jsx";
import { useLocalStorage } from "../hooks/useLocalStorage.js";

const AppLayout = () => {
  const [theme, setTheme] = useLocalStorage("pos-theme", "light");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Collapsed state

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="app-shell">
      <div className={`sidebar-wrap open ${sidebarCollapsed ? "collapsed" : ""}`}>
        <Sidebar
          onNavigate={() => {}}
          onToggleSidebar={toggleSidebar}
          theme={theme}
          onSetTheme={setTheme}
          isCollapsed={sidebarCollapsed}
        />
      </div>
      <div className="main-wrap">
        <Topbar onOpenMenu={toggleSidebar} onResetTheme={setTheme} />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
