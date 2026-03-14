import { Button } from "@/components/ui/button";
import { BookOpenCheck, Sparkles } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import CourseTab from "./CourseTab";

const EditCourse = () => {
  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col gap-4 rounded-[30px] border border-slate-200/80 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] p-6 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-[linear-gradient(135deg,#020617_0%,#0f172a_100%)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            Course setup
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 dark:text-slate-100">
            Add detail information regarding course
          </h1>
        </div>
        <Link to="lecture">
          <Button className="h-11 rounded-2xl px-5 font-semibold" variant="outline">
            <BookOpenCheck className="mr-2 h-4 w-4" />
            Go to lecture page
          </Button>
        </Link>
      </div>
      <div className="max-w-5xl py-2">
      <CourseTab/>
      </div>
    </div>
  );
};

export default EditCourse;
