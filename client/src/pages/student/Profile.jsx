import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageSkeleton from "@/components/PageSkeleton";
import { BookOpen, Eye, EyeOff, KeyRound, Loader2, Mail, SquarePen, User2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import Course from "./Course";
import {
  useLoadUserQuery,
  useUpdateUserMutation,
} from "@/features/api/authApi";
import { toast } from "sonner";

const Profile = () => {
  const [name, setName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data, isLoading, refetch } = useLoadUserQuery();
  const [
    updateUser,
    {
      isLoading: updateUserIsloading,
    },
  ] = useUpdateUserMutation();

  const onChangeHandeler = (e) => {
    const file = e.target.files?.[0];
    if (file) setProfilePhoto(file);
  };

  const updateUserHandler = async () => {
    const formData = new FormData();
    formData.append("name", name || user?.name || "");
    if (profilePhoto) {
      formData.append("profilePhoto", profilePhoto);
    }

    try {
      const response = await updateUser(formData).unwrap();
      await refetch();
      toast.success(response?.message || "Profile updated.");
    } catch (updateError) {
      toast.error(updateError?.data?.message || "Faild to update profile.");
    }
  };

  const updatePasswordHandler = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Confirm password does not match.");
      return;
    }

    const formData = new FormData();
    formData.append("currentPassword", currentPassword);
    formData.append("newPassword", newPassword);
    formData.append("confirmPassword", confirmPassword);

    try {
      const response = await updateUser(formData).unwrap();
      await refetch();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setIsPasswordDialogOpen(false);
      toast.success(response?.message || "Password updated.");
    } catch (updateError) {
      toast.error(updateError?.data?.message || "Faild to update profile.");
    }
  };

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (data?.user) {
      setName(data.user.name || "");
      setPreviewPhotoUrl(data.user.photoUrl || "https://github.com/shadcn.png");
    }
  }, [data]);

  useEffect(() => {
    if (!profilePhoto) {
      setPreviewPhotoUrl(data?.user?.photoUrl || "https://github.com/shadcn.png");
      return;
    }

    const objectUrl = URL.createObjectURL(profilePhoto);
    setPreviewPhotoUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [profilePhoto, data?.user?.photoUrl]);

  if (isLoading) return <PageSkeleton variant="profile" />;

  const user = data && data.user;
  const enrolledCourses = user?.enrolledCourses || [];

  return (
    <div className="mx-auto my-10 max-w-6xl px-4">
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar className="h-28 w-28 ring-4 ring-white shadow-lg dark:ring-slate-900 md:h-32 md:w-32">
              <AvatarImage
                src={user?.photoUrl || "https://github.com/shadcn.png"}
                alt="profile avatar"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Profile
                </p>
                <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {user?.name}
                </h1>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Email</p>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
                  <User2 className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Role</p>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{user?.role?.toUpperCase()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <Badge className="w-fit rounded-full bg-blue-100 px-4 py-2 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300">
              {enrolledCourses.length} enrolled courses
            </Badge>
            <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2">
              <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="h-11 w-full rounded-full bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_100%)] px-6 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-[linear-gradient(135deg,#e2e8f0_0%,#ffffff_100%)] dark:text-slate-900"
                  >
                    <SquarePen className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl border-slate-200 bg-white/95 sm:max-w-xl dark:border-slate-800 dark:bg-slate-950/95">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-5 py-4">
                    <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                      <Avatar className="h-20 w-20 ring-4 ring-white shadow-md dark:ring-slate-800">
                        <AvatarImage src={previewPhotoUrl} alt="profile preview" />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Current profile photo
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Choose a new image and the preview will update instantly.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label>Name</Label>
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Name"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label>Profile Photo</Label>
                      <div className="col-span-3 space-y-2">
                        <Input
                          onChange={onChangeHandeler}
                          type="file"
                          accept="image/*"
                        />
                        {profilePhoto && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Selected: {profilePhoto.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      disabled={updateUserIsloading}
                      onClick={updateUserHandler}
                    >
                      {updateUserIsloading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Please Wait
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-11 w-full rounded-full border-slate-300 bg-white/80 px-6 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white hover:shadow-md dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-slate-500"
                  >
                    <KeyRound className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl border-slate-200 bg-white/95 sm:max-w-xl dark:border-slate-800 dark:bg-slate-950/95">
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                      Enter your current password and a new one.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-3 py-4">
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Current password"
                        className="pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                      >
                        {showCurrentPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password"
                        className="pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      disabled={updateUserIsloading}
                      onClick={updatePasswordHandler}
                    >
                      {updateUserIsloading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Please Wait
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm dark:border-slate-800">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Courses you're enrolled in
            </CardTitle>
            <CardDescription>
              Continue learning from the courses already attached to your account.
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit rounded-full px-4 py-2">
            {enrolledCourses.length} total
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {enrolledCourses.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900/50">
                <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">You haven't enrolled yet</h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Browse the course catalog and start your first learning path.
                </p>
              </div>
            ) : (
              enrolledCourses.map((course) => (
                <Course course={course} key={course._id} />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
