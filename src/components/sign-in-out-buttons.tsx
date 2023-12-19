"use client"
import { signIn, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export function SignInButton() {
    return <Button
        onClick={async () => {
            await signIn('google')
        }}
    >Ingresar con Google</Button>
}

export function SignOut() {
    const router = useRouter()

    return <Button
        variant="secondary"
        className="w-full"
        onClick={async () => {
            await signOut()
            router.refresh()
        }}
    >Salir</Button>
}