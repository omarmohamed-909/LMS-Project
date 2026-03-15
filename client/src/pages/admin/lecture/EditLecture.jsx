import { Button } from "@/components/ui/button";
import { ArrowLeft, FileVideo, Sparkles } from "lucide-react";
import React from "react";
import { Link, useParams } from "react-router-dom";
import LectureTab from "./LectureTab";

const EditLecture = () => {
  const params = useParams();
  const courseId = params.courseId;
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-[linear-gradient(135deg,#020617_0%,#0f172a_100%)] sm:rounded-[30px] sm:p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/admin/course/${courseId}/lecture`}>
            <Button
              size="icon"
              variant="outline"
              className="rounded-full border-slate-200 bg-white/80 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-900"
            >
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
              Lecture editor
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-slate-100 sm:text-2xl">
              Update Your Lecture
            </h1>
          </div>
        </div>
        <div className="inline-flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-300 sm:w-auto">
          <FileVideo className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
          Manage title, preview access, uploads, and YouTube links
        </div>
      </div>
      <LectureTab />
    </div>
  );
};

export default EditLecture;
