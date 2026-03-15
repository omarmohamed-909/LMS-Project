import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGetCourseQuizResultsQuery,
  useLazyGetQuizResultHistoryQuery,
} from "@/features/api/courseProgressApi";
import { useGetCreatorCourseQuery } from "@/features/api/courseApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Award,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  History,
  ListChecks,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

const QuizDashboard = () => {
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedLectureId, setSelectedLectureId] = useState("all");
  const [expandedHistoryKey, setExpandedHistoryKey] = useState(null);
  const [historyByResultId, setHistoryByResultId] = useState({});

  const { data: coursesData, isLoading: coursesLoading } = useGetCreatorCourseQuery();
  const { data: quizData, isLoading: quizLoading } = useGetCourseQuizResultsQuery(
    selectedCourseId,
    { skip: !selectedCourseId }
  );
  const [getQuizResultHistory, { isLoading: isHistoryLoading }] =
    useLazyGetQuizResultHistoryQuery();

  const courses = coursesData?.courses ?? [];
  const lectures = quizData?.lectures ?? [];
  const allResults = quizData?.results ?? [];

  const filteredResults =
    selectedLectureId === "all"
      ? allResults
      : allResults.filter((r) => r.lectureId?._id === selectedLectureId);

  const uniqueStudents = new Set(allResults.map((r) => r.userId?._id)).size;
  const totalAttempts = allResults.reduce(
    (sum, result) => sum + (result.attemptsCount || result.history?.length || 1),
    0
  );
  const avgPercentage = allResults.length
    ? Math.round(allResults.reduce((sum, r) => sum + r.percentage, 0) / allResults.length)
    : 0;

  const selectedCourse = courses.find((c) => c._id === selectedCourseId);

  const getPerformanceGrade = (percent) => {
    if (percent >= 80) {
      return {
        label: "Excellent",
        color: "text-emerald-700 dark:text-emerald-400",
        bar: "bg-emerald-500",
        pill: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
      };
    }

    if (percent >= 50) {
      return {
        label: "Good",
        color: "text-amber-700 dark:text-amber-400",
        bar: "bg-amber-500",
        pill: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
      };
    }

    return {
      label: "Needs Work",
      color: "text-red-700 dark:text-red-400",
      bar: "bg-red-500",
      pill: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    };
  };

  const formatSubmittedAt = (dateValue) =>
    dateValue
      ? new Date(dateValue).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  const statCards = [
    {
      title: "Total Attempts",
      value: totalAttempts,
      subtitle: "All attempts across students",
      icon: History,
      gradient: "from-blue-500 to-blue-600",
      lightBg: "bg-blue-50 dark:bg-blue-950/30",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Quiz Records",
      value: allResults.length,
      subtitle: "Unique student x lecture records",
      icon: ClipboardList,
      gradient: "from-violet-500 to-violet-600",
      lightBg: "bg-violet-50 dark:bg-violet-950/30",
      textColor: "text-violet-600 dark:text-violet-400",
    },
    {
      title: "Unique Students",
      value: uniqueStudents,
      subtitle: "Students who took at least one quiz",
      icon: Users,
      gradient: "from-amber-500 to-orange-500",
      lightBg: "bg-amber-50 dark:bg-amber-950/30",
      textColor: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Average Score",
      value: `${avgPercentage}%`,
      subtitle: "Latest percentage average",
      icon: Award,
      gradient: "from-emerald-500 to-teal-500",
      lightBg: "bg-emerald-50 dark:bg-emerald-950/30",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
  ];

  const handleToggleHistory = async (rowKey, resultId) => {
    if (expandedHistoryKey === rowKey) {
      setExpandedHistoryKey(null);
      return;
    }

    setExpandedHistoryKey(rowKey);

    if (historyByResultId[resultId]) {
      return;
    }

    try {
      const response = await getQuizResultHistory(resultId).unwrap();
      setHistoryByResultId((currentValue) => ({
        ...currentValue,
        [resultId]: response?.history || [],
      }));
    } catch (error) {
      toast.error(error?.data?.message || "Failed to load attempt history.");
    }
  };

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 to-slate-700 p-4 text-white shadow-lg dark:from-slate-800 dark:to-slate-900 sm:p-6">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-widest text-slate-400">
              Admin Panel
            </p>
            <h1 className="text-xl font-bold sm:text-3xl">Quiz Dashboard</h1>
            <p className="mt-1 text-sm text-slate-400">
              Monitor student performance across all quiz-enabled lectures.
            </p>
          </div>
          <div className="flex w-full shrink-0 items-center gap-2 rounded-xl bg-white/10 px-3 py-2 backdrop-blur-sm sm:w-auto sm:px-4 sm:py-2.5">
            <ClipboardList className="h-4 w-4 text-slate-300" />
            <span className="truncate text-sm font-medium text-slate-200">
              {selectedCourse ? selectedCourse.courseTitle : "No course selected"}
            </span>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-6 right-24 h-24 w-24 rounded-full bg-white/5" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:max-w-xs">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Course
          </label>
          <Select
            value={selectedCourseId}
            onValueChange={(value) => {
              setSelectedCourseId(value);
              setSelectedLectureId("all");
            }}
          >
            <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <SelectValue placeholder={coursesLoading ? "Loading…" : "Select a course"} />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course._id} value={course._id}>
                  {course.courseTitle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCourseId && lectures.filter((l) => l.totalQuestions > 0).length > 0 && (
          <>
            <ChevronRight className="hidden h-4 w-4 shrink-0 text-slate-400 sm:block" />
            <div className="w-full sm:max-w-xs">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Lecture
              </label>
              <Select value={selectedLectureId} onValueChange={setSelectedLectureId}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <SelectValue placeholder="All lectures" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Lectures</SelectItem>
                  {lectures
                    .filter((lec) => lec.totalQuestions > 0)
                    .map((lec) => (
                      <SelectItem key={lec._id} value={lec._id}>
                        {lec.lectureTitle}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      {/* Empty state — no course selected */}
      {!selectedCourseId && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-24 text-center dark:border-slate-800 dark:bg-slate-900/20">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
            <BookOpen className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
            Select a course to get started
          </p>
          <p className="mt-1 max-w-xs text-sm text-slate-400 dark:text-slate-500">
            Choose one of your courses from the dropdown above to view student quiz results.
          </p>
        </div>
      )}

      {/* Loading state */}
      {selectedCourseId && quizLoading && (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/30">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
          <span className="text-sm text-slate-500 dark:text-slate-400">Loading quiz results…</span>
        </div>
      )}

      {selectedCourseId && !quizLoading && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            {statCards.map((card) => (
              <Card
                key={card.title}
                className="overflow-hidden border-slate-200 shadow-sm dark:border-slate-800"
              >
                <CardContent className="p-0">
                  <div className={`h-1 w-full bg-linear-to-r ${card.gradient}`} />
                  <div className="flex items-center gap-3 p-3.5 sm:gap-4 sm:p-5">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.lightBg} sm:h-12 sm:w-12`}>
                      <card.icon className={`h-5 w-5 ${card.textColor}`} />
                    </div>
                    <div>
                      <p className={`text-2xl font-extrabold sm:text-3xl ${card.textColor}`}>{card.value}</p>
                      <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                        {card.title}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Results table */}
          <Card className="overflow-hidden border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader className="border-b border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {selectedLectureId === "all"
                    ? "All Quiz Results"
                    : `Results — ${lectures.find((l) => l._id === selectedLectureId)?.lectureTitle ?? ""}`}
                </CardTitle>
                <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {filteredResults.length} {filteredResults.length === 1 ? "entry" : "entries"}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                    <ClipboardList className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    No results yet
                  </p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Students haven't submitted this quiz yet.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 p-3 md:hidden">
                    {filteredResults.map((result) => {
                      const percent = result.percentage ?? 0;
                      const grade = getPerformanceGrade(percent);
                      const attemptsCount =
                        result.attemptsCount || result.history?.length || 1;
                      const history = historyByResultId[result._id] || [];
                      const rowKey = `${result.userId?._id || "unknown"}-${result.lectureId?._id || result._id}`;
                      const isExpanded = expandedHistoryKey === rowKey;

                      return (
                        <div
                          key={rowKey}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/40"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2.5">
                              <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm dark:ring-slate-800">
                                <AvatarImage src={result.userId?.photoUrl} />
                                <AvatarFallback className="bg-linear-to-br from-slate-400 to-slate-600 text-xs font-semibold text-white">
                                  {result.userId?.name?.slice(0, 2).toUpperCase() ?? "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                                  {result.userId?.name ?? "Unknown"}
                                </p>
                                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                  {result.userId?.email ?? ""}
                                </p>
                              </div>
                            </div>
                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${grade.pill}`}>
                              {percent}%
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">
                              <ListChecks className="h-3 w-3" />
                              {result.lectureId?.lectureTitle ?? "—"}
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-100">
                              {result.score}/{result.totalQuestions}
                            </span>
                          </div>

                          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                            <div
                              className={`h-full rounded-full transition-all ${grade.bar}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => handleToggleHistory(rowKey, result._id)}
                              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            >
                              <History className="h-3 w-3" />
                              {attemptsCount} Attempts
                              <ChevronDown
                                className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                              />
                            </button>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {formatSubmittedAt(result.updatedAt)}
                            </span>
                          </div>

                          {isExpanded && (
                            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-950/70">
                              {isHistoryLoading && !history.length ? (
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  Loading history...
                                </span>
                              ) : history.length > 0 ? (
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                  {history.map((attempt, index) => (
                                    <div
                                      key={`${rowKey}-attempt-${index}`}
                                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-900"
                                    >
                                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                        Attempt #{history.length - index}
                                      </p>
                                      <p className="mt-0.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                                        {attempt.score}/{attempt.totalQuestions}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  No history found.
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="hidden overflow-x-auto md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-100 bg-transparent hover:bg-transparent dark:border-slate-800">
                        <TableHead className="pl-6 text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Student
                        </TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Lecture
                        </TableHead>
                        <TableHead className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Score
                        </TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Performance
                        </TableHead>
                        <TableHead className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Attempts
                        </TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Submitted
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredResults.map((result) => {
                        const percent = result.percentage ?? 0;
                        const grade = getPerformanceGrade(percent);
                        const submittedAt = formatSubmittedAt(result.updatedAt);

                        const attemptsCount =
                          result.attemptsCount || result.history?.length || 1;
                        const history = historyByResultId[result._id] || [];
                        const rowKey = `${result.userId?._id || "unknown"}-${result.lectureId?._id || result._id}`;
                        const isExpanded = expandedHistoryKey === rowKey;

                        return (
                          <React.Fragment key={rowKey}>
                            <TableRow className="border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/40">
                              {/* Student */}
                              <TableCell className="py-4 pl-6">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm dark:ring-slate-800">
                                    <AvatarImage src={result.userId?.photoUrl} />
                                    <AvatarFallback className="bg-linear-to-br from-slate-400 to-slate-600 text-xs font-semibold text-white">
                                      {result.userId?.name?.slice(0, 2).toUpperCase() ?? "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                      {result.userId?.name ?? "Unknown"}
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">
                                      {result.userId?.email ?? ""}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>

                              {/* Lecture */}
                              <TableCell>
                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                  <ListChecks className="h-3 w-3 shrink-0" />
                                  {result.lectureId?.lectureTitle ?? "—"}
                                </span>
                              </TableCell>

                              {/* Score */}
                              <TableCell className="text-center">
                                <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                                  {result.score}
                                </span>
                                <span className="text-sm font-medium text-slate-400">
                                  {" "}/ {result.totalQuestions}
                                </span>
                              </TableCell>

                              {/* Performance */}
                              <TableCell className="min-w-40">
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className={`text-xs font-semibold ${grade.color}`}>
                                      {grade.label}
                                    </span>
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${grade.pill}`}>
                                      {percent}%
                                    </span>
                                  </div>
                                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                    <div
                                      className={`h-full rounded-full transition-all ${grade.bar}`}
                                      style={{ width: `${percent}%` }}
                                    />
                                  </div>
                                </div>
                              </TableCell>

                              {/* Attempts */}
                              <TableCell className="text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleHistory(rowKey, result._id)}
                                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                >
                                  <History className="h-3 w-3" />
                                  {attemptsCount}
                                  <ChevronDown
                                    className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                  />
                                </button>
                              </TableCell>

                              {/* Submitted */}
                              <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                                {submittedAt}
                              </TableCell>
                            </TableRow>

                            {isExpanded && (
                              <TableRow className="bg-slate-50/70 dark:bg-slate-900/30">
                                <TableCell colSpan={6} className="px-6 py-4">
                                  <div className="flex flex-wrap gap-2">
                                    {isHistoryLoading && !history.length ? (
                                      <span className="text-xs text-slate-500 dark:text-slate-400">
                                        Loading history...
                                      </span>
                                    ) : history.length > 0 ? (
                                      history.map((attempt, index) => {
                                        const attemptDate = formatSubmittedAt(attempt.submittedAt);

                                        return (
                                          <span
                                            key={`${rowKey}-attempt-${index}`}
                                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                                          >
                                            <strong className="font-semibold text-slate-800 dark:text-slate-100">
                                              Attempt {history.length - index}
                                            </strong>
                                            <span>
                                              {attempt.score}/{attempt.totalQuestions}
                                            </span>
                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] dark:bg-slate-800">
                                              {attempt.percentage}%
                                            </span>
                                            <span>{attemptDate}</span>
                                          </span>
                                        );
                                      })
                                    ) : (
                                      <span className="text-xs text-slate-500 dark:text-slate-400">
                                        No history found.
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default QuizDashboard;
