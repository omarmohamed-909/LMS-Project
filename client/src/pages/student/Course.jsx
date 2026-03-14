import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, CircleDollarSign, Layers3 } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const Course = ({course}) => {
  const priceLabel =
    typeof course?.coursePrice === "number" && course.coursePrice > 0
      ? `${course.coursePrice} EGP`
      : "Free";

  return (
    <Link to={`/course-detail/${course._id}`} className="block h-full">
    <Card className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950">
      <div className="relative overflow-hidden">
        <img
          src={course.courseThumbnail}
          alt="course"
          className="block h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-slate-950/45 to-transparent" />
        <div className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-slate-900 shadow-sm transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </div>
      <CardContent className="flex flex-1 flex-col space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="line-clamp-2 min-h-12 text-base font-bold leading-6 text-slate-900 transition-colors group-hover:text-blue-700 dark:text-slate-100 dark:group-hover:text-blue-300">
            {course.courseTitle}
          </h1>
          <Badge className="shrink-0 rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300">
            {course.courseLevel || "All Levels"}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 ring-2 ring-slate-100 dark:ring-slate-800">
            <AvatarImage src={ course?.creator?.photoUrl ||"https://github.com/shadcn.png"} alt="creator avatar" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Instructor</p>
            <h1 className="line-clamp-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{course?.creator?.name || "Unknown creator"}</h1>
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between rounded-2xl bg-slate-50 px-3.5 py-3 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <Layers3 className="h-3.5 w-3.5 text-blue-600" />
            Structured learning
          </div>
          <div className="flex items-center gap-1.5 text-base font-bold text-slate-950 dark:text-slate-100">
            <CircleDollarSign className="h-3.5 w-3.5 text-blue-600" />
            <span>{priceLabel}</span>
          </div>
        </div>
      </CardContent>
    </Card>
    </Link>
  );
};

export default Course;
