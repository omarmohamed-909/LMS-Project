import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const bars = (count, className = "h-4 w-full") =>
  Array.from({ length: count }).map((_, index) => (
    <Skeleton key={index} className={className} />
  ));

const DefaultSkeleton = () => (
  <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 md:px-8">
    <Card className="border-slate-200 shadow-sm dark:border-slate-800">
      <CardContent className="space-y-4 p-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-full max-w-2xl" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </CardContent>
    </Card>
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="border-slate-200 shadow-sm dark:border-slate-800">
        <CardContent className="space-y-4 p-6">{bars(6)}</CardContent>
      </Card>
      <Card className="border-slate-200 shadow-sm dark:border-slate-800">
        <CardContent className="space-y-4 p-6">
          <Skeleton className="aspect-video w-full rounded-2xl" />
          {bars(4)}
        </CardContent>
      </Card>
    </div>
  </div>
);

const DashboardSkeleton = () => (
  <div className="space-y-6 p-4">
    <Card className="border-slate-200 shadow-sm dark:border-slate-800">
      <CardContent className="space-y-3 p-6">
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="h-9 w-80 max-w-full" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </CardContent>
    </Card>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="border-slate-200 shadow-sm dark:border-slate-800">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-12 w-12 rounded-2xl" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    <Card className="border-slate-200 shadow-sm dark:border-slate-800">
      <CardHeader className="space-y-3">
        <Skeleton className="h-6 w-56" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </CardContent>
    </Card>
  </div>
);

const ProfileSkeleton = () => (
  <div className="mx-auto my-10 max-w-6xl space-y-8 px-4">
    <Card className="border-slate-200 shadow-sm dark:border-slate-800">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Skeleton className="h-28 w-28 rounded-full md:h-32 md:w-32" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-52" />
              <div className="grid gap-3 sm:grid-cols-2">
                <Skeleton className="h-16 w-64 max-w-full rounded-2xl" />
                <Skeleton className="h-16 w-64 max-w-full rounded-2xl" />
              </div>
            </div>
          </div>
          <Skeleton className="h-11 w-36 rounded-2xl" />
        </div>
      </CardContent>
    </Card>
    <div className="space-y-4">
      <Skeleton className="h-8 w-44" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-80 w-full rounded-[28px]" />
        ))}
      </div>
    </div>
  </div>
);

const CourseDetailSkeleton = () => (
  <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_48%,#f8fafc_100%)] pt-5 dark:bg-[linear-gradient(180deg,#020617_0%,#081226_42%,#020617_100%)]">
    <div className="border-b border-slate-200/70 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_52%,#0f172a_100%)] px-4 py-10 md:px-8 lg:py-14">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
        <div className="w-full max-w-3xl space-y-4">
          <Skeleton className="h-7 w-40 rounded-full bg-white/20" />
          <Skeleton className="h-12 w-full max-w-2xl bg-white/20" />
          <Skeleton className="h-4 w-full max-w-xl bg-white/20" />
          <Skeleton className="h-4 w-56 bg-white/20" />
        </div>
        <div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-2xl bg-white/15" />
          ))}
        </div>
      </div>
    </div>
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:px-8 lg:grid-cols-[1fr_360px] lg:items-start lg:gap-10 lg:py-10">
      <div className="space-y-6">
        <Card className="border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
          <CardContent className="space-y-4 p-8">
            <Skeleton className="h-8 w-44" />
            {bars(6)}
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
          <CardContent className="space-y-4 p-8">
            <Skeleton className="h-8 w-48" />
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full rounded-2xl" />
            ))}
          </CardContent>
        </Card>
      </div>
      <Card className="border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
        <CardContent className="space-y-4 p-6">
          <Skeleton className="aspect-video w-full rounded-3xl" />
          <Skeleton className="h-9 w-32" />
          {bars(4)}
          <Skeleton className="h-12 w-full rounded-2xl" />
        </CardContent>
      </Card>
    </div>
  </div>
);

const FormSkeleton = () => (
  <Card className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-950">
    <CardHeader className="space-y-3 border-b border-slate-200/70 bg-slate-50/80 px-6 py-5 dark:border-slate-800 dark:bg-slate-900/40">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-full max-w-xl" />
    </CardHeader>
    <CardContent className="space-y-6 p-6 md:p-8">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="border-slate-200 shadow-sm dark:border-slate-800">
              <CardContent className="space-y-3 p-5">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-12 w-full rounded-2xl" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={index} className="border-slate-200 shadow-sm dark:border-slate-800">
              <CardContent className="space-y-4 p-5">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-12 w-full rounded-2xl" />
                <Skeleton className="h-12 w-full rounded-2xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

const CourseProgressSkeleton = () => (
  <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-8 md:py-8">
    <Card className="border-slate-200 shadow-sm dark:border-slate-800">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-9 w-full max-w-2xl" />
        <Skeleton className="h-2 w-full rounded-full" />
      </CardContent>
    </Card>
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card className="border-slate-200 shadow-sm dark:border-slate-800">
        <CardContent className="space-y-4 p-6">
          <Skeleton className="aspect-video w-full rounded-3xl" />
          <Skeleton className="h-6 w-48" />
          {bars(3)}
        </CardContent>
      </Card>
      <Card className="border-slate-200 shadow-sm dark:border-slate-800">
        <CardContent className="space-y-3 p-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-2xl" />
          ))}
        </CardContent>
      </Card>
    </div>
  </div>
);

const ListSkeleton = ({ items = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, index) => (
      <Skeleton key={index} className="h-16 w-full rounded-2xl" />
    ))}
  </div>
);

const FullPageSkeleton = () => (
  <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-10 dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_100%)] md:px-8">
    <div className="mx-auto max-w-6xl space-y-6">
      <Card className="border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
        <CardContent className="space-y-4 p-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-full max-w-2xl" />
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full rounded-3xl" />
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-72 w-full rounded-[28px]" />
        ))}
      </div>
    </div>
  </div>
);

const skeletonVariants = {
  default: <DefaultSkeleton />,
  dashboard: <DashboardSkeleton />,
  profile: <ProfileSkeleton />,
  courseDetail: <CourseDetailSkeleton />,
  form: <FormSkeleton />,
  courseProgress: <CourseProgressSkeleton />,
  fullPage: <FullPageSkeleton />,
};

const PageSkeleton = ({ variant = "default" }) => {
  return skeletonVariants[variant] || skeletonVariants.default;
};

export { ListSkeleton };
export default PageSkeleton;