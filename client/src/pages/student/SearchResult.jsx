import { Badge } from "@/components/ui/badge";
import { secureMediaUrl } from "@/lib/secureMediaUrl";
import React from "react";
import { Link } from "react-router-dom";

const SearchResult = ({ course }) => {
  const priceLabel =
    typeof course?.coursePrice === "number" && course.coursePrice > 0
      ? `${course.coursePrice} EGP`
      : "Free";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-950 md:p-4">
      <Link
        to={`/course-detail/${course._id}`}
        className="flex w-full flex-col gap-4 md:flex-row"
      >
        <img
          src={secureMediaUrl(course.courseThumbnail)}
          alt="course-thumbnial"
          className="h-40 w-full rounded-2xl object-cover md:h-32 md:w-56"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <h1 className="line-clamp-2 text-lg font-bold text-slate-900 dark:text-slate-100 md:text-xl">
              {course.courseTitle}
            </h1>
            <h2 className="shrink-0 text-base font-bold text-slate-900 dark:text-slate-100 md:text-lg">
              {priceLabel}
            </h2>
          </div>

          <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{course.subTitle}</p>
          <p className="text-sm text-slate-700 dark:text-slate-200">
            Instructor: <span className="font-bold">{course.creator?.name || "Unknown instructor"}</span>
          </p>
          <Badge className="mt-2 w-fit">{course.courseLevel || "All Levels"}</Badge>
        </div>
      </Link>
    </div>
  );
};

export default SearchResult;
