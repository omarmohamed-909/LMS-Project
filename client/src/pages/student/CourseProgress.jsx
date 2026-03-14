import { Badge } from "@/components/ui/badge";
import PageSkeleton from "@/components/PageSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  useAddLectureCommentMutation,
  useCompleteCourseMutation,
  useDeleteLectureCommentMutation,
  useGetCourseProgressQuery,
  useGetLectureCommentsQuery,
  useIncompleteCourseMutation,
  useTogglePinLectureCommentMutation,
  useUpdateLectureProgressMutation,
  useSubmitQuizResultMutation,
} from "@/features/api/courseProgressApi";
import { useSelector } from "react-redux";
import { CheckCircle, CheckCircle2, CirclePlay, CornerDownRight, ListChecks, MessageSquare, Pin, PinOff, PlayCircle, Send, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const CourseProgress = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const courseId = params.courseId;
  const { data, isLoading, isError, refetch } =
    useGetCourseProgressQuery(courseId);

  const [updateLectureProgress] = useUpdateLectureProgressMutation();
  const [completeCourse, { isLoading: isCompletingCourse }] =
    useCompleteCourseMutation();
  const [incompleteCourse, { isLoading: isResettingCourse }] =
    useIncompleteCourseMutation();
  const [addLectureComment, { isLoading: isAddingComment }] =
    useAddLectureCommentMutation();
  const [deleteLectureComment, { isLoading: isDeletingComment }] =
    useDeleteLectureCommentMutation();
  const [togglePinLectureComment, { isLoading: isPinningComment }] =
    useTogglePinLectureCommentMutation();
  const [submitQuizResult, { isLoading: isSubmittingQuizResult }] =
    useSubmitQuizResultMutation();

  const [curerntLecture, setCurrentLecture] = useState(null);
  const [contentViewMode, setContentViewMode] = useState("video");
  const [commentText, setCommentText] = useState("");
  const [activeReplyFor, setActiveReplyFor] = useState(null);
  const [replyTextByComment, setReplyTextByComment] = useState({});
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizCompletedByLecture, setQuizCompletedByLecture] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem(`lecture-quiz-completed:${courseId}`) || "{}");
    } catch {
      return {};
    }
  });
  const { user } = useSelector((store) => store.auth);
  const lectures = data?.data?.courseDetails?.lectures ?? [];
  const activeLectureId = curerntLecture?._id || lectures[0]?._id || "";
  const requestedLectureId = searchParams.get("lectureId");
  const { data: commentsData, isLoading: commentsLoading } = useGetLectureCommentsQuery(
    { courseId, lectureId: activeLectureId },
    { skip: !activeLectureId }
  );

  useEffect(() => {
    const availableLectures = data?.data?.courseDetails?.lectures;

    if (!requestedLectureId || !availableLectures?.length) {
      return;
    }

    const matchedLecture = availableLectures.find(
      (lecture) => lecture._id === requestedLectureId
    );

    if (matchedLecture) {
      setCurrentLecture(matchedLecture);
    }
  }, [requestedLectureId, data?.data?.courseDetails?.lectures]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        `lecture-quiz-completed:${courseId}`,
        JSON.stringify(quizCompletedByLecture)
      );
    } catch {
      // Ignore storage failures.
    }
  }, [quizCompletedByLecture, courseId]);

  if (isLoading) {
    return <PageSkeleton variant="courseProgress" />;
  }
  if (isError) {
    return <p>Faild to load course details</p>;
  }

  const { courseDetails, progress, completed } = data.data;
  const { courseTitle } = courseDetails;

  // initialze the first lecture is not exist
  const initialLecture =
    curerntLecture || (courseDetails.lectures && courseDetails.lectures[0]);
  const activeLecture = curerntLecture || initialLecture;
  const comments = commentsData?.comments ?? [];
  const topLevelComments = comments.filter((comment) => !comment.parentCommentId);
  const repliesByParentId = comments.reduce((map, comment) => {
    if (!comment.parentCommentId) {
      return map;
    }

    const parentId = comment.parentCommentId.toString();
    if (!map[parentId]) {
      map[parentId] = [];
    }
    map[parentId].push(comment);
    return map;
  }, {});
  const isLectureVideoCompleted = (lectureId) =>
    progress.some((prog) => prog.lectureId === lectureId && prog.viewed);

  const isLectureQuizCompleted = (lecture) => {
    const quizCount = lecture?.quizQuestions?.length || 0;
    if (!quizCount) {
      return true;
    }

    return Boolean(quizCompletedByLecture[lecture._id]);
  };

  const isLectureFullyCompleted = (lecture) =>
    isLectureVideoCompleted(lecture._id) && isLectureQuizCompleted(lecture);

  const completedLecturesCount = courseDetails.lectures.filter((lecture) =>
    isLectureFullyCompleted(lecture)
  ).length;
  const progressValue = courseDetails.lectures.length
    ? Math.round((completedLecturesCount / courseDetails.lectures.length) * 100)
    : 0;
  const activeLectureIndex = courseDetails.lectures.findIndex(
    (lecture) => lecture._id === activeLecture?._id
  );
  const lectureQuizQuestions = activeLecture?.quizQuestions ?? [];
  const totalQuizQuestions = lectureQuizQuestions.length;
  const answeredQuizQuestionsCount = Object.keys(quizAnswers).length;
  const quizScore = lectureQuizQuestions.reduce((score, question, index) => {
    return quizAnswers[index] === question.correctOptionIndex ? score + 1 : score;
  }, 0);

  const isLectureCompleted = (lectureId) => {
    const lecture = courseDetails.lectures.find((item) => item._id === lectureId);
    if (!lecture) {
      return false;
    }

    return isLectureFullyCompleted(lecture);
  };

  const handleLectureProgress = async (lectureId) => {
    if (!lectureId || isLectureCompleted(lectureId)) {
      return;
    }

    try {
      await updateLectureProgress({ courseId, lectureId }).unwrap();
      await refetch();

      const allCompleted = courseDetails.lectures.every((lec) =>
        progress.some((prog) => prog.lectureId === lec._id && prog.viewed) || lec._id === lectureId
      );

      if (allCompleted && !completed) {
        const response = await completeCourse(courseId).unwrap();
        await refetch();
        toast.success(response?.message || "Course marked as completed.", {
          id: `course-complete-${courseId}`,
        });
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update lecture progress.", {
        id: `course-progress-error-${courseId}`,
      });
    }
  };

  //handle select a specific lecture to watch
  const handleSelectLecture = (lecture) => {
    setCurrentLecture(lecture);
    setContentViewMode("video");
    setQuizAnswers({});
    setShowQuizResult(false);
  };

  const handleOpenLectureVideo = (lecture) => {
    setCurrentLecture(lecture);
    setContentViewMode("video");
  };

  const handleOpenLectureQuiz = (lecture) => {
    setCurrentLecture(lecture);
    setContentViewMode("quiz");
    setQuizAnswers({});
    setShowQuizResult(false);
  };

  

  const handleCompleteCourse = async () => {
    try {
      const response = await completeCourse(courseId).unwrap();
      await refetch();
      toast.success(response?.message || "Course marked as completed.", {
        id: `course-complete-${courseId}`,
      });
    } catch (error) {
      toast.error(error?.data?.message || "Failed to mark course as complete.", {
        id: `course-complete-error-${courseId}`,
      });
    }
  };
  const handleInCompleteCourse = async () => {
    try {
      const response = await incompleteCourse(courseId).unwrap();
      await refetch();
      toast.success(response?.message || "Course marked as incomplete.", {
        id: `course-incomplete-${courseId}`,
      });
    } catch (error) {
      toast.error(error?.data?.message || "Failed to mark course as incomplete.", {
        id: `course-incomplete-error-${courseId}`,
      });
    }
  };

  const handleAddComment = async () => {
    const normalizedComment = commentText.trim();

    if (!normalizedComment || !activeLecture?._id) {
      return;
    }

    try {
      const response = await addLectureComment({
        courseId,
        lectureId: activeLecture._id,
        text: normalizedComment,
      }).unwrap();
      setCommentText("");
      toast.success(response?.message || "Comment added successfully.");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to add comment.");
    }
  };

  const handleAddReply = async (parentCommentId) => {
    const normalizedReply = (replyTextByComment[parentCommentId] || "").trim();

    if (!normalizedReply || !activeLecture?._id) {
      return;
    }

    try {
      const response = await addLectureComment({
        courseId,
        lectureId: activeLecture._id,
        text: normalizedReply,
        parentCommentId,
      }).unwrap();

      setReplyTextByComment((currentValue) => ({
        ...currentValue,
        [parentCommentId]: "",
      }));
      setActiveReplyFor(null);
      toast.success(response?.message || "Reply added successfully.");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to add reply.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!activeLecture?._id) {
      return;
    }

    try {
      const response = await deleteLectureComment({
        courseId,
        lectureId: activeLecture._id,
        commentId,
      }).unwrap();
      toast.success(response?.message || "Comment deleted successfully.");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete comment.");
    }
  };

  const handleTogglePinnedComment = async (commentId) => {
    if (!activeLecture?._id) {
      return;
    }

    try {
      const response = await togglePinLectureComment({
        courseId,
        lectureId: activeLecture._id,
        commentId,
      }).unwrap();

      toast.success(response?.message || "Comment pin status updated.");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update pinned comment.");
    }
  };

  const updateQuizAnswer = (questionIndex, optionIndex) => {
    setQuizAnswers((currentValue) => ({
      ...currentValue,
      [questionIndex]: optionIndex,
    }));
  };

  const submitQuiz = async () => {
    if (!totalQuizQuestions) {
      return;
    }

    if (answeredQuizQuestionsCount !== totalQuizQuestions) {
      toast.error("Please answer all quiz questions first.");
      return;
    }

    if (!activeLecture?._id) {
      return;
    }

    // Show correction feedback immediately, then persist in background.
    setShowQuizResult(true);

    try {
      const response = await submitQuizResult({
        courseId,
        lectureId: activeLecture._id,
        score: quizScore,
        totalQuestions: totalQuizQuestions,
      }).unwrap();

      setQuizCompletedByLecture((currentValue) => ({
        ...currentValue,
        [activeLecture._id]: true,
      }));

      if (typeof response?.remainingAttempts === "number") {
        toast.success(
          `Quiz submitted. Remaining attempts: ${response.remainingAttempts}`
        );
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to submit quiz result.");
    }
  };

  const shouldShowComments = contentViewMode !== "quiz";

  const commentsSection = (
    <div className="rounded-3xl border border-slate-200/90 bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] p-4 shadow-sm dark:border-slate-800 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.55)_0%,rgba(15,23,42,0.3)_100%)] md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
          <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Comments
          </h4>
        </div>
        <Badge variant="outline" className="rounded-full border-slate-300 bg-white/70 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-300">
          {topLevelComments.length} threads
        </Badge>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <textarea
          value={commentText}
          onChange={(event) => setCommentText(event.target.value)}
          placeholder="Write a comment about this lecture"
          className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-cyan-500/70 dark:focus:ring-cyan-500/10"
        />
        <div className="flex justify-end">
          <Button
            onClick={handleAddComment}
            disabled={isAddingComment || !commentText.trim() || !activeLecture?._id}
            className="rounded-2xl bg-slate-700 text-slate-100 hover:bg-slate-800 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white"
          >
            <Send className="mr-2 h-4 w-4" />
            {isAddingComment ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </div>

      <div className="mt-5 space-y-3.5">
        {commentsLoading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No comments yet. Start the discussion for this lecture.
          </p>
        ) : (
          topLevelComments.map((comment) => {
            const canDelete =
              user?._id === comment.userId?._id || user?.role === "instructor";
            const canPin = user?.role === "instructor";
            const commenterName = comment.userId?.name || "User";
            const commenterInitials = commenterName
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2);
            const replies = repliesByParentId[comment._id] || [];

            return (
              <div
                key={comment._id}
                className={`rounded-2xl border bg-white p-4 shadow-[0_10px_25px_-20px_rgba(15,23,42,0.6)] transition hover:border-slate-300 dark:bg-slate-950 dark:hover:border-slate-700 ${
                  comment.isPinned
                    ? "border-amber-300/90 ring-1 ring-amber-200 dark:border-amber-400/40 dark:ring-amber-500/20"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <Avatar className="h-10 w-10 shrink-0 ring-2 ring-slate-200 dark:ring-slate-700">
                      <AvatarImage
                        src={comment.userId?.photoUrl || "https://github.com/shadcn.png"}
                        alt={commenterName}
                      />
                      <AvatarFallback className="text-xs font-semibold uppercase">
                        {commenterInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {commenterName}
                        </p>
                        {comment.isPinned && (
                          <Badge className="h-5 rounded-full bg-amber-100 px-2 text-[10px] font-bold uppercase tracking-wide text-amber-700 hover:bg-amber-100 dark:bg-amber-500/15 dark:text-amber-300">
                            Pinned
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {canPin && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={isPinningComment}
                        onClick={() => handleTogglePinnedComment(comment._id)}
                        className="h-9 w-9 rounded-xl text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-300"
                        title={comment.isPinned ? "Unpin comment" : "Pin comment"}
                      >
                        {comment.isPinned ? (
                          <PinOff className="h-4 w-4" />
                        ) : (
                          <Pin className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={isDeletingComment}
                        onClick={() => handleDeleteComment(comment._id)}
                        className="h-9 w-9 rounded-xl text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-50 px-3 py-2.5 text-sm leading-6 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  {comment.text}
                </p>

                <div className="mt-3 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      setActiveReplyFor((currentValue) =>
                        currentValue === comment._id ? null : comment._id
                      )
                    }
                    className="h-8 rounded-xl px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-cyan-300"
                  >
                    <CornerDownRight className="mr-1.5 h-3.5 w-3.5" />
                    Reply
                  </Button>
                </div>

                {activeReplyFor === comment._id && (
                  <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                    <textarea
                      value={replyTextByComment[comment._id] || ""}
                      onChange={(event) =>
                        setReplyTextByComment((currentValue) => ({
                          ...currentValue,
                          [comment._id]: event.target.value,
                        }))
                      }
                      placeholder={`Reply to ${commenterName}`}
                      className="min-h-20 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-cyan-500/70 dark:focus:ring-cyan-500/10"
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 rounded-xl px-3 text-xs"
                        onClick={() => setActiveReplyFor(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        className="h-8 rounded-xl px-3 text-xs"
                        disabled={
                          isAddingComment || !(replyTextByComment[comment._id] || "").trim()
                        }
                        onClick={() => handleAddReply(comment._id)}
                      >
                        {isAddingComment ? "Posting..." : "Post Reply"}
                      </Button>
                    </div>
                  </div>
                )}

                {replies.length > 0 && (
                  <div className="mt-3 space-y-2.5 border-l-2 border-slate-200 pl-3 dark:border-slate-700">
                    {replies.map((reply) => {
                      const canDeleteReply =
                        user?._id === reply.userId?._id || user?.role === "instructor";
                      const replyUserName = reply.userId?.name || "User";
                      const replyUserInitials = replyUserName
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2);

                      return (
                        <div
                          key={reply._id}
                          className="rounded-xl border border-slate-200 bg-slate-50/90 p-3 shadow-[0_10px_20px_-20px_rgba(15,23,42,0.7)] dark:border-slate-800 dark:bg-slate-900"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-start gap-2.5">
                              <Avatar className="h-8 w-8 shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
                                <AvatarImage
                                  src={reply.userId?.photoUrl || "https://github.com/shadcn.png"}
                                  alt={replyUserName}
                                />
                                <AvatarFallback className="text-[10px] font-semibold uppercase">
                                  {replyUserInitials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                                  {replyUserName}
                                </p>
                                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                                  {new Date(reply.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            {canDeleteReply && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={isDeletingComment}
                                onClick={() => handleDeleteComment(reply._id)}
                                className="h-8 w-8 rounded-lg text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                          <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-700 dark:text-slate-300">
                            {reply.replyToUserId?.name ? `@${reply.replyToUserId.name} ` : ""}
                            {reply.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 md:px-8 md:py-8">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-wide">
                Course Progress
              </Badge>
              {completed && (
                <Badge className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300">
                  Completed
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold leading-tight sm:text-2xl md:text-3xl">{courseTitle}</h1>
            <div className="max-w-xl space-y-2">
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                <span>{completedLecturesCount} of {courseDetails.lectures.length} lectures completed</span>
                <span className="font-semibold">{progressValue}%</span>
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>
          </div>
          <div className="grid w-full grid-cols-1 gap-2.5 sm:w-auto sm:grid-cols-[auto_auto] sm:items-center">
            <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 sm:justify-start">
              <PlayCircle className="h-4 w-4 text-slate-500 dark:text-slate-300" />
              <div className="text-center sm:text-left">
                <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Now Playing</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Lecture {activeLectureIndex + 1 > 0 ? activeLectureIndex + 1 : 1}
                </p>
              </div>
            </div>
            <Button
              onClick={completed ? handleInCompleteCourse : handleCompleteCourse}
              variant={completed ? "outline" : "default"}
              className={`hidden h-11 w-full rounded-xl px-5 text-sm font-semibold shadow-sm transition sm:inline-flex sm:min-w-44 sm:w-auto ${
                completed
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700/50 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
                  : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              }`}
              disabled={isCompletingCourse || isResettingCourse}
            >
              {completed ? (
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  <span>Completed</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  <span>Complete Course</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
        <Card className="overflow-hidden border-slate-200 shadow-sm dark:border-slate-800">
          <CardContent className="p-4 md:p-5">
            {contentViewMode === "video" ? (
              <div className="overflow-hidden rounded-2xl bg-black shadow-sm">
                <ReactPlayer
                  src={activeLecture?.videoUrl}
                  controls
                  width="100%"
                  height="100%"
                  className="aspect-video"
                  onEnded={() =>
                    handleLectureProgress(curerntLecture?._id || initialLecture._id)
                  }
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 md:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-blue-600 dark:text-cyan-300" />
                    <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Lecture Quiz
                    </h4>
                  </div>
                  <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                    {totalQuizQuestions} questions
                  </Badge>
                </div>

                {totalQuizQuestions === 0 ? (
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    No quiz questions were added to this lecture yet.
                  </p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {lectureQuizQuestions.map((question, questionIndex) => (
                      <div key={questionIndex} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {questionIndex + 1}. {question.questionText}
                        </p>
                        <div className="mt-3 space-y-2">
                          {question.options?.map((option, optionIndex) => {
                            const isSelected = quizAnswers[questionIndex] === optionIndex;
                            const isCorrect = question.correctOptionIndex === optionIndex;
                            const showCorrectState = showQuizResult && isCorrect;
                            const showWrongState = showQuizResult && isSelected && !isCorrect;

                            return (
                              <label
                                key={optionIndex}
                                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm transition ${
                                  showCorrectState
                                    ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-950/30 dark:text-emerald-300"
                                    : showWrongState
                                    ? "border-red-300 bg-red-50 text-red-800 dark:border-red-500/40 dark:bg-red-950/30 dark:text-red-300"
                                    : isSelected
                                    ? "border-blue-300 bg-blue-50 text-blue-800 dark:border-cyan-500/40 dark:bg-cyan-950/30 dark:text-cyan-300"
                                    : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`quiz-question-${questionIndex}`}
                                  checked={isSelected}
                                  onChange={() => updateQuizAnswer(questionIndex, optionIndex)}
                                  className="h-4 w-4"
                                />
                                <span>{option}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Answered {answeredQuizQuestionsCount} / {totalQuizQuestions}
                      </p>
                      <Button
                        type="button"
                        onClick={submitQuiz}
                        className="rounded-2xl"
                        disabled={isSubmittingQuizResult}
                      >
                        {isSubmittingQuizResult ? "Submitting..." : "Check Answers"}
                      </Button>
                    </div>

                    {showQuizResult && (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                        Your score: {quizScore} / {totalQuizQuestions}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Current Lecture
                </p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">
                  {`Lecture ${activeLectureIndex + 1 > 0 ? activeLectureIndex + 1 : 1}: ${
                    activeLecture?.lectureTitle || "No lecture selected"
                  }`}
                </h3>
              </div>
              <Badge className="w-fit rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-200">
                {contentViewMode === "quiz" ? (
                  <>
                    <ListChecks className="mr-1 h-4 w-4" /> Quiz Mode
                  </>
                ) : (
                  <>
                    <PlayCircle className="mr-1 h-4 w-4" /> Watching
                  </>
                )}
              </Badge>
            </div>

          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm dark:border-slate-800">
          <CardContent className="p-4 md:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 sm:text-2xl">Course Lectures</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Choose a lecture to continue learning.
                </p>
              </div>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                {courseDetails.lectures.length} total
              </Badge>
            </div>
            <div className="space-y-3">
              {courseDetails?.lectures.map((lecture, index) => (
                <Card
                  key={lecture._id}
                  className={`cursor-pointer border transition-colors ${
                    lecture._id === activeLecture?._id
                      ? "border-slate-900 bg-slate-100 dark:border-slate-200 dark:bg-slate-900"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-950"
                  }`}
                  onClick={() => handleSelectLecture(lecture)}
                >
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-3">
                      <div className={`rounded-full p-2 ${
                        isLectureCompleted(lecture._id)
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                      }`}>
                        {isLectureCompleted(lecture._id) ? (
                          <CheckCircle2 size={18} />
                        ) : (
                          <CirclePlay size={18} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Lecture {index + 1}
                        </p>
                        <CardTitle className="mt-1 text-base font-semibold line-clamp-1">
                          {lecture.lectureTitle}
                        </CardTitle>
                      </div>
                    </div>

                      <div className={`mt-3 grid gap-2 ${lecture.quizQuestions?.length ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleOpenLectureVideo(lecture);
                          }}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-medium transition ${
                            lecture._id === activeLecture?._id && contentViewMode === "video"
                              ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-cyan-500/40 dark:bg-cyan-950/30 dark:text-cyan-300"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
                          }`}
                        >
                          <PlayCircle className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-300" />
                          Video lesson
                        </button>
                        {lecture.quizQuestions?.length > 0 && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleOpenLectureQuiz(lecture);
                            }}
                            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-medium transition ${
                              lecture._id === activeLecture?._id && contentViewMode === "quiz"
                                ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-cyan-500/40 dark:bg-cyan-950/30 dark:text-cyan-300"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
                            }`}
                          >
                            <ListChecks className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-300" />
                            Quiz: {lecture.quizQuestions.length}
                          </button>
                        )}
                      </div>
                    </div>

                    {isLectureCompleted(lecture._id) && (
                      <Badge
                        variant={"outline"}
                        className="mt-1 w-fit rounded-full border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 sm:self-start"
                      >
                        Completed
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {shouldShowComments && (
        <div className="mt-6 space-y-3 sm:space-y-0">
          <Button
            onClick={completed ? handleInCompleteCourse : handleCompleteCourse}
            variant={completed ? "outline" : "default"}
            className={`h-11 w-full rounded-xl px-5 text-sm font-semibold shadow-sm transition sm:hidden ${
              completed
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700/50 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
                : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
            }`}
            disabled={isCompletingCourse || isResettingCourse}
          >
            {completed ? (
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                <span>Completed</span>
              </div>
            ) : (
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                <span>Complete Course</span>
              </div>
            )}
          </Button>
          {commentsSection}
        </div>
      )}
    </div>
  );
};

export default CourseProgress;
