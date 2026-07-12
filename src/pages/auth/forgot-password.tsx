import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, MailCheck } from "lucide-react";
import { AuthLayout } from "./auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/schemas";
import { authService } from "@/services/auth.service";
import { useState } from "react";

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordInput) => {
    await authService.forgotPassword(data.email);
    setSent(true);
    toast.success("Reset link sent to your email");
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <Link to="/" className="mb-6 flex items-center gap-2.5 lg:hidden">
          <div className="flex size-9 items-center justify-center rounded-xl gradient-primary">
            <svg viewBox="0 0 32 32" className="size-5" fill="none">
              <path d="M9 21V11l7 5 7-5v10" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-bold">AssetFlow AI</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Reset password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {sent ? "Check your inbox for the next step." : "Enter your email and we'll send a reset link."}
        </p>
      </div>

      {sent ? (
        <div className="flex flex-col items-center rounded-xl border border-border bg-secondary/30 p-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
            <MailCheck className="size-6" />
          </div>
          <p className="mt-3 text-sm">We've sent a secure link to reset your password.</p>
          <Link to="/login" className="mt-4 text-sm font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input id="email" type="email" placeholder="you@company.com" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <Button type="submit" className="w-full">
            Send reset link <ArrowRight className="size-4" />
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
