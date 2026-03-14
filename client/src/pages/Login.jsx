//omar12345

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useLoginUserMutation,
  useRegisterUserMutation,
} from "@/features/api/authApi";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const [signupInput, setSignupInput] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loginInput, setLoginInput] = useState({ email: "", password: "" });
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [searchParams] = useSearchParams();

  const [
    registerUser,
    {
      data: registerData,
      error: registerError,
      isLoading: registerIsLoading,
      isSuccess: registerIsSuccess,
    },
  ] = useRegisterUserMutation();
  const [
    loginUser,
    {
      data: loginData,
      error: loginError,
      isLoading: loginIsLoading,
      isSuccess: loginIsSuccess,
    },
  ] = useLoginUserMutation();
  const navigate = useNavigate();
  const defaultTab = searchParams.get("mode") === "login" ? "login" : "signup";

  const changeInputHandeler = (e, type) => {
    const { name, value } = e.target;
    if (type === "signup") {
      setSignupInput({ ...signupInput, [name]: value });
    } else {
      setLoginInput({ ...loginInput, [name]: value });
    }
  };

  const handlerRegistration = async (type) => {
    const inputData = type === "signup" ? signupInput : loginInput;
    const action = type === "signup" ? registerUser : loginUser;
    await action(inputData);
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };
  useEffect(() => {
    if (registerIsSuccess && registerData) {
      toast.success(registerData.message || "Signup successful.");
      const email = encodeURIComponent(registerData.email || signupInput.email);
      navigate(`/verify-email-notice?email=${email}`, {
        replace: true,
        state: {
          verificationPath: registerData.verificationPath,
          verificationUrl: registerData.verificationUrl,
        },
      });
    }
    if (registerError) {
      toast.error(registerError.data?.message || "Signup Failed");
    }
    if (loginIsSuccess && loginData) {
      toast.success(loginData.message || "Login successful.");
      navigate("/");
    }
    if (loginError) {
      const errorMessage = loginError.data?.message || "Login Failed";
      toast.error(errorMessage);

      if (loginError.data?.requiresVerification) {
        const email = loginError.data?.email || loginInput.email;
        navigate(`/verify-email-notice?email=${encodeURIComponent(email)}`);
      }
    }
  }, [
    loginData,
    registerData,
    loginError,
    registerError,
    loginIsSuccess,
    registerIsSuccess,
    navigate,
    loginInput.email,
    signupInput.email,
  ]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-7xl items-center justify-center px-4 py-10 md:px-8">
      <div className="flex w-full justify-center">
        <Tabs defaultValue={defaultTab} className="w-full max-w-[440px]">
            <TabsList className="grid h-12 w-full grid-cols-2 rounded-2xl bg-slate-200/70 p-1 dark:bg-slate-800/80">
            <TabsTrigger value="signup">Signup</TabsTrigger>
            <TabsTrigger value="login">Login</TabsTrigger>
          </TabsList>
          <TabsContent value="signup">
            <Card className="rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-950/85">
              <CardHeader className="space-y-3 pb-2">
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  New account
                </div>
                <CardTitle className="text-2xl">Signup</CardTitle>
                <CardDescription className="text-sm leading-6">
                  Create your account to save courses, track progress, and access your dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-name">Name</Label>
                  <Input
                    type="text"
                    name="name"
                    value={signupInput.name}
                    onChange={(e) => changeInputHandeler(e, "signup")}
                    placeholder="Eg. Omar Mohamed"
                    required="true"
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-username">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="email"
                      name="email"
                      value={signupInput.email}
                      onChange={(e) => changeInputHandeler(e, "signup")}
                      placeholder="Eg. omar@gmail.com"
                      required="true"
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50 pl-11 dark:border-slate-800 dark:bg-slate-900"
                    />
                  </div>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-username">Password</Label>
                  <div className="relative">
                    <Input
                      type={showSignupPassword ? "text" : "password"}
                      name="password"
                      value={signupInput.password}
                      placeholder="Create a strong password"
                      onChange={(e) => changeInputHandeler(e, "signup")}
                      required="true"
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50 pr-12 dark:border-slate-800 dark:bg-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword((current) => !current)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      {showSignupPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-3">
                <Button
                  disabled={registerIsLoading}
                  onClick={() => handlerRegistration("signup")}
                  className="h-12 rounded-2xl bg-blue-600 text-base font-semibold hover:bg-blue-700 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
                >
                  {registerIsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please
                      wait
                    </>
                  ) : (
                    "Signup"
                  )}
                </Button>
                <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                  By signing up, you can manage purchases, profile updates, and learning progress in one place.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="login">
            <Card className="rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-950/85">
              <CardHeader className="space-y-3 pb-2">
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Welcome back
                </div>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription className="text-sm leading-6">
                  Access your profile, purchased courses, and saved progress.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-current">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="email"
                      name="email"
                      value={loginInput.email}
                      onChange={(e) => changeInputHandeler(e, "login")}
                      placeholder="Eg. omar@gmail.com"
                      required="true"
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50 pl-11 dark:border-slate-800 dark:bg-slate-900"
                    />
                  </div>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-new">Password</Label>
                  <div className="relative">
                    <Input
                      type={showLoginPassword ? "text" : "password"}
                      name="password"
                      value={loginInput.password}
                      onChange={(e) => changeInputHandeler(e, "login")}
                      placeholder="Enter your password"
                      required="true"
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50 pr-12 dark:border-slate-800 dark:bg-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((current) => !current)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      {showLoginPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-3">
                <Button
                  disabled={loginIsLoading}
                  onClick={() => handlerRegistration("login")}
                  className="h-12 rounded-2xl bg-blue-600 text-base font-semibold hover:bg-blue-700 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
                >
                  {loginIsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please
                      wait
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
                <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                  Use the same account to keep your courses and progress synced.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
export default Login;
