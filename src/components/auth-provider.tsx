import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";
import { getServerAuthSession } from "~/server/auth";
import { SignInButton } from "./sign-in-out-buttons";

export default function AuthProvider(props: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <AuthProviderContent>{props.children}</AuthProviderContent>
    </Suspense>
  );
}

async function AuthProviderContent(props: { children: React.ReactNode }) {
  const session = await getServerAuthSession();

  if (!session?.user) {
    return <SignInPage />;
  }

  return <>{props.children}</>;
}

function SignInPage() {
  return (
    <div className="fixed bottom-0 left-0 right-0 top-0 flex items-center justify-center">
      <SignInButton />
    </div>
  );
}

function LoadingComponent() {
  return (
    <div className="fixed bottom-0 left-0 right-0 top-0 flex items-center justify-center">
      <Loader2Icon className="h-10 w-10 animate-spin" />
    </div>
  );
}
