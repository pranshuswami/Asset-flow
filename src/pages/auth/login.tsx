import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff, QrCode, Sparkles } from "lucide-react";
import { AuthLayout } from "./auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrLogin } from "@/components/auth/qr-login";
import { loginSchema, type LoginInput } from "@/schemas";
import { useAuth } from "@/context/auth-context";
import { db } from "@/data/db";
import { ROLE_DASHBOARD } from "@/lib/role-access";
import type { Role } from "@/types";

export function LoginPage() {
  const { login, loginWithQr, loading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const finishLogin = (role: Role) => navigate(ROLE_DASHBOARD[role], { replace: true });
  const onSubmit = async (data: LoginInput) => {
    try { const user = await login(data.email, data.password); toast.success("Welcome back!"); finishLogin(user.role); }
    catch (error) { toast.error((error as Error).message); }
  };
  const fillDemo = () => {
    const admin = db.users.find((user) => user.role === "ADMIN" && user.status === "ACTIVE") ?? db.users[0]!;
    setValue("email", admin.email); setValue("password", "password123");
  };
  const verifyQr = async (payload: string) => {
    try { const user = await loginWithQr(payload); toast.success("QR code verified. Welcome back!"); finishLogin(user.role); }
    catch (error) { toast.error((error as Error).message); }
  };

  return <AuthLayout><div className="mb-8"><Link to="/" className="mb-6 flex items-center gap-2.5 lg:hidden"><div className="flex size-9 items-center justify-center rounded-xl gradient-primary"><svg viewBox="0 0 32 32" className="size-5" fill="none"><path d="M9 21V11l7 5 7-5v10" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></div><span className="font-bold">AssetFlow AI</span></Link><h1 className="text-2xl font-bold tracking-tight">Sign in</h1><p className="mt-1 text-sm text-muted-foreground">Welcome back. Enter your details to continue.</p></div><form onSubmit={handleSubmit(onSubmit)} className="space-y-4"><div className="space-y-1.5"><Label htmlFor="email">Work email</Label><Input id="email" type="email" placeholder="you@company.com" autoComplete="email" {...register("email")} />{errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}</div><div className="space-y-1.5"><div className="flex items-center justify-between"><Label htmlFor="password">Password</Label><Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">Forgot?</Link></div><div className="relative"><Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" autoComplete="current-password" className="pr-10" {...register("password")} /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>{errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}</div><Button type="submit" className="w-full" loading={loading}>Sign in <ArrowRight className="size-4" /></Button></form>{qrOpen ? <QrLogin loading={loading} onVerify={verifyQr} onClose={() => setQrOpen(false)} /> : <Button type="button" variant="outline" className="mt-4 w-full" onClick={() => setQrOpen(true)}><QrCode className="size-4" /> Sign in with QR code</Button>}<button onClick={fillDemo} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/30 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary/60"><Sparkles className="size-3.5 text-primary" /> Use demo admin credentials</button><p className="mt-6 text-center text-sm text-muted-foreground">Don't have an account? <Link to="/signup" className="font-medium text-primary hover:underline">Start free</Link></p></AuthLayout>;
}
