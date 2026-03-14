import Course from "./Course";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetPublishedCourseQuery } from "@/features/api/courseApi";
import { BookOpen, Sparkles } from "lucide-react";
import React from "react";

const AllCourses = () => {
  const { data, isLoading, isError, error } = useGetPublishedCourseQuery();
  const courses = data?.courses ?? [];

  if (isError) {
    return (
      <section className="min-h-[calc(100vh-8rem)] bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-6 py-16 dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
        <div className="mx-auto max-w-7xl rounded-[30px] border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <h1 className="text-xl font-bold">Failed to load courses</h1>
          <p className="mt-2 text-sm">
            {error?.data?.message || "Something went wrong while fetching the courses."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-8rem)] bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] py-16 dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 rounded-4xl border border-slate-200/70 bg-white/80 p-8 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-300">
            <Sparkles className="h-4 w-4" />
            Explore our full catalog
          </div>
          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 dark:text-slate-100 md:text-5xl">
                All Courses
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
                Browse every published course in one place and jump directly into the topic that fits your next learning goal.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              <BookOpen className="h-4 w-4 text-blue-600 dark:text-cyan-300" />
              {courses.length} published courses
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, index) => <CourseSkeleton key={index} />)
            : courses.map((course) => <Course key={course._id} course={course} />)}
        </div>

        {!isLoading && courses.length === 0 && (
          <div className="mt-10 rounded-[28px] border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-950/50">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">No published courses yet</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Published courses will appear here once instructors make them available.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

const CourseSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <Skeleton className="h-44 w-full" />
      <div className="space-y-3 px-5 py-4">
        <Skeleton className="h-6 w-3/4" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  );
};

export default AllCourses;