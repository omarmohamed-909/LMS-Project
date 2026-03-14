import {
  BadgeCheck,
  Bell,
  BookOpen,
  CircleHelp,
  House,
  LayoutDashboard,
  LogOut,
  Menu,
  School,
  UserCircle2,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import DarkMode from "@/DarkMode";
import { useGetCommentNotificationsQuery } from "@/features/api/courseProgressApi";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Separator } from "./ui/separator";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useLogoutUserMutation } from "@/features/api/authApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const hideCenterNav = location.pathname === "/login";
  const logoutHandler = async () => {
    await logoutUser();
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "User log out.");
      navigate("/login");
    }
  }, [isSuccess, data?.message, navigate]);

  return (
    <div className="fixed left-0 right-0 top-0 z-10 border-b border-gray-200 bg-white/88 backdrop-blur-xl duration-300 dark:border-b-gray-800 dark:bg-[#020817]/88">
      {/* Desktop */}
      <div className="relative mx-auto hidden h-16 max-w-7xl items-center px-4 lg:flex lg:px-6">
        <div className="flex items-center justify-self-start">
          <div className="flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-300">
              <School size={22} />
            </span>
            <Link to="/">
              <h1 className="hidden bg-[linear-gradient(135deg,#020617_0%,#1d4ed8_100%)] bg-clip-text text-2xl font-extrabold text-transparent dark:bg-[linear-gradient(135deg,#ffffff_0%,#67e8f9_100%)] lg:block">
                E-Learning
              </h1>
            </Link>
          </div>
        </div>
        {!hideCenterNav && (
          <nav className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center">
            <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 p-1 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-sm dark:bg-cyan-500/10 dark:text-cyan-300"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100"
                  }`
                }
              >
                <House className="h-4 w-4" />
                Home
              </NavLink>
              <NavLink
                to="/courses"
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-sm dark:bg-cyan-500/10 dark:text-cyan-300"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100"
                  }`
                }
              >
                <BookOpen className="h-4 w-4" />
                Courses
              </NavLink>
              <NavLink
                to="/about-us"
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-sm dark:bg-cyan-500/10 dark:text-cyan-300"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100"
                  }`
                }
              >
                <CircleHelp className="h-4 w-4" />
                About Us
              </NavLink>
            </div>
          </nav>
        )}
        {/* User icons and dark mode icon  */}
        <div className="ml-auto flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/70 px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
          {user && <CommentNotifications user={user} />}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer ring-2 ring-transparent transition hover:ring-slate-200 dark:hover:ring-slate-700">
                  <AvatarImage
                    src={user?.photoUrl || "https://github.com/shadcn.png"}
                    alt="@shadcn"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 rounded-3xl border border-slate-200/80 bg-white/95 p-2 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-950/95">
                <DropdownMenuLabel className="rounded-2xl px-3 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11 ring-2 ring-slate-100 dark:ring-slate-800">
                      <AvatarImage
                        src={user?.photoUrl || "https://github.com/shadcn.png"}
                        alt="profile avatar"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {user?.name}
                      </p>
                      <p className="truncate text-xs font-normal text-slate-500 dark:text-slate-400">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="rounded-2xl px-3 py-3 focus:bg-slate-100 dark:focus:bg-slate-900">
                    <Link to="/" className="flex w-full items-center gap-3 font-medium">
                      <House className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
                      Home
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-2xl px-3 py-3 focus:bg-slate-100 dark:focus:bg-slate-900">
                    <Link to="my-learning" className="flex w-full items-center gap-3 font-medium">
                      <BookOpen className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
                      My learning
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-2xl px-3 py-3 focus:bg-slate-100 dark:focus:bg-slate-900">
                    <Link to="profile" className="flex w-full items-center gap-3 font-medium">
                      <UserCircle2 className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
                      Edit Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={logoutHandler}
                    className="rounded-2xl px-3 py-3 font-medium focus:bg-slate-100 dark:focus:bg-slate-900"
                  >
                    <LogOut className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                {user?.role === "instructor" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="rounded-2xl px-3 py-3 focus:bg-slate-100 dark:focus:bg-slate-900">
                      <Link to="/admin/dashboard" className="flex w-full items-center gap-3 font-medium">
                        <BadgeCheck className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" className="rounded-full" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button className="rounded-full" onClick={() => navigate("/login")}>Signup</Button>
            </div>
          )}
          <DarkMode />
        </div>
      </div>
      {/* Mobile device  */}
      <div className="flex h-16 items-center justify-between px-4 lg:hidden">
        <Link to="/" className="flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-300">
            <School size={20} />
          </span>
          <h1 className="text-xl font-extrabold">E-learning</h1>
        </Link>
        <MobileNavbar user={user} logoutHandler={logoutHandler} />
      </div>
    </div>
  );
};

export default Navbar;

const MobileNavbar = ({ user, logoutHandler }) => {
  const navigate = useNavigate();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="rounded-full border-slate-200 bg-white/90 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
          variant="outline"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent hideCloseButton className="flex w-[90%] max-w-none flex-col overflow-hidden border-l border-slate-200 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] p-0 dark:border-slate-800 dark:bg-[linear-gradient(180deg,#020617_0%,#081226_100%)] sm:w-[420px] md:w-[460px]">
        <SheetHeader className="mt-2 flex flex-row items-center justify-between border-b border-slate-200/80 px-4 pb-4 dark:border-slate-800 sm:px-5">
          <SheetTitle className="pr-2 text-lg font-bold sm:text-xl">
            <Link to="/">E-Learning</Link>
          </SheetTitle>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {user && <CommentNotifications user={user} compact />}
            <DarkMode />
            <SheetClose asChild>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-9 w-9 rounded-xl border-slate-200 bg-white/90 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900 sm:h-10 sm:w-10"
              >
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {user && (
            <div className="mb-5 rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/60">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 ring-2 ring-slate-100 dark:ring-slate-800">
                  <AvatarImage
                    src={user?.photoUrl || "https://github.com/shadcn.png"}
                    alt="profile avatar"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {user?.name}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          <nav className="space-y-2">
            <SheetClose asChild>
              <Link
                to="/"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-medium text-slate-800 transition-colors hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                <House className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
                Home
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link
                to="/courses"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-medium text-slate-800 transition-colors hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                <BookOpen className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
                Courses
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link
                to="/about-us"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-medium text-slate-800 transition-colors hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                <CircleHelp className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
                About Us
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link
                to="/my-learning"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-medium text-slate-800 transition-colors hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                <BookOpen className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
                My Learning
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link
                to="/profile"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-medium text-slate-800 transition-colors hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                <UserCircle2 className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
                Edit Profile
              </Link>
            </SheetClose>
            {user?.role === "instructor" && (
              <SheetClose asChild>
                <button
                  type="button"
                  onClick={() => navigate("/admin/dashboard")}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-base font-medium text-slate-800 transition-colors hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900"
                >
                  <LayoutDashboard className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
                  Dashboard
                </button>
              </SheetClose>
            )}
          </nav>
        </div>
        <Separator className="shrink-0 bg-slate-200 dark:bg-slate-800" />
        {user?.role === "instructor" && (
          <div className="shrink-0 px-5 pt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Instructor Access
          </div>
        )}
        <SheetFooter className="shrink-0 bg-white/80 p-5 dark:bg-slate-950/75">
          {user ? (
            <SheetClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={() => logoutHandler()}
                className="h-12 w-full justify-start rounded-2xl border-slate-200 bg-white/70 text-base font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </SheetClose>
          ) : (
            <SheetClose asChild>
              <Button
                type="button"
                onClick={() => navigate("/login")}
                className="h-12 w-full rounded-2xl"
              >
                Login
              </Button>
            </SheetClose>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

const CommentNotifications = ({ user, compact = false }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const hasAuthToken = typeof window !== "undefined" && Boolean(window.localStorage.getItem("lms_auth_token"));
  const storageKey = `comment-notifications-seen:${user?._id}`;
  const [seenNotifications, setSeenNotifications] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem(storageKey) || "{}");
    } catch {
      return {};
    }
  });

  const { data, isLoading, refetch } = useGetCommentNotificationsQuery(undefined, {
    skip: !user?._id || !hasAuthToken,
    pollingInterval: 5000,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const notifications = useMemo(() => data?.notifications ?? [], [data?.notifications]);
  const unreadNotifications = useMemo(
    () =>
      notifications.filter((notification) => {
        const lastSeenAt = seenNotifications[notification.notificationKey];

        return !lastSeenAt || new Date(notification.latestCommentAt).getTime() > new Date(lastSeenAt).getTime();
      }),
    [notifications, seenNotifications]
  );
  const unreadCount = unreadNotifications.length;
  const notificationDescription =
    user?.role === "instructor"
      ? "Student comments on your course lectures."
      : "Instructor replies and updates on your lectures.";

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(seenNotifications));
    } catch {
      // Ignore storage failures.
    }
  }, [seenNotifications, storageKey]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refetch();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refetch]);

  const handleNotificationClick = (notification) => {
    setSeenNotifications((currentValue) => ({
      ...currentValue,
      [notification.notificationKey]: notification.latestCommentAt,
    }));
    navigate(`/course-progress/${notification.courseId}?lectureId=${notification.lectureId}`);
  };

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={`relative rounded-full border-slate-200 bg-white/90 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 ${
            compact ? "h-10 w-10" : "h-11 w-11"
          }`}
        >
          <Bell className="h-4.5 w-4.5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Comment notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[360px] rounded-3xl border border-slate-200/80 bg-white/95 p-2 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-950/95"
      >
        <DropdownMenuLabel className="rounded-2xl px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Comment notifications</p>
              <p className="mt-1 text-xs font-normal text-slate-500 dark:text-slate-400">
                {notificationDescription}
              </p>
            </div>
            {unreadCount > 0 && (
              <Badge className="rounded-full bg-blue-100 px-2.5 py-1 text-xs text-blue-700 hover:bg-blue-100 dark:bg-cyan-500/10 dark:text-cyan-300">
                {unreadCount} new
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400">Loading notifications...</div>
        ) : unreadNotifications.length === 0 ? (
          <div className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
            No comment notifications yet.
          </div>
        ) : (
          unreadNotifications.map((notification) => {
            return (
              <DropdownMenuItem
                key={notification.notificationKey}
                className="rounded-2xl px-3 py-3 focus:bg-slate-100 dark:focus:bg-slate-900"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex w-full items-start gap-3">
                  <Avatar className="mt-0.5 h-9 w-9 shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
                    <AvatarImage
                      src={notification.commenter?.photoUrl || "https://github.com/shadcn.png"}
                      alt={notification.commenter?.name || "commenter"}
                    />
                    <AvatarFallback className="text-[11px] font-semibold uppercase">
                      {(notification.commenter?.name || "User")
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {notification.lectureTitle}
                      </p>
                      <div className="flex items-center gap-2">
                        {notification.commentsCount > 1 && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            +{notification.commentsCount - 1}
                          </span>
                        )}
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
                      </div>
                    </div>

                    <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                      {notification.courseTitle}
                    </p>

                    <p className="mt-2 line-clamp-2 rounded-xl bg-slate-50 px-2.5 py-2 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                      {notification.commenter?.name ? `${notification.commenter.name}: ` : ""}
                      {notification.latestCommentText}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};