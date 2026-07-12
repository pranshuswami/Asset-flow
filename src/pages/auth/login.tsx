import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, Sparkles } from "lucide-react";
import { AuthLayout } from "./auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/schemas";
import { useAuth } from "@/context/auth-context";
import { db } from "@/data/db";

export function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? "/";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const onSubmit = async (data: LoginInput) => {
    try {
      await login(data.email, data.password);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const fillDemo = () => {
    const admin = db.users.find((u) => u.role === "ADMIN") ?? db.users[0]!;
    setValue("email", admin.email);
    setValue("password", "password123");
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
        <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Welcome back. Enter your details to continue.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" placeholder="you@company.com" autoComplete="email" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Forgot?
            </Link>
          </div>
          <Input id="password" type="password" placeholder="••••••••" autoComplete="current-password" {...register("password")} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          Sign in <ArrowRight className="size-4" />
        </Button>
      </form>

      <button
        onClick={fillDemo}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/30 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary/60"
      >
        <Sparkles className="size-3.5 text-primary" /> Use demo admin credentials
      </button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/signup" className="font-medium text-primary hover:underline">
          Start free
        </Link>
      </p>
    </AuthLayout>
  );
}
