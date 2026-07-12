import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { AuthLayout } from "./auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupSchema, type SignupInput } from "@/schemas";
import { useAuth } from "@/context/auth-context";


export function SignupPage() {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", organization: "", password: "", confirm: "" },
  });

  const onSubmit = async (data: SignupInput) => {
    try {
      await signup({ name: data.name, email: data.email, organization: data.organization });
      toast.success("Organization created — welcome to AssetFlow!");
      navigate("/", { replace: true });
    } catch (e) {
      toast.error((e as Error).message);
    }
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
        <h1 className="text-2xl font-bold tracking-tight">Create your workspace</h1>
        <p className="mt-1 text-sm text-muted-foreground">Start managing assets in under a minute.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" placeholder="Jane Cooper" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="organization">Organization</Label>
          <Input id="organization" placeholder="Acme Inc." {...register("organization")} />
          {errors.organization && <p className="text-xs text-destructive">{errors.organization.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" placeholder="you@company.com" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm</Label>
            <Input id="confirm" type="password" placeholder="••••••••" {...register("confirm")} />
            {errors.confirm && <p className="text-xs text-destructive">{errors.confirm.message}</p>}
          </div>
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          Create workspace <ArrowRight className="size-4" />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}