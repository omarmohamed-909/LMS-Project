import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useResendVerificationEmailMutation } from "@/features/api/authApi";
import { ArrowLeft, Loader2, MailCheck, ShieldCheck } from "lucide-react";
import React from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const VerifyEmailNotice = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [verificationPath, setVerificationPath] = React.useState(
    location.state?.verificationPath || ""
  );
  const [verificationUrl, setVerificationUrl] = React.useState(
    location.state?.verificationUrl || ""
  );
  const [resendVerificationEmail, { isLoading }] =
    useResendVerificationEmailMutation();

  const handleResend = async () => {
    if (!email) {
      toast.error("Email is missing.");
      return;
    }

    try {
      const response = await resendVerificationEmail(email).unwrap();
      setVerificationPath(response?.verificationPath || "");
      setVerificationUrl(response?.verificationUrl || "");
      toast.success(response?.message || "Verification email sent.");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to resend verification email.");
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-7xl items-center justify-center px-4 py-10 md:px-8">
      <Card className="w-full max-w-[520px] rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-950/85">
        <CardHeader className="space-y-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Email verification
          </div>
          <CardTitle className="text-2xl">Check your inbox</CardTitle>
          <CardDescription className="text-sm leading-6">
            Your account stays inactive until you verify your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-2xl bg-blue-100 p-2 text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                <MailCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">
                  Verification email sent to
                </p>
                <p className="mt-1 break-all text-sm text-slate-600 dark:text-slate-300">
                  {email || "Open the page from signup or login with your email."}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p>1. Open your inbox.</p>
            <p>2. Click the verification link.</p>
            <p>3. After verification, log in normally.</p>
          </div>

          {(verificationPath || verificationUrl) && (
            <div className="rounded-3xl border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#dbeafe_100%)] p-4 dark:border-cyan-500/20 dark:bg-[linear-gradient(135deg,rgba(8,47,73,0.8)_0%,rgba(12,74,110,0.4)_100%)]">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Local development shortcut
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                SMTP is not configured, so you can open the verification page directly.
              </p>
              <p className="mt-2 break-all text-xs text-slate-500 dark:text-slate-400">
                {verificationUrl || verificationPath}
              </p>
              <Button
                type="button"
                onClick={() => {
                  if (verificationPath) {
                    window.location.assign(verificationPath);
                    return;
                  }

                  if (verificationUrl) {
                    window.location.assign(verificationUrl);
                  }
                }}
                className="mt-4 h-11 rounded-2xl bg-blue-600 px-5 font-semibold hover:bg-blue-700 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              >
                Open verification page
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3">
          <Button
            type="button"
            disabled={isLoading || !email}
            onClick={handleResend}
            className="h-12 rounded-2xl bg-blue-600 text-base font-semibold hover:bg-blue-700 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Resend verification email"
            )}
          </Button>
          <Link
            to="/login?mode=login"
            className="inline-flex items-center justify-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyEmailNotice;
