import { BookOpen, Mail, School } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-[linear-gradient(135deg,#e0f2fe_0%,#f8fafc_32%,#eef2ff_68%,#dbeafe_100%)] dark:border-slate-800 dark:bg-[linear-gradient(135deg,#020617_0%,#0f172a_35%,#111827_100%)]">
      <div className="absolute inset-0 opacity-60 dark:opacity-100">
        <div className="absolute left-12 top-10 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-400/10" />
        <div className="absolute bottom-0 right-10 h-52 w-52 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-500/10" />
        <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-white/60 to-transparent dark:from-white/5" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-10 md:grid-cols-[1.3fr_0.9fr_0.9fr] md:px-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/80 p-2 text-blue-700 shadow-sm backdrop-blur dark:bg-blue-900/30 dark:text-blue-300">
              <School className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">E-Learning</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Practical courses for focused skill building</p>
            </div>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
            Learn through structured lessons, real projects, and guided progress that helps you move from theory to application.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Explore
          </h3>
          <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <Link to="/" className="flex items-center gap-2 transition-colors hover:text-blue-700 dark:hover:text-blue-300">
              <BookOpen className="h-4 w-4" />
              Home
            </Link>
            <Link to="/about-us" className="flex items-center gap-2 transition-colors hover:text-blue-700 dark:hover:text-blue-300">
              <BookOpen className="h-4 w-4" />
              About Us
            </Link>
            <Link to="/courses" className="flex items-center gap-2 transition-colors hover:text-blue-700 dark:hover:text-blue-300">
              <BookOpen className="h-4 w-4" />
              Courses
            </Link>
            <Link to="/course/search?query=" className="flex items-center gap-2 transition-colors hover:text-blue-700 dark:hover:text-blue-300">
              <BookOpen className="h-4 w-4" />
              Browse Courses
            </Link>
            <Link to="/my-learning" className="flex items-center gap-2 transition-colors hover:text-blue-700 dark:hover:text-blue-300">
              <BookOpen className="h-4 w-4" />
              My Learning
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Contact
          </h3>
          <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              om1478711@gmail.com
            </div>
            <p>Available for students and instructors across your learning workspace.</p>
          </div>
        </div>
      </div>

      <div className="relative border-t border-slate-200/80 px-6 py-4 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
        © 2026 OMAR. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;