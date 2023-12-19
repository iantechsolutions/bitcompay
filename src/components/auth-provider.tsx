import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";
import { getServerAuthSession } from "~/server/auth";
import { SignInButton } from "./sign-in-out-buttons";

export default function AuthProvider(props: { children: React.ReactNode }) {
    return <Suspense fallback={<LoadingComponent />}>
        <AuthProviderContent>{props.children}</AuthProviderContent>
    </Suspense>
}

async function AuthProviderContent(props: { children: React.ReactNode }) {
    const session = await getServerAuthSession()

    if (!session?.user) {
        return <SignInPage />
    }

    return <>
        {props.children}
    </>
}


function SignInPage() {
    return <div className="fixed top-0 left-0 bottom-0 right-0 flex justify-center items-center">
        <SignInButton />
    </div>
}

function LoadingComponent() {
    return <div className="fixed top-0 left-0 bottom-0 right-0 flex justify-center items-center">
        <Loader2Icon className="animate-spin w-10 h-10" />
    </div>
}