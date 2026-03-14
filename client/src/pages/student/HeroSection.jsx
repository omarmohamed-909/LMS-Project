import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const navigate = useNavigate();

  const searchHandler = (e) => {
    e.preventDefault();
    const normalizedQuery = searchQuery.trim();
    navigate(`/course/search?query=${encodeURIComponent(normalizedQuery)}`);
    setSearchQuery("");
  };

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_38%,#0891b2_100%)] px-4 py-20 text-center dark:bg-[linear-gradient(135deg,#020617_0%,#0f172a_34%,#111827_72%,#0f766e_100%)] md:px-8 md:py-28">
      <div className="absolute inset-0 opacity-30 dark:opacity-80">
        <div className="absolute left-10 top-10 h-32 w-32 rounded-full border border-white/20 bg-white/5 blur-sm dark:border-cyan-400/10 dark:bg-cyan-300/5" />
        <div className="absolute bottom-12 right-12 h-56 w-56 rounded-full bg-cyan-300/15 blur-3xl dark:bg-emerald-400/10" />
        <div className="absolute left-1/2 top-16 h-32 w-32 -translate-x-1/2 rounded-full bg-blue-200/10 blur-3xl dark:bg-blue-400/10" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-slate-950/20 to-transparent dark:from-slate-950/70" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur dark:border-white/10 dark:bg-white/5">
          <Sparkles className="h-4 w-4" />
          Learn faster with curated, practical courses
        </div>

        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold leading-tight text-white md:text-6xl">
          Find the Best Courses to build real skills
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base text-blue-50/90 md:text-lg">
          Discover expert-led lessons, sharpen your workflow, and move from beginner to job-ready with a catalog built for focused learning.
        </p>

        <form
          onSubmit={searchHandler}
          className="mx-auto mt-10 flex max-w-3xl flex-col gap-3 rounded-[28px] border border-white/15 bg-white/10 p-3 shadow-2xl shadow-blue-950/20 backdrop-blur dark:border-white/10 dark:bg-slate-950/30 dark:shadow-black/40 md:flex-row"
        >
          <div className="flex grow items-center gap-3 rounded-2xl bg-white px-4 py-3 text-slate-700 dark:bg-slate-950/90 dark:text-slate-200">
            <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, category, or skill"
              className="grow border-none bg-transparent px-0 py-0 text-base text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
          <Button
            type="submit"
            className="rounded-2xl bg-slate-950 px-7 py-6 text-base text-white hover:bg-slate-900 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
          >
            Search
          </Button>
        </form>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            onClick={() => navigate("/courses")}
            className="rounded-full bg-white px-6 py-5 text-blue-700 hover:bg-blue-50 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
          >
            Explore Courses
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
            100% self-paced learning with guided progress
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
