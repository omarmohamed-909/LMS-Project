import { ArrowDown, ArrowUp, Edit, GripVertical, PlayCircle } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const Lecture = ({ lecture, index, totalLectures, isReordering, onReorder }) => {
  const navigate = useNavigate();
  const goToUpdateLecture = () => {
    navigate(`${lecture._id}`);
  };
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 dark:hover:bg-slate-900">
      <div className="flex items-center gap-3">
        <GripVertical className="h-4 w-4 text-slate-400" />
        <div className="rounded-full bg-slate-100 p-2 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          <PlayCircle className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Lecture {index + 1}
          </p>
          <h1 className="font-semibold text-slate-900 dark:text-slate-100">
            {lecture.lectureTitle || "Untitled lecture"}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={index === 0 || isReordering}
          onClick={() => onReorder?.(lecture._id, "up")}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          aria-label={`Move lecture ${lecture.lectureTitle || index + 1} up`}
        >
          <ArrowUp size={18} />
        </button>
        <button
          type="button"
          disabled={index === totalLectures - 1 || isReordering}
          onClick={() => onReorder?.(lecture._id, "down")}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          aria-label={`Move lecture ${lecture.lectureTitle || index + 1} down`}
        >
          <ArrowDown size={18} />
        </button>
        <button
          type="button"
          onClick={goToUpdateLecture}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          aria-label={`Edit lecture ${lecture.lectureTitle || index + 1}`}
        >
          <Edit size={18} />
        </button>
      </div>
    </div>
  );
};

export default Lecture;
