import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const COURSE_PURCHASE_API = "https://lms-project-steel-pi.vercel.app/api/v1/purchase";
const AUTH_TOKEN_KEY = "lms_auth_token";

const getStoredToken = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY) || "";
};

export const purchaseApi = createApi({
  reducerPath: "purchaseApi",
  tagTypes: ["PurchaseStatus"],
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_PURCHASE_API,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = getStoredToken();

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation({
      query: (courseId) => ({
        url: "/checkout/create-checkout-session",
        method: "POST",
        body: { courseId },
      }),
    }),
    getCourseDetailWithStatus: builder.query({
      query: (courseId) => ({
        url: `/course/${courseId}/detail-with-status`,
        method: "GET",
      }),
      providesTags: (result, error, courseId) => [
        { type: "PurchaseStatus", id: courseId },
      ],
    }),
    verifyCheckoutSession: builder.mutation({
      query: ({ sessionId, courseId }) => ({
        url: "/checkout/verify-session",
        method: "POST",
        body: { sessionId, courseId },
      }),
      invalidatesTags: ["PurchaseStatus"],
    }),
    getPurchasedCourses: builder.query({
      query: () => ({
        url: "/",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateCheckoutSessionMutation,
  useGetCourseDetailWithStatusQuery,
  useVerifyCheckoutSessionMutation,
  useGetPurchasedCoursesQuery,
} = purchaseApi;
