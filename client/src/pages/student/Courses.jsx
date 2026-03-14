import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Course from "./Course";
import { useGetPublishedCourseQuery } from "@/features/api/courseApi";
import { BookOpen, Sparkles } from "lucide-react";



const Courses = () => {
  const {data,isLoading,isError}=useGetPublishedCourseQuery();
 
  if(isError) return <h1>Some error occured while fetching courses.</h1>

  
  return (
    <section className="bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] py-16 dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm dark:border dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-cyan-300" />
              Featured learning paths
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-950 dark:text-slate-100 md:text-4xl">
                Our Courses
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300 md:text-base">
                Browse hands-on courses designed to help you practice real concepts, not just read about them.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
            <BookOpen className="h-4 w-4 text-blue-600 dark:text-cyan-300" />
            {data?.courses?.length ?? 0} courses available
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <CourseSkeleton key={index} />
            ))
          ) : (
            data?.courses && data.courses.map((course, index)=><Course key={index} course={course}/>)
          )}
        </div>
      </div>
    </section>
  );
};

export default Courses;

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
