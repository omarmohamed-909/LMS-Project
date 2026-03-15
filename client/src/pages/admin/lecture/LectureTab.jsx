import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useEditLectureMutation, useGetLectureByIdQuery, useRemoveLectureMutation, useUpdateLectureQuizMutation } from "@/features/api/courseApi";
import { secureMediaUrl } from "@/lib/secureMediaUrl";
import axios from "axios";
import { CheckCircle2, Link2, Loader2, Lock, PlayCircle, Plus, Trash2, UploadCloud, Video } from "lucide-react";
import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const DEFAULT_API_BASE_URL =
  typeof window !== "undefined" && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
    ? "http://localhost:8080"
    : "https://lms-project-steel-pi.vercel.app";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
const MEDIA_API = `${API_BASE_URL}/api/v1/media`;
const AUTH_TOKEN_KEY = "lms_auth_token";
const YOUTUBE_URL_PATTERN = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i;
const YOUTUBE_PLAYER_CONFIG = {
  youtube: {
    playerVars: {
      origin: typeof window !== "undefined" ? window.location.origin : undefined,
    },
  },
};

const getAuthHeaders = () => {
  if (typeof window === "undefined") {
    return {};
  }

  const token = window.localStorage.getItem(AUTH_TOKEN_KEY) || "";

  return token ? { Authorization: `Bearer ${token}` } : {};
};

const LectureTab = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  const [uploadVideInfo, setUploadVideoInfo] = useState(null);
  const [isFree, setIsFree] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [mediaProgress, setMediaProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const params = useParams();
  const { courseId, lectureId } = params;

  const {data:lectureData} = useGetLectureByIdQuery(lectureId);
  const lecture = lectureData?.lecture;

  useEffect(()=>{
    if(lecture){
      setLectureTitle(lecture.lectureTitle);
      setIsFree(
        typeof lecture.previewEnabledByAdmin === "boolean"
          ? Boolean(lecture.previewEnabledByAdmin && lecture.isPreviewFree)
          : Boolean(lecture.isPreviewFree)
      );
      setUploadVideoInfo(
        lecture.videoUrl
          ? {
              videoUrl: secureMediaUrl(lecture.videoUrl),
              publicId: lecture.publicId || "",
            }
          : null
      );
      setYoutubeUrl(lecture.publicId ? "" : secureMediaUrl(lecture.videoUrl || ""));
      setQuizQuestions(
        Array.isArray(lecture.quizQuestions)
          ? lecture.quizQuestions.map((item) => ({
              questionText: item.questionText || "",
              options: Array.isArray(item.options) && item.options.length
                ? item.options
                : ["", ""],
              correctOptionIndex: Number.isInteger(item.correctOptionIndex)
                ? item.correctOptionIndex
                : 0,
            }))
          : []
      );
    }
  },[lecture])

  const [edtiLecture, { data, isLoading, error, isSuccess }] =
    useEditLectureMutation();
  const [removeLecture,{data:removeData, isLoading:removeLoading, isSuccess:removeSuccess}] = useRemoveLectureMutation();
  const [updateLectureQuiz, { data: quizData, isLoading: quizLoading, error: quizError, isSuccess: quizSuccess }] = useUpdateLectureQuizMutation();

  const fileChangeHandler = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaProgress(true);
      setIsProcessingVideo(false);
      setUploadProgress(0);
      try {
        const signatureResponse = await axios.post(
          `${MEDIA_API}/upload-video-signature`,
          {},
          {
            headers: getAuthHeaders(),
          }
        );

        const { apiKey, cloudName, folder, signature, timestamp } =
          signatureResponse.data.data;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("folder", folder);
        formData.append("signature", signature);
        formData.append("timestamp", timestamp);

        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
          formData,
          {
          onUploadProgress: ({ loaded, total }) => {
            const safeTotal = total || file.size || loaded || 1;
            const progressValue = Math.round((loaded * 100) / safeTotal);
            setUploadProgress(progressValue);
            if (progressValue >= 100) {
              setIsProcessingVideo(true);
            }
          },
          }
        );

        if (res.data.secure_url) {
          setUploadVideoInfo({
            videoUrl: res.data.secure_url,
            publicId: res.data.public_id,
          });
          setYoutubeUrl("");
          toast.success("video uploaded successfully");
        }
      } catch (error) {
        console.log(error);
        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error?.message ||
          "video upload failed";
        toast.error(errorMessage);
      } finally {
        setIsProcessingVideo(false);
        setMediaProgress(false);
      }
    }
  };

  const youtubeUrlChangeHandler = (event) => {
    const value = event.target.value;
    setYoutubeUrl(value);

    if (!value.trim()) {
      setUploadVideoInfo(
        lecture?.videoUrl
          ? {
              videoUrl: secureMediaUrl(lecture.videoUrl),
              publicId: lecture.publicId || "",
            }
          : null
      );
      return;
    }

    setUploadVideoInfo({
      videoUrl: value.trim(),
      publicId: "",
    });
  };

  const addQuestion = () => {
    setQuizQuestions((currentValue) => [
      ...currentValue,
      {
        questionText: "",
        options: ["", ""],
        correctOptionIndex: 0,
      },
    ]);
  };

  const removeQuestion = (questionIndex) => {
    setQuizQuestions((currentValue) =>
      currentValue.filter((_, index) => index !== questionIndex)
    );
  };

  const updateQuestionText = (questionIndex, value) => {
    setQuizQuestions((currentValue) =>
      currentValue.map((question, index) =>
        index === questionIndex ? { ...question, questionText: value } : question
      )
    );
  };

  const updateOptionText = (questionIndex, optionIndex, value) => {
    setQuizQuestions((currentValue) =>
      currentValue.map((question, index) => {
        if (index !== questionIndex) {
          return question;
        }

        return {
          ...question,
          options: question.options.map((option, currentOptionIndex) =>
            currentOptionIndex === optionIndex ? value : option
          ),
        };
      })
    );
  };

  const addOption = (questionIndex) => {
    setQuizQuestions((currentValue) =>
      currentValue.map((question, index) =>
        index === questionIndex
          ? { ...question, options: [...question.options, ""] }
          : question
      )
    );
  };

  const removeOption = (questionIndex, optionIndex) => {
    setQuizQuestions((currentValue) =>
      currentValue.map((question, index) => {
        if (index !== questionIndex) {
          return question;
        }

        if (question.options.length <= 2) {
          return question;
        }

        const nextOptions = question.options.filter((_, idx) => idx !== optionIndex);
        let nextCorrectIndex = question.correctOptionIndex;

        if (optionIndex === question.correctOptionIndex) {
          nextCorrectIndex = 0;
        } else if (optionIndex < question.correctOptionIndex) {
          nextCorrectIndex = question.correctOptionIndex - 1;
        }

        return {
          ...question,
          options: nextOptions,
          correctOptionIndex: nextCorrectIndex,
        };
      })
    );
  };

  const updateCorrectOption = (questionIndex, optionIndex) => {
    setQuizQuestions((currentValue) =>
      currentValue.map((question, index) =>
        index === questionIndex
          ? { ...question, correctOptionIndex: optionIndex }
          : question
      )
    );
  };

  const sanitizeQuizQuestions = () => {
    const output = [];

    for (const question of quizQuestions) {
      const questionText = question.questionText.trim();
      const hasAnyOptionContent = question.options.some((item) => item.trim());

      if (!questionText && !hasAnyOptionContent) {
        continue;
      }

      if (!questionText) {
        toast.error("Each question needs text.");
        return null;
      }

      const options = question.options.map((item) => item.trim()).filter(Boolean);

      if (options.length < 2) {
        toast.error("Each question needs at least 2 options.");
        return null;
      }

      if (question.correctOptionIndex < 0 || question.correctOptionIndex >= options.length) {
        toast.error("Please select a valid correct answer.");
        return null;
      }

      output.push({
        questionText,
        options,
        correctOptionIndex: question.correctOptionIndex,
      });
    }

    return output;
  };

  const editLectureHandler = async () => {
    if (!uploadVideInfo?.videoUrl) {
      toast.error("Please upload a video or paste a YouTube URL.");
      return;
    }

    if (!uploadVideInfo?.publicId && !YOUTUBE_URL_PATTERN.test(uploadVideInfo.videoUrl)) {
      toast.error("Please enter a valid YouTube URL.");
      return;
    }

    await edtiLecture({
      lectureTitle,
      videoInfo:uploadVideInfo,
      isPreviewFree:isFree,
      courseId,
      lectureId,
    });
  };

  const saveQuizHandler = async () => {
    const sanitizedQuizQuestions = sanitizeQuizQuestions();
    if (sanitizedQuizQuestions === null) {
      return;
    }

    await updateLectureQuiz({
      courseId,
      lectureId,
      quizQuestions: sanitizedQuizQuestions,
    });
  };

  const removeLectureHandler = async () => {
    await removeLecture(lectureId);
  }

  const lectureErrorMessage =
    error?.data?.message ||
    error?.error ||
    "Failed to update lecture.";

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message);
    }
    if (error) {
      toast.error(lectureErrorMessage);
    }
  }, [isSuccess, error, data?.message, lectureErrorMessage]);

  useEffect(() => {
    if (quizSuccess) {
      toast.success(quizData?.message || "Lecture quiz updated successfully.");
    }
    if (quizError) {
      toast.error(quizError?.data?.message || "Failed to update lecture quiz.");
    }
  }, [quizSuccess, quizError, quizData?.message]);

  useEffect(()=>{
    if(removeSuccess){
      toast.success(removeData.message);
    }
  },[removeSuccess, removeData?.message])

  const selectedVideoName = uploadVideInfo?.videoUrl
    ? uploadVideInfo.publicId
      ? uploadVideInfo.videoUrl.split("/").pop()
      : "YouTube link attached"
    : "No video selected yet";
  const isYoutubeVideo = Boolean(uploadVideInfo?.videoUrl) && !uploadVideInfo?.publicId;

  return (
    <Card className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-950 sm:rounded-[30px]">
      <CardHeader className="flex flex-col gap-4 border-b border-slate-200/70 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/40 sm:px-6 sm:py-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <CardTitle className="text-[1.85rem] sm:text-2xl">Edit Lecture</CardTitle>
          <CardDescription className="max-w-2xl text-sm leading-6">
            Update the lecture title, replace the attached video, and decide whether learners can preview it before purchasing.
          </CardDescription>
        </div>
        <Button
          disabled={removeLoading}
          variant="destructive"
          onClick={removeLectureHandler}
          className="h-10 rounded-2xl px-4 text-sm font-semibold sm:h-11 sm:px-5 sm:text-base"
        >
          {removeLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </>
          ) : (
            "Remove Lecture"
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-5 p-4 sm:space-y-6 sm:p-6 md:p-8">
        <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 sm:rounded-3xl sm:p-5">
              <Label className="mb-3 block text-sm font-semibold text-slate-900 dark:text-slate-100">Title</Label>
              <Input
                value={lectureTitle}
                onChange={(e) => setLectureTitle(e.target.value)}
                type="text"
                placeholder="Ex. Introduction to Javascript"
                className="h-12 rounded-2xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 sm:rounded-3xl sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Video <span className="text-red-500">*</span>
                  </Label>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Upload a file or paste a YouTube link. The latest source you set will be used.
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  <UploadCloud className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                <Input
                  type="file"
                  accept="video/*"
                  onChange={fileChangeHandler}
                  className="h-12 rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                />
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Video className="h-4 w-4" />
                  <span className="truncate">{selectedVideoName}</span>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <Label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  YouTube URL
                </Label>
                <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/70 sm:gap-3 sm:px-4">
                  <Link2 className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <Input
                    type="url"
                    value={youtubeUrl}
                    onChange={youtubeUrlChangeHandler}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="border-none bg-transparent px-0 py-0 text-sm text-slate-900 focus-visible:ring-0 dark:text-slate-100"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Paste a YouTube link if you do not want to upload the video file manually.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 sm:rounded-3xl sm:p-5">
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-3 py-3 dark:bg-slate-900/60 sm:px-4 sm:py-4">
                <div>
                  <Label htmlFor="lecture-preview-toggle" className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Is this video FREE
                  </Label>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Control whether this lecture can be previewed before purchase.
                  </p>
                </div>
                <Switch checked={isFree} onCheckedChange={setIsFree} id="lecture-preview-toggle" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 sm:rounded-3xl sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Label className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Optional Quiz Questions
                  </Label>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Add multiple-choice questions for this lecture if needed.
                  </p>
                </div>
                <Button type="button" variant="outline" className="h-10 w-full rounded-2xl text-sm sm:h-11 sm:w-auto" onClick={addQuestion}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add question
                </Button>
              </div>

              {quizQuestions.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
                  No quiz questions added yet.
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {quizQuestions.map((question, questionIndex) => (
                    <div key={questionIndex} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/70 sm:p-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Question {questionIndex + 1}
                        </p>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(questionIndex)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>

                      <Input
                        value={question.questionText}
                        onChange={(event) => updateQuestionText(questionIndex, event.target.value)}
                        placeholder="Write your question"
                        className="mb-3 rounded-xl"
                      />

                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-1.5 sm:gap-2">
                            <input
                              type="radio"
                              name={`question-correct-${questionIndex}`}
                              checked={question.correctOptionIndex === optionIndex}
                              onChange={() => updateCorrectOption(questionIndex, optionIndex)}
                              className="h-4 w-4"
                            />
                            <Input
                              value={option}
                              onChange={(event) =>
                                updateOptionText(questionIndex, optionIndex, event.target.value)
                              }
                              placeholder={`Option ${optionIndex + 1}`}
                              className="rounded-xl"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={question.options.length <= 2}
                              onClick={() => removeOption(questionIndex, optionIndex)}
                            >
                              <Trash2 className="h-4 w-4 text-slate-500" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 flex justify-end">
                        <Button type="button" variant="outline" className="rounded-xl" onClick={() => addOption(questionIndex)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add option
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <Button type="button" onClick={saveQuizHandler} disabled={quizLoading} className="h-10 w-full rounded-2xl text-sm sm:h-11 sm:w-auto">
                  {quizLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving quiz...
                    </>
                  ) : (
                    "Save Quiz Questions"
                  )}
                </Button>
              </div>
            </div>

            {mediaProgress && (
              <div className="rounded-2xl border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#dbeafe_100%)] p-4 dark:border-cyan-500/20 dark:bg-[linear-gradient(135deg,rgba(8,47,73,0.8)_0%,rgba(12,74,110,0.4)_100%)] sm:rounded-3xl sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {isProcessingVideo ? "Processing video" : "Uploading video"}
                  </p>
                  <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-950/60 dark:text-slate-200">
                    {uploadProgress}%
                  </span>
                </div>
                <Progress value={uploadProgress} className="h-3 bg-white/60 dark:bg-slate-950/60" />
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  {isProcessingVideo && <Loader2 className="h-4 w-4 animate-spin" />}
                  <p>
                    {isProcessingVideo
                      ? "Upload reached 100%. Server is processing the video and sending it to Cloudinary..."
                      : `${uploadProgress}% uploaded`}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 sm:rounded-3xl sm:p-5">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Visibility status
              </p>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
            {isFree ? <PlayCircle size={16} /> : <Lock size={16} />}
            {isFree ? "Visible in course preview" : "Locked until the course is purchased"}
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {isFree
                    ? "Students can open this lecture from the course card before purchasing."
                    : "Students will see a locked lecture in the course card until they buy the full course."}
                </p>
              </div>
            </div>

            {uploadVideInfo?.videoUrl && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 sm:rounded-3xl sm:p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Current lecture video
                </div>
                <div className="mb-3 overflow-hidden rounded-2xl bg-black">
                  <ReactPlayer
                    src={secureMediaUrl(uploadVideInfo.videoUrl)}
                    controls
                    config={YOUTUBE_PLAYER_CONFIG}
                    width="100%"
                    height="100%"
                    className="aspect-video"
                  />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {isYoutubeVideo
                    ? "This lecture is linked from YouTube. You can replace it by pasting another link or uploading a file."
                    : "A video is already attached to this lecture. You only need to upload again if you want to replace it."}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Save your changes after updating the title, visibility, uploaded video, or YouTube link.
          </p>
          <Button
            disabled={isLoading || mediaProgress}
            onClick={editLectureHandler}
            className="h-11 w-full rounded-2xl bg-blue-600 px-5 text-sm font-semibold hover:bg-blue-700 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400 sm:h-12 sm:w-auto sm:px-6 sm:text-base"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : mediaProgress ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading video...
              </>
            ) : (
              "Update Lecture"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LectureTab;