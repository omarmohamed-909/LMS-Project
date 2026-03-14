import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Course from "./Course";
import { useGetPublishedCourseQuery } from "@/features/api/courseApi";
import { BookOpen, Sparkles } from "lucide-react";

const COURSE_CACHE_KEY = "lms_published_courses_cache";

const getCachedCourses = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(COURSE_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveCachedCourses = (courses) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(COURSE_CACHE_KEY, JSON.stringify(courses));
  } catch {
    // Ignore storage failures.
  }
};


const Courses = () => {
  const [cachedCourses, setCachedCourses] = React.useState(() => getCachedCourses());
  const retryAttemptsRef = React.useRef(0);
  const { data, isLoading, isError, error, refetch } = useGetPublishedCourseQuery();
  const liveCourses = Array.isArray(data?.courses) ? data.courses : [];
  const courses = liveCourses.length > 0 ? liveCourses : cachedCourses;
  const isUsingCachedCourses = liveCourses.length === 0 && cachedCourses.length > 0;

  React.useEffect(() => {
    if (liveCourses.length > 0) {
      setCachedCourses(liveCourses);
      saveCachedCourses(liveCourses);
    }
  }, [liveCourses]);

  React.useEffect(() => {
    if (!isError) {
      retryAttemptsRef.current = 0;
      return;
    }

    if (retryAttemptsRef.current >= 2) {
      return;
    }

    const timeoutId = setTimeout(() => {
      retryAttemptsRef.current += 1;
      refetch();
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [isError, refetch]);

  if (isError && courses.length === 0) {
    return (
      <section className="bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] py-16 dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            <h2 className="text-xl font-bold">Failed to load courses</h2>
            <p className="mt-2 text-sm">
              {error?.data?.message || "Something went wrong while fetching courses."}
            </p>
            <Button
              type="button"
              onClick={refetch}
              className="mt-4 h-10 rounded-xl bg-red-600 px-4 text-sm font-semibold hover:bg-red-700"
            >
              Retry
            </Button>
          </div>
        </div>
      </section>
    );
  }

  
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
            {courses.length} courses available
          </div>
        </div>

        {isUsingCachedCourses && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            You are viewing the latest cached courses due to a temporary connection issue.
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <CourseSkeleton key={index} />
            ))
          ) : (
            courses.map((course) => <Course key={course._id} course={course} />)
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
