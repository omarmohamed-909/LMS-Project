import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const DEFAULT_API_BASE_URL =
  typeof window !== "undefined" && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
    ? "http://localhost:8080"
    : "https://lms-project-steel-pi.vercel.app";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
const COURSE_PURCHASE_API = `${API_BASE_URL}/api/v1/purchase`;
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
