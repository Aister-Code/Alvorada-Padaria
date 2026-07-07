import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignInButton } from "@/components/ui/signin.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import AdminDashboard from "./_components/AdminDashboard.tsx";

export default function AdminPage() {
  return (
    <>
      <AuthLoading>
        <div className="flex items-center justify-center min-h-screen">
          <Spinner className="size-8" />
        </div>
      </AuthLoading>
      <Unauthenticated>
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-background px-6">
          <img
            src="https://hercules-cdn.com/file_HPjTSRmu0Y2UO4eTkNA5IUvH"
            alt="Alvorada"
            className="w-16 h-16 rounded-2xl object-cover"
          />
          <div className="text-center space-y-1">
            <h1 className="text-lg font-semibold">Admin · RondônIA Apps</h1>
            <p className="text-sm text-muted-foreground">Acesso restrito</p>
          </div>
          <SignInButton />
        </div>
      </Unauthenticated>
      <Authenticated>
        <AdminDashboard />
      </Authenticated>
    </>
  );
}
