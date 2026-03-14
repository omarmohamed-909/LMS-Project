import { ChartNoAxesColumn, ClipboardList, SquareLibrary, Users } from "lucide-react";
import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const Sidebar = () => {
  const linkClassName = ({ isActive }) =>
    `flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors ${
      isActive
        ? "bg-slate-100 text-slate-950 dark:bg-slate-900 dark:text-slate-100"
        : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
    }`;

  return (
    <div className="flex">
      <div className="hidden lg:block w-[250px] sm:w-[300px] space-y-8 border-r border-gray-300 dark:border-gray-700  p-5 sticky top-0 h-screen">
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
      <div className="flex-1 p-10">
        <Outlet  />
      </div>
    </div>
  );
};

export default Sidebar;
