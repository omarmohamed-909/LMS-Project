import BuyCourseButton from "@/components/BuyCourseButton";
import PageSkeleton from "@/components/PageSkeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  useGetCourseDetailWithStatusQuery,
  useVerifyCheckoutSessionMutation,
} from "@/features/api/purchaseApi";

import {
  BadgeInfo,
  BookOpen,
  Clock3,
  Lock,
  PlayCircle,
  Users,
} from "lucide-react";
import React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import ReactPlayer from "react-player";
import { toast } from "sonner";

const CourseDetail = () => {
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedLectureId, setSelectedLectureId] = React.useState(null);
  const sessionId = searchParams.get("session_id");
  const { data, isLoading, isError, refetch } =
    useGetCourseDetailWithStatusQuery(courseId);
  const [verifyCheckoutSession, { isLoading: isVerifyingPayment }] =
    useVerifyCheckoutSessionMutation();

  const course = data?.course;
  const hasAccess = data?.hasAccess ?? false;
  const isFreeCourse = data?.isFreeCourse ?? false;
  const lectures = course?.lectures ?? [];
  const isPreviewLecture = (lecture) =>
    typeof lecture?.previewEnabledByAdmin === "boolean"
      ? Boolean(lecture.previewEnabledByAdmin && lecture.isPreviewFree)
      : Boolean(lecture?.isPreviewFree);
  const defaultLecture = hasAccess
    ? lectures.find((lecture) => lecture.videoUrl) || lectures[0]
    : lectures.find((lecture) => isPreviewLecture(lecture) && lecture.videoUrl);
  const selectedLecture =
    lectures.find((lecture) => lecture._id === selectedLectureId) || defaultLecture;
  const hasPreviewVideo = Boolean(selectedLecture?.videoUrl);
  const enrolledStudentsCount = course?.enrolledStudents?.length ?? 0;
  const lectureCount = lectures.length;
  const formattedUpdatedDate = course?.updatedAt?.split("T")[0] ?? "N/A";
  const isLectureAccessible = (lecture) => hasAccess || isPreviewLecture(lecture);
  const accessibleLecturesCount = lectures.filter((lecture) => isLectureAccessible(lecture)).length;
  const lockedLecturesCount = Math.max(lectureCount - accessibleLecturesCount, 0);
  const priceLabel =
    typeof course?.coursePrice === "number" && course.coursePrice > 0
      ? `${course.coursePrice} EGP`
      : "Free";

  React.useEffect(() => {
    if (!selectedLectureId && defaultLecture?._id) {
      setSelectedLectureId(defaultLecture._id);
    }
  }, [defaultLecture?._id, selectedLectureId]);

  React.useEffect(() => {
    if (!sessionId || hasAccess) {
      return;
    }

    let isMounted = true;

    const verifyPayment = async () => {
      try {
        const response = await verifyCheckoutSession({ sessionId, courseId }).unwrap();

        if (!isMounted) {
          return;
        }

        await refetch();
        toast.success(response.message);
        navigate(`/course-progress/${courseId}`, { replace: true });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        toast.error(error?.data?.message || "Failed to verify purchase.");
      }
    };

    verifyPayment();

    return () => {
      isMounted = false;
    };
  }, [sessionId, hasAccess, verifyCheckoutSession, courseId, refetch, navigate]);

  if (isLoading) return <PageSkeleton variant="courseDetail" />;
  if (isError) return <h1>Failed to load course details</h1>;
  if (sessionId && !hasAccess && isVerifyingPayment) {
    return <h1>Confirming your payment...</h1>;
  }

  const handleContinueCourse = () => {
    if (hasAccess) {
      navigate(`/course-progress/${courseId}`);
    }
  };

  const handleSelectLecture = (lecture) => {
    if (!isLectureAccessible(lecture)) {
      return;
    }

    setSelectedLectureId(lecture._id);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_48%,#f8fafc_100%)] pt-5 text-slate-950 dark:bg-[linear-gradient(180deg,#020617_0%,#081226_42%,#020617_100%)] dark:text-slate-100">
      <div className="border-b border-slate-200/70 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_52%,#0f172a_100%)] text-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.8)] dark:border-slate-800/70 dark:bg-[linear-gradient(135deg,#020617_0%,#0f172a_35%,#0f3a69_100%)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-10 md:px-8 lg:flex-row lg:items-end lg:justify-between lg:gap-8 lg:py-14">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-blue-100 backdrop-blur">
              <BookOpen className="h-3.5 w-3.5" />
              Course Overview
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl">
            {course?.courseTitle}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-200 md:text-base">
              {course?.subTitle || "Master the course step by step with guided lectures and practical lessons."}
            </p>
            <p className="text-sm text-slate-200 md:text-base">
              Created By{" "}
              <span className="font-semibold text-cyan-200 underline underline-offset-4">
                {course?.creator?.name || "Unknown instructor"}
              </span>
            </p>
          </div>
          <div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
                <BadgeInfo className="h-3.5 w-3.5" />
                Updated
              </div>
              <p className="mt-3 text-sm font-semibold text-white">{formattedUpdatedDate}</p>
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
                <Users className="h-3.5 w-3.5" />
                Students
              </div>
              <p className="mt-3 text-sm font-semibold text-white">{enrolledStudentsCount} enrolled</p>
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
                <Clock3 className="h-3.5 w-3.5" />
                Lectures
              </div>
              <p className="mt-3 text-sm font-semibold text-white">{lectureCount} lessons</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:px-8 lg:flex-row lg:items-start lg:gap-10 lg:py-10">
        <div className="order-2 w-full space-y-6 lg:order-1 lg:min-w-0 lg:flex-1">
          <div className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.45)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-[0_24px_70px_-45px_rgba(59,130,246,0.45)] md:p-8">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-10 w-1 rounded-full bg-blue-600 dark:bg-cyan-400" />
              <h1 className="text-xl font-bold md:text-2xl">Description</h1>
            </div>
          <p
            className="prose prose-slate max-w-none text-sm leading-7 dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: course?.description || "No description available." }}
          />
          </div>
          <Card className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.45)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-[0_24px_70px_-45px_rgba(59,130,246,0.45)]">
            <CardHeader className="border-b border-slate-200/70 pb-5 dark:border-slate-800">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <CardTitle className="text-xl">Course Content</CardTitle>
                  <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                    {lectureCount} lectures available in this course
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    {accessibleLecturesCount} accessible
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {lockedLecturesCount} locked
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-5 md:p-6">
              {lectures.map((lecture, index) => (
                <button
                  key={lecture._id}
                  type="button"
                  onClick={() => handleSelectLecture(lecture)}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-all ${
                    selectedLecture?._id === lecture._id
                      ? "border-blue-200 bg-blue-50 text-slate-900 shadow-sm dark:border-cyan-500/40 dark:bg-cyan-500/10 dark:text-slate-100"
                      : "border-transparent bg-slate-50/90 hover:border-slate-200 hover:bg-slate-100 dark:bg-slate-900/80 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                  } ${
                    isLectureAccessible(lecture)
                      ? "cursor-pointer"
                      : "cursor-not-allowed opacity-70"
                  }`}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm dark:bg-slate-950 dark:text-slate-200">
                    {isLectureAccessible(lecture) ? <PlayCircle size={16} /> : <Lock size={16} />}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p>{lecture.lectureTitle || `Lecture ${index + 1}`}</p>
                    </div>
                    {!isLectureAccessible(lecture) && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Available after purchase
                      </p>
                    )}
                  </div>
                  {!isLectureAccessible(lecture) && (
                    <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      Locked
                    </span>
                  )}
                </button>
              ))}
              {lectureCount === 0 && (
                <p className="text-sm text-muted-foreground">No lectures added yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="order-1 w-full lg:order-2 lg:sticky lg:top-24 lg:w-[390px] lg:shrink-0">
          <Card className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.55)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/85 dark:shadow-[0_28px_80px_-40px_rgba(59,130,246,0.45)]">
            <CardContent className="space-y-5 p-5 md:p-6">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-black shadow-lg dark:border-slate-800">
                {hasPreviewVideo ? (
                  <ReactPlayer
                    width="100%"
                    height={"100%"}
                    src={selectedLecture.videoUrl}
                    controls={true}
                    className="aspect-video"
                  />
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-slate-100 px-4 text-center text-sm text-muted-foreground dark:bg-slate-900">
                    {hasAccess
                      ? "No lecture video is available yet."
                      : "No free preview is available for this course."}
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  Preview Lecture
                </p>
                <h1 className="text-2xl font-bold leading-snug text-gray-900 dark:text-gray-100">
                  {selectedLecture?.lectureTitle || "Preview not available"}
                </h1>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-100 px-4 py-3 dark:bg-slate-900">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Access
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {hasAccess ? "Unlocked" : "Preview only"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 px-4 py-3 dark:bg-slate-900">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Price
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {hasAccess ? "Included" : priceLabel}
                    </p>
                  </div>
                </div>
              </div>
              {!hasAccess && !isFreeCourse && (
                <div className="rounded-2xl border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#dbeafe_100%)] px-4 py-4 dark:border-cyan-500/20 dark:bg-[linear-gradient(135deg,rgba(8,47,73,0.82)_0%,rgba(12,74,110,0.42)_100%)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-cyan-100/80">
                    Course Price
                  </p>
                  <h1 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
                    {priceLabel}
                  </h1>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Unlock every lecture and continue the course without restrictions.
                  </p>
                </div>
              )}
            </CardContent>
            <Separator className="bg-slate-200 dark:bg-slate-800" />
            <CardFooter className={"p-5 md:p-6"}>
              {hasAccess ? (
                <Button
                  onClick={handleContinueCourse}
                  className={"h-12 w-full rounded-xl bg-blue-600 text-base font-semibold hover:bg-blue-700 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"}
                >
                  Continue Course
                </Button>
              ) : (
                <BuyCourseButton courseId={courseId} />
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
