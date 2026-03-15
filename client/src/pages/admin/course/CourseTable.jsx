import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetCreatorCourseQuery } from "@/features/api/courseApi";
import { Edit, PlusCircle, SquareLibrary, Wallet } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const CourseTable = () => {
  const { data, isLoading, isError, error } = useGetCreatorCourseQuery();
  const navigate = useNavigate();
  const courses = data?.courses ?? [];
  const publishedCourses = courses.filter((course) => course?.isPublished).length;
  const draftCourses = courses.length - publishedCourses;
  const totalCourseValue = courses.reduce(
    (total, course) => total + (Number(course?.coursePrice) || 0),
    0
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-3xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-[30px] border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
        <h1 className="text-lg font-semibold">Failed to load courses</h1>
        <p className="text-sm">
          {error?.data?.message || "Something went wrong while fetching your courses."}
        </p>
        <Button onClick={() => navigate("create")}>Create a new course</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-[linear-gradient(135deg,#020617_0%,#0f172a_100%)] sm:rounded-[30px] sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-300">
            <SquareLibrary className="h-3.5 w-3.5" />
            Course Manager
          </div>
          <div>
            <h1 className="text-[2rem] font-extrabold tracking-tight text-slate-950 dark:text-slate-100 sm:text-3xl">
              Your courses
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Manage published and draft courses from one place.
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate("create")}
          className="h-11 rounded-2xl bg-blue-600 px-5 text-sm font-semibold hover:bg-blue-700 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400 sm:h-12 sm:text-base"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create a new course
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:rounded-3xl sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Total courses
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-950 dark:text-slate-100 sm:mt-3 sm:text-3xl">
            {courses.length}
          </h2>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:rounded-3xl sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Published / Draft
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-950 dark:text-slate-100 sm:mt-3 sm:text-3xl">
            {publishedCourses} / {draftCourses}
          </h2>
        </div>
        <div className="col-span-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:rounded-3xl sm:p-5 md:col-span-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            <Wallet className="h-3.5 w-3.5" />
            Total value
          </div>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-950 dark:text-slate-100 sm:mt-3 sm:text-3xl">
            {totalCourseValue} EGP
          </h2>
        </div>
      </div>

      <div className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-950">
        <div className="border-b border-slate-200/70 px-6 py-5 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-950 dark:text-slate-100">Course list</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            A quick view of pricing, status, and edit actions.
          </p>
        </div>

        <div className="space-y-3 px-3 pb-4 pt-3 md:hidden">
          {courses.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              No courses found yet.
            </div>
          ) : (
            courses.map((course) => (
              <div
                key={course._id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <p className="line-clamp-2 text-sm font-semibold leading-6 text-slate-900 dark:text-slate-100">
                    {course.courseTitle}
                  </p>
                  <Badge
                    className={
                      course.isPublished
                        ? "shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300"
                        : "shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] text-amber-700 hover:bg-amber-100 dark:bg-amber-500/15 dark:text-amber-300"
                    }
                  >
                    {course.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {course?.coursePrice ? `${course.coursePrice} EGP` : "NA"}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 rounded-xl border-slate-200 bg-white px-3 text-xs font-semibold hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-900"
                    onClick={() => navigate(`${course._id}`)}
                  >
                    <Edit className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden px-2 pb-3 pt-1 md:block md:px-4">
          <Table>
            <TableCaption className="pb-4">A list of your recent courses.</TableCaption>
            <TableHeader>
              <TableRow className="border-slate-200 dark:border-slate-800">
                <TableHead className="w-[140px] px-4 py-4">Price</TableHead>
                <TableHead className="px-4 py-4">Status</TableHead>
                <TableHead className="px-4 py-4">Title</TableHead>
                <TableHead className="px-4 py-4 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course._id} className="border-slate-200 dark:border-slate-800">
                  <TableCell className="px-4 py-4 font-semibold text-slate-900 dark:text-slate-100">
                    {course?.coursePrice ? `${course.coursePrice} EGP` : "NA"}
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <Badge
                      className={
                        course.isPublished
                          ? "rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300"
                          : "rounded-full bg-amber-100 px-3 py-1 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/15 dark:text-amber-300"
                      }
                    >
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-4 font-medium text-slate-700 dark:text-slate-200">
                    {course.courseTitle}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl border-slate-200 bg-white hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-900"
                      onClick={() => navigate(`${course._id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {courses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    No courses found yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default CourseTable;
