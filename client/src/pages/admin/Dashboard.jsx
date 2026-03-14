import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageSkeleton from "@/components/PageSkeleton";
import { useGetCreatorCourseQuery } from "@/features/api/courseApi"; // ✅ استخدمنا Creator بدلاً من Published
import { BadgeDollarSign, BookOpen, ChartColumnIncreasing, CircleDollarSign } from "lucide-react";
import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const Dashboard = () => {
  //  استخدام✅ الـ Hook الصحيح لجلب كورسات المدرب (أو استبدله بـ useGetCoursePurchaseStatusQuery لو أنشأته)
  const { data, isError, isLoading } = useGetCreatorCourseQuery();

  if (isLoading) {
    return <PageSkeleton variant="dashboard" />;
  }
  if (isError) {
    return <h1 className="text-red-500">Failed to get course data</h1>;
  }

  const { courses } = data || {};

  if (!courses || courses.length === 0) {
      return <h1>No courses found.</h1>
  }

  const courseData = courses.map((course) => ({
    name:
      course.courseTitle.length > 18
        ? `${course.courseTitle.slice(0, 18)}...`
        : course.courseTitle,
    price: course.coursePrice || 0,
  }));

  const totalRevenue = courses.reduce((acc, element) => acc + (element.coursePrice || 0), 0);
  const totalSales = courses.length;
  const publishedCourses = courses.filter((course) => course.isPublished).length;
  const averagePrice = totalSales ? Math.round(totalRevenue / totalSales) : 0;

  const statCards = [
    {
      title: "Total Courses",
      value: totalSales,
      subtitle: "All courses you created",
      icon: BookOpen,
      accent: "text-blue-600",
      iconBg: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    },
    {
      title: "Published Courses",
      value: publishedCourses,
      subtitle: "Currently visible to students",
      icon: ChartColumnIncreasing,
      accent: "text-emerald-600",
      iconBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    },
    {
      title: "Total Potential Revenue",
      value: `${totalRevenue} EGP`,
      subtitle: "Based on current course prices",
      icon: CircleDollarSign,
      accent: "text-violet-600",
      iconBg: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
    },
    {
      title: "Average Course Price",
      value: `${averagePrice} EGP`,
      subtitle: "Average price across your catalog",
      icon: BadgeDollarSign,
      accent: "text-amber-600",
      iconBg: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    },
  ];

  return (
    <div className="space-y-6 p-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 dark:bg-slate-900 dark:text-slate-200">
              Dashboard Overview
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Your course business at a glance
            </h1>
            <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              Track your course catalog, pricing, and publishing status from one place.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title} className="border-slate-200 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{item.title}</p>
                    <h2 className={`text-3xl font-bold ${item.accent}`}>{item.value}</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{item.subtitle}</p>
                  </div>
                  <div className={`rounded-2xl p-3 ${item.iconBg}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-slate-200 shadow-sm dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            Course Prices Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={courseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                angle={-30}
                textAnchor="end"
                interval={0}
                height={70}
              />
              <YAxis stroke="#64748b" />
              <Tooltip
                formatter={(value) => [`${value} EGP`, "Price"]}
                contentStyle={{
                  borderRadius: 16,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4, stroke: "#2563eb", strokeWidth: 2, fill: "#ffffff" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;