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
import { useResetPasswordMutation } from "@/features/api/authApi";
import { Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const response = await resetPassword({ token, password }).unwrap();
      toast.success(response?.message || "Password reset successfully.");
      navigate("/login");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to reset password.");
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-7xl items-center justify-center px-4 py-10 md:px-8">
      <Card className="w-full max-w-[480px] rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-950/85">
        <CardHeader className="space-y-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-300">
            <LockKeyhole className="h-3.5 w-3.5" />
            Reset password
          </div>
          <CardTitle className="text-2xl">Create a new password</CardTitle>
          <CardDescription className="text-sm leading-6">
            Choose a new password for your account and continue to login.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3">
            <Label>New password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a new password"
                className="h-12 rounded-2xl border-slate-200 bg-slate-50 pr-12 dark:border-slate-800 dark:bg-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="grid gap-3">
            <Label>Confirm password</Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter the new password"
                className="h-12 rounded-2xl border-slate-200 bg-slate-50 pr-12 dark:border-slate-800 dark:bg-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="button"
            disabled={isLoading}
            onClick={handleSubmit}
            className="h-12 w-full rounded-2xl bg-blue-600 text-base font-semibold hover:bg-blue-700 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Reset password"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;