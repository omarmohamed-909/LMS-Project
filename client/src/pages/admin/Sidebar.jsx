import { ChartNoAxesColumn, ClipboardList, SquareLibrary, Users } from "lucide-react";
import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const Sidebar = () => {
  const adminMobileLinks = [
    { to: "dashboard", label: "Dashboard", icon: ChartNoAxesColumn },
    { to: "course", label: "Courses", icon: SquareLibrary },
    { to: "users", label: "Users", icon: Users },
    { to: "quiz-dashboard", label: "Quiz", icon: ClipboardList },
  ];

  const linkClassName = ({ isActive }) =>
    `flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors ${
      isActive
        ? "bg-slate-100 text-slate-950 dark:bg-slate-900 dark:text-slate-100"
        : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
    }`;

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      <div className="hidden lg:block w-[250px] xl:w-[300px] space-y-8 border-r border-gray-300 dark:border-gray-700 p-5 sticky top-0 h-screen">
        <div className="space-y-4">
          <NavLink to="dashboard" className={linkClassName}>
            <ChartNoAxesColumn size={22} />
            <h1>Dashbord</h1>
          </NavLink>
          <NavLink to="course" className={linkClassName}>
            <SquareLibrary size={22} />
            <h1>Courses</h1>
          </NavLink>
          <NavLink to="users" className={linkClassName}>
            <Users size={22} />
            <h1>Users</h1>
          </NavLink>
          <NavLink to="quiz-dashboard" className={linkClassName}>
            <ClipboardList size={22} />
            <h1>Quiz Results</h1>
          </NavLink>
        </div>
      </div>
      <div className="min-w-0 flex-1 px-2 py-3 sm:px-3 sm:py-4 lg:px-6 lg:py-6 xl:px-8 xl:py-8">
        <div className="mb-3 lg:hidden">
          <div className="flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            {adminMobileLinks.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    }`
                  }
                >
                  <Icon size={14} />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </div>
        <Outlet  />
      </div>
    </div>
  );
};

export default Sidebar;
