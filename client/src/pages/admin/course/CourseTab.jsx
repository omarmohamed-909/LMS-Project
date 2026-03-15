import RichTextEditor from "@/components/RichTextEditor";
import PageSkeleton from "@/components/PageSkeleton";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useEditCourseMutation,
  useGetCourseByIdQuery,
  usePublishCourseMutation,
} from "@/features/api/courseApi";
import { BadgeCheck, ImageUp, Loader2, LockOpen, Tag, Wallet } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const CourseTab = () => {
  const [input, setInput] = useState({
    courseTitle: "",
    subTitle: "",
    description: "",
    category: "",
    courseLevel: "",
    coursePrice: "",
    courseThumbnail: "",
  });
  const [existingThumbnail, setExistingThumbnail] = useState("");
  const [isFreeCourse, setIsFreeCourse] = useState(false);

  const params = useParams();
  const courseId = params.courseId;
  const { data: courseByIdData, isLoading: courseByIdLoading,refetch } =
    useGetCourseByIdQuery(courseId,{refetchOnMountOrArgChange:true});

  const [publishCourse] = usePublishCourseMutation();


  useEffect(() => {
    if (courseByIdData?.course) {
      const course = courseByIdData.course;
      setInput({
        courseTitle: course.courseTitle || "",
        subTitle: course.subTitle || "",
        description: course.description || "",
        category: course.category || "",
        courseLevel: course.courseLevel || "",
        coursePrice: course.coursePrice ?? 0,
        courseThumbnail: "",
      });
      setIsFreeCourse(!course.coursePrice || Number(course.coursePrice) <= 0);
      setExistingThumbnail(course.courseThumbnail || "");
      setPreviewThumbnail("");
    }
  }, [courseByIdData]);

  const [previewThumbnail, setPreviewThumbnail] = useState("");
  const navigate = useNavigate();

  const [editCourse, { data, isLoading, isSuccess, error }] =
    useEditCourseMutation();

  const changeEventHandeler = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };

  const selectCategory = (value) => {
    setInput({ ...input, category: value });
  };

  const selectCourseLevel = (value) => {
    setInput({ ...input, courseLevel: value });
  };

  const toggleFreeCourse = (checked) => {
    setIsFreeCourse(checked);
    setInput((current) => ({
      ...current,
      coursePrice: checked ? 0 : current.coursePrice || "",
    }));
  };
  //get file
  const selectThumbnail = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput({ ...input, courseThumbnail: file });
      const fileReader = new FileReader();
      fileReader.onloadend = () => setPreviewThumbnail(fileReader.result);
      fileReader.readAsDataURL(file);
    }
  };

  const updateCourseHandler = async () => {
    const formData = new FormData();
    formData.append("courseTitle", input.courseTitle);
    formData.append("subTitle", input.subTitle);
    formData.append("description", input.description);
    formData.append("category", input.category);
    formData.append("courseLevel", input.courseLevel);
    formData.append("coursePrice", isFreeCourse ? 0 : input.coursePrice || 0);
    if (input.courseThumbnail) {
      formData.append("courseThumbnail", input.courseThumbnail);
    }

    await editCourse({ formData, courseId });
  };

  const publishStatusHandler = async (action) => {
    try {
      const response = await publishCourse({ courseId, query:action });
      if (response.data) {
        refetch();
        toast.success(response.data.message);
      }
    } catch {
      toast.error("Failed to publish or unpublish course.");
    }
  };

  const successMessage = data?.message;
  const errorMessage =
    error?.data?.message ||
    error?.error ||
    "Failed to update course. Please try again.";

  useEffect(() => {
    if (isSuccess) {
      toast.success(successMessage || "Course updated.");
    }
    if (error) {
      toast.error(errorMessage);
    }
  }, [isSuccess, error, successMessage, errorMessage]);

  if(courseByIdLoading) return <PageSkeleton variant="form" />;


  return (
    <Card className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-950 sm:rounded-[30px]">
      <CardHeader className="flex flex-col gap-4 border-b border-slate-200/70 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/40 sm:px-6 sm:py-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <CardTitle className="text-[1.85rem] sm:text-2xl">Basic Course Information</CardTitle>
          <CardDescription className="max-w-2xl text-sm leading-6">
            Update your course title, pricing, category, and thumbnail from one place.
          </CardDescription>
        </div>
        <div className="hidden sm:flex sm:w-auto sm:flex-wrap sm:gap-3">
          <Button
            disabled={courseByIdData?.course.lectures.length === 0}
            variant="outline"
            className="h-10 rounded-2xl px-3 text-xs font-semibold sm:h-11 sm:px-5 sm:text-sm"
            onClick={() => publishStatusHandler(courseByIdData?.course.isPublished ? "false" : "true")}
          >
            {courseByIdData?.course.isPublished ? "Unpublish" : "Publish"}
          </Button>
          <Button className="h-10 rounded-2xl px-3 text-xs font-semibold sm:h-11 sm:px-5 sm:text-sm">Remove Course</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-4 sm:space-y-6 sm:p-6 md:p-8">
        <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 sm:rounded-3xl sm:p-5">
              <Label className="mb-3 block text-sm font-semibold text-slate-900 dark:text-slate-100">Title</Label>
              <Input
                type="text"
                name="courseTitle"
                value={input.courseTitle}
                onChange={changeEventHandeler}
                placeholder="Ex. Fullstack developer"
                className="h-12 rounded-2xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 sm:rounded-3xl sm:p-5">
              <Label className="mb-3 block text-sm font-semibold text-slate-900 dark:text-slate-100">Subtitle</Label>
              <Input
                type="text"
                name="subTitle"
                value={input.subTitle}
                onChange={changeEventHandeler}
                placeholder="Ex. Become a Fullstack developer from zero to hero in 2 month"
                className="h-12 rounded-2xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 sm:rounded-3xl sm:p-5">
              <Label className="mb-3 block text-sm font-semibold text-slate-900 dark:text-slate-100">Description</Label>
              <RichTextEditor input={input} setInput={setInput} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 sm:rounded-3xl sm:p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                <Tag className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
                Course settings
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                <div>
                  <Label>Category</Label>
                  <Select value={input.category} onValueChange={selectCategory}>
                    <SelectTrigger className="mt-2 h-12 rounded-2xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Category</SelectLabel>
                        <SelectItem value="Next JS">Next JS</SelectItem>
                        <SelectItem value="Data Science">Data Science</SelectItem>
                        <SelectItem value="Frontend Development">
                          Frontend Development
                        </SelectItem>
                        <SelectItem value="Fullstack Development">
                          Fullstack Development
                        </SelectItem>
                        <SelectItem value="Mern Stack Development">
                          Mern Stack Development
                        </SelectItem>
                        <SelectItem value="Javascript">Javascript</SelectItem>
                        <SelectItem value="Python">Python</SelectItem>
                        <SelectItem value="Docker">Docker</SelectItem>
                        <SelectItem value="MongoDB">MongoDB</SelectItem>
                        <SelectItem value="HTML">HTML</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Course Level</Label>
                  <Select value={input.courseLevel} onValueChange={selectCourseLevel}>
                    <SelectTrigger className="mt-2 h-12 rounded-2xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                      <SelectValue placeholder="Select a course level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Course Level</SelectLabel>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Advance">Advance</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 xl:col-span-1">
                  <Label>Price in (EGP)</Label>
                  <div className="relative mt-2">
                    <Wallet className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="number"
                      name="coursePrice"
                      value={input.coursePrice}
                      onChange={changeEventHandeler}
                      placeholder="199"
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50 pl-11 dark:border-slate-800 dark:bg-slate-900"
                      disabled={isFreeCourse}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {isFreeCourse ? "Free courses are automatically saved with a price of 0 EGP." : "Set the paid price in EGP."}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 sm:rounded-3xl sm:p-5">
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-4 dark:bg-slate-900/60">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {isFreeCourse ? <LockOpen size={16} /> : <BadgeCheck size={16} />}
                    Full course free access
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Turn this on if learners should access the entire course without payment.
                  </p>
                </div>
                <Switch checked={isFreeCourse} onCheckedChange={toggleFreeCourse} id="free-course-toggle" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 sm:rounded-3xl sm:p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                <ImageUp className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
                Course thumbnail
              </div>
              <Input
                type="file"
                onChange={selectThumbnail}
                accept="image/*"
                className="h-12 rounded-2xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
              />
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                <p className="mb-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                  Current thumbnail preview
                </p>
                {previewThumbnail || existingThumbnail ? (
                  <img
                    src={previewThumbnail || existingThumbnail}
                    className="h-48 w-full rounded-2xl object-cover sm:h-64"
                    alt="Course Thumbnail"
                  />
                ) : (
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    No thumbnail uploaded yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:pt-6">

          {/* Desktop: Save + Cancel on the right */}
          <div className="hidden sm:flex sm:w-auto sm:gap-3">
            <Button onClick={() => navigate("/admin/course")} variant="outline" className="h-11 rounded-2xl px-5 text-sm font-semibold">
              Cancel
            </Button>
            <Button disabled={isLoading} onClick={updateCourseHandler} className="h-11 rounded-2xl px-6 text-sm font-semibold">
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Please wait</>
              ) : "Save"}
            </Button>
          </div>

          {/* Mobile only */}
          <div className="flex flex-col gap-2 sm:hidden">
            {/* Publish / Remove row */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                disabled={courseByIdData?.course.lectures.length === 0}
                variant="outline"
                className="h-10 rounded-2xl text-xs font-semibold"
                onClick={() => publishStatusHandler(courseByIdData?.course.isPublished ? "false" : "true")}
              >
                {courseByIdData?.course.isPublished ? "Unpublish" : "Publish"}
              </Button>
              <Button variant="destructive" className="h-10 rounded-2xl text-xs font-semibold">
                Remove Course
              </Button>
            </div>
            {/* Save full width */}
            <Button disabled={isLoading} onClick={updateCourseHandler} className="h-11 w-full rounded-2xl text-sm font-semibold">
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Please wait</>
              ) : "Save Changes"}
            </Button>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};

export default CourseTab;
