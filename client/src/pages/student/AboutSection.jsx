import { ArrowRight, BookOpen, GraduationCap, ShieldCheck } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const highlights = [
  {
    title: "Practical learning",
    description:
      "Courses are structured around clear lessons, guided progress, and real outcomes instead of passive watching.",
    icon: BookOpen,
  },
  {
    title: "Built for growth",
    description:
      "Students can move from exploration to mastery with focused paths that make progress easier to track.",
    icon: GraduationCap,
  },
  {
    title: "Reliable experience",
    description:
      "Instructors manage content directly while learners get a cleaner, more consistent workspace across devices.",
    icon: ShieldCheck,
  },
];

const AboutSection = () => {
  return (
    <section className="min-h-[calc(100vh-4rem)] bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] py-18 dark:bg-[linear-gradient(180deg,#020617_0%,#0b1220_100%)]">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="mb-8 space-y-3 text-center lg:mb-12 lg:text-left">
          <div className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200">
            About E-Learning
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 dark:text-slate-100 md:text-5xl">
            About Us
          </h1>
          <p className="mx-auto max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base lg:mx-0">
            Learn what this platform is built for, how it supports instructors and students, and why the experience is designed around practical progress.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-5 rounded-4xl border border-slate-200/80 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-950/70">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
              About Us
            </div>
            <div className="space-y-4">
              <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-100 md:text-4xl">
                A focused learning space for students who want real progress
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
                This platform is designed to make learning practical, organized, and easier to follow. Instead of throwing content at students, it gives them a cleaner path through courses, lectures, and progress tracking.
              </p>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
                The goal is simple: help instructors publish better material and help learners move from theory to application with less friction.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              >
                Explore Courses
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/course/search?query="
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:text-cyan-300"
              >
                Browse Topics
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[28px] border border-slate-200/80 bg-[linear-gradient(135deg,#ffffff_0%,#eff6ff_100%)] p-6 shadow-sm dark:border-slate-800 dark:bg-[linear-gradient(135deg,#0f172a_0%,#111827_100%)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-blue-100 p-3 text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </h3>
                      <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;