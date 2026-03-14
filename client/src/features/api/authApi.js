import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { courseApi } from "./courseApi";
import { userLoggedIn, userloggedout } from "../authSlice";

const USER_API = "https://lms-project-steel-pi.vercel.app/api/v1/user/";

const getManageableCourseById = (state, courseId) => {
    const manageableCourses =
        courseApi.endpoints.getAdminManageableCourses.select()(state)?.data?.courses ?? [];

    return manageableCourses.find((course) => course._id === courseId) ?? null;
};

export const authApi = createApi({
    reducerPath: "authApi",
    tagTypes: ["CurrentUser", "AdminUsers"],
    baseQuery: fetchBaseQuery({
        baseUrl: USER_API,
        credentials: "include",
    }),
    endpoints: (builder) => ({
        registerUser: builder.mutation({
            query: (inputData) => ({
                url: "register",
                method: "POST",
                body: inputData,
            }),
        }),
        loginUser: builder.mutation({
            query: (inputData) => ({
                url: "login",
                method: "POST",
                body: inputData,
            }),
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                try {
                    const result = await queryFulfilled;
                    dispatch(userLoggedIn({ user: result.data.user }));
                } catch (error) {
                    console.log(error);
                }
            },
        }),
        logoutUser: builder.mutation({
            query: () => ({
                url: "logout",
                method: "GET",
            }),
            async onQueryStarted(_, { dispatch }) {
                try {
                    dispatch(userloggedout());
                } catch (error) {
                    console.log(error);
                }
            },
        }),
        loadUser: builder.query({
            query: () => ({
                url: "profile",
                method: "GET",
            }),
            providesTags: ["CurrentUser"],
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                try {
                    const result = await queryFulfilled;
                    dispatch(userLoggedIn({ user: result.data.user }));
                } catch (error) {
                    console.log(error);
                }
            },
        }),
        updateUser: builder.mutation({
            query: (formData) => ({
                url: "profile/update",
                method: "PUT",
                body: formData,
                credentials: "include",
            }),
            invalidatesTags: ["CurrentUser"],
        }),
        forgotPassword: builder.mutation({
            query: (email) => ({
                url: "forgot-password",
                method: "POST",
                body: { email },
            }),
        }),
        resetPassword: builder.mutation({
            query: ({ token, password }) => ({
                url: `reset-password/${token}`,
                method: "POST",
                body: { password },
            }),
        }),
        verifyEmail: builder.mutation({
            query: (token) => ({
                url: `verify-email/${token}`,
                method: "POST",
            }),
        }),
        resendVerificationEmail: builder.mutation({
            query: (email) => ({
                url: "verify-email/resend",
                method: "POST",
                body: { email },
            }),
        }),
        getAdminUsers: builder.query({
            query: () => ({
                url: "admin/users",
                method: "GET",
            }),
            providesTags: ["AdminUsers"],
        }),
        updateUserRole: builder.mutation({
            query: ({ userId, role }) => ({
                url: `admin/users/${userId}/role`,
                method: "PATCH",
                body: { role },
            }),
            async onQueryStarted({ userId, role }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    authApi.util.updateQueryData("getAdminUsers", undefined, (draft) => {
                        const user = draft?.users?.find((item) => item._id === userId);

                        if (user) {
                            user.role = role;
                        }
                    })
                );

                try {
                    await queryFulfilled;
                } catch (error) {
                    patchResult.undo();
                    console.log(error);
                }
            },
            invalidatesTags: ["AdminUsers"],
        }),
        deleteAdminUser: builder.mutation({
            query: ({ userId }) => ({
                url: `admin/users/${userId}`,
                method: "DELETE",
            }),
            async onQueryStarted({ userId }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    authApi.util.updateQueryData("getAdminUsers", undefined, (draft) => {
                        if (draft?.users) {
                            draft.users = draft.users.filter((item) => item._id !== userId);
                        }
                    })
                );

                try {
                    await queryFulfilled;
                } catch (error) {
                    patchResult.undo();
                    console.log(error);
                }
            },
            invalidatesTags: ["AdminUsers"],
        }),
        updateUserCourseAccess: builder.mutation({
            query: ({ userId, courseId, action }) => ({
                url: `admin/users/${userId}/course-access`,
                method: "PATCH",
                body: { courseId, action },
            }),
            async onQueryStarted({ userId, courseId, action }, { dispatch, getState, queryFulfilled }) {
                const course = getManageableCourseById(getState(), courseId);
                const patchResult = dispatch(
                    authApi.util.updateQueryData("getAdminUsers", undefined, (draft) => {
                        const user = draft?.users?.find((item) => item._id === userId);

                        if (!user) {
                            return;
                        }

                        if (!Array.isArray(user.enrolledCourses)) {
                            user.enrolledCourses = [];
                        }

                        if (action === "grant") {
                            const alreadyGranted = user.enrolledCourses.some(
                                (enrolledCourse) => enrolledCourse._id === courseId
                            );

                            if (!alreadyGranted) {
                                user.enrolledCourses.unshift(
                                    course ?? {
                                        _id: courseId,
                                        courseTitle: "Course access",
                                        creator: null,
                                        isPublished: false,
                                    }
                                );
                            }
                        }

                        if (action === "revoke") {
                            user.enrolledCourses = user.enrolledCourses.filter(
                                (enrolledCourse) => enrolledCourse._id !== courseId
                            );
                        }
                    })
                );

                try {
                    await queryFulfilled;
                } catch (error) {
                    patchResult.undo();
                    console.log(error);
                }
            },
            invalidatesTags: ["AdminUsers"],
        }),
    }),
});

export const {
    useRegisterUserMutation,
    useLoginUserMutation,
    useLogoutUserMutation,
    useLoadUserQuery,
    useUpdateUserMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useVerifyEmailMutation,
    useResendVerificationEmailMutation,
    useGetAdminUsersQuery,
    useDeleteAdminUserMutation,
    useUpdateUserRoleMutation,
    useUpdateUserCourseAccessMutation,
} = authApi;