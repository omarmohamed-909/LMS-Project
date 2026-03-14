import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { purchaseApi } from "./purchaseApi";

const Course_API = "https://lms-project-steel-pi.vercel.app/api/v1/course";

export const courseApi = createApi({
  reducerPath: "courseApi",
  tagTypes: [
    "Refresh_Creator_Course",
    "Refresh_Lecture",
    "Refresh_Course",
    "Refresh_Published_Course",
    "Refresh_Search_Course",
    "Admin_Manageable_Course",
  ],
  baseQuery: fetchBaseQuery({
    baseUrl: Course_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    createCourse: builder.mutation({
      query: ({ courseTitle, category }) => ({
        url: "",
        method: "POST",
        body: { courseTitle, category },
      }),
      invalidatesTags: ["Refresh_Creator_Course"],
    }),
    getSearchCourse: builder.query({
      query: ({ query, categories, sortByPrice}) => {
        // build query string
        let queryString = `/search?query=${encodeURIComponent(query)}`;

        //append categories if any
        if(categories && categories.length > 0){
          const categoriesString = categories.map(encodeURIComponent).join(",");
          queryString += `&categories=${categoriesString}`;
        }

        // append sortByPrice is available
        if(sortByPrice){
          queryString += `&sortByPrice=${encodeURIComponent(sortByPrice)}`;
        }

        return {
          url: queryString,
          method: "GET",
          credentials: "omit",
        };
      },
      providesTags: (result) =>
        result?.courses
          ? [
              "Refresh_Search_Course",
              ...result.courses.map((course) => ({
                type: "Refresh_Course",
                id: course._id,
              })),
            ]
          : ["Refresh_Search_Course"],
    }),
    getPublishedCourse: builder.query({
      query: () => ({
        url: "/published-courses",
        method: "GET",
        credentials: "omit",
      }),
      providesTags: (result) =>
        result?.courses
          ? [
              "Refresh_Published_Course",
              ...result.courses.map((course) => ({
                type: "Refresh_Course",
                id: course._id,
              })),
            ]
          : ["Refresh_Published_Course"],
    }),
    getCreatorCourse: builder.query({
      query: () => ({
        url: "",
        method: "GET",
      }),
      providesTags: (result) =>
        result?.courses
          ? [
              "Refresh_Creator_Course",
              ...result.courses.map((course) => ({
                type: "Refresh_Course",
                id: course._id,
              })),
            ]
          : ["Refresh_Creator_Course"],
    }),
    getAdminManageableCourses: builder.query({
      query: () => ({
        url: "/admin/manageable-courses",
        method: "GET",
      }),
      providesTags: ["Admin_Manageable_Course"],
    }),
    editCourse: builder.mutation({
      query: ({ formData, courseId }) => ({
        url: `/${courseId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { courseId }) => [
        "Refresh_Creator_Course",
        "Refresh_Published_Course",
        "Refresh_Search_Course",
        { type: "Refresh_Course", id: courseId },
      ],
      async onQueryStarted({ courseId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            purchaseApi.util.invalidateTags([
              { type: "PurchaseStatus", id: courseId },
            ])
          );
        } catch {
          // Let the mutation error flow handle failures.
        }
      },
    }),
    getCourseById: builder.query({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "GET",
      }),
      providesTags: (result, error, courseId) => [
        { type: "Refresh_Course", id: courseId },
      ],
    }),
    createLecture: builder.mutation({
      query: ({ lectureTitle, courseId }) => ({
        url: `/${courseId}/lecture`,
        method: "POST",
        body: { lectureTitle },
      }),
    }),
    getCourseLecture: builder.query({
      query: (courseId) => ({
        url: `/${courseId}/lecture`,
        method: "GET",
      }),
      providesTags: ["Refresh_Lecture"],
    }),
    editLecture: builder.mutation({
      query: ({
        lectureTitle,
        videoInfo,
        isPreviewFree,
        courseId,
        lectureId,
      }) => ({
        url: `/${courseId}/lecture/${lectureId}`,
        method: "POST",
        body: { lectureTitle, videoInfo, isPreviewFree },
      }),
    }),
    updateLectureQuiz: builder.mutation({
      query: ({ courseId, lectureId, quizQuestions }) => ({
        url: `/${courseId}/lecture/${lectureId}/quiz`,
        method: "PATCH",
        body: { quizQuestions },
      }),
    }),
    reorderLecture: builder.mutation({
      query: ({ courseId, lectureId, direction }) => ({
        url: `/${courseId}/lecture/${lectureId}/reorder`,
        method: "POST",
        body: { direction },
      }),
      invalidatesTags: ["Refresh_Lecture"],
    }),
    removeLecture: builder.mutation({
      query: (lectureId) => ({
        url: `/lecture/${lectureId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Refresh_Lecture"],
    }),
    getLectureById: builder.query({
      query: (lectureId) => ({
        url: `/lecture/${lectureId}`,
        method: "GET",
      }),
    }),
    publishCourse: builder.mutation({
      query: ({ courseId, query }) => ({
        url: `/${courseId}?publish=${query}`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, { courseId }) => [
        "Refresh_Creator_Course",
        "Refresh_Published_Course",
        "Refresh_Search_Course",
        { type: "Refresh_Course", id: courseId },
      ],
      async onQueryStarted({ courseId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            purchaseApi.util.invalidateTags([
              { type: "PurchaseStatus", id: courseId },
            ])
          );
        } catch {
          // Let the mutation error flow handle failures.
        }
      },
    }),
  }),
});
export const {
  useCreateCourseMutation,
  useGetSearchCourseQuery,
  useGetPublishedCourseQuery,
  useGetCreatorCourseQuery,
  useGetAdminManageableCoursesQuery,
  useEditCourseMutation,
  useGetCourseByIdQuery,
  useCreateLectureMutation,
  useGetCourseLectureQuery,
  useEditLectureMutation,
  useUpdateLectureQuizMutation,
  useReorderLectureMutation,
  useRemoveLectureMutation,
  useGetLectureByIdQuery,
  usePublishCourseMutation,
} = courseApi;
