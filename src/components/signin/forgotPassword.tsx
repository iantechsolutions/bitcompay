"use client";
import React, { useState } from "react";
import { useAuth, useSignIn } from "@clerk/nextjs";
import type { NextPage } from "next";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
const ForgotPasswordPage: NextPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [secondFactor, setSecondFactor] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();

  const messageError: { [key: string]: string } = {
    "Couldn't find your account.": "No se pudo encontrar su cuenta.",
    "You're currently in single session mode. You can only be signed into one account at a time.":
      "Actualmente estas en modo de sesión unica. Solo puedes estar logeado en una cuenta a la vez.",
  };
  if (!isLoaded) {
    return null;
  }

  // If the user is already signed in,
  // redirect them to the home page
  if (isSignedIn) {
    router.push("/");
  }

  // Send the password reset code to the user's email
  async function create(e: React.FormEvent) {
    e.preventDefault();
    await signIn
      ?.create({
        strategy: "reset_password_email_code",
        identifier: email,
      })
      .then((_) => {
        setSuccessfulCreation(true);
        setError("");
      })
      .catch((err) => {
        console.error("error", err.errors[0].longMessage);
        setError(err.errors[0].longMessage);
      });
  }

  // Reset the user's password.
  // Upon successful reset, the user will be
  // signed in and redirected to the home page
  async function reset(e: React.FormEvent) {
    e.preventDefault();
    await signIn
      ?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      })
      .then((result) => {
        // Check if 2FA is required
        if (result.status === "needs_second_factor") {
          setSecondFactor(true);
          setError("");
        } else if (result.status === "complete") {
          // Set the active session to
          // the newly created session (user is now signed in)
          setActive({ session: result.createdSessionId });
          setError("");
        } else {
          console.log(result);
        }
      })
      .catch((err) => {
        console.error("error", err.errors[0].longMessage);
        setError(err.errors[0].longMessage);
      });
  }

  return (
    <div className="flex flex-col items-center px-10 pt-3 pb-7 bg-white rounded-2xl">
      <Image
        src="/public/bitcom-03.png"
        alt="bitcom_logo"
        width={160}
        height={80}
      />
      <div
        style={{
          margin: "auto",
          maxWidth: "500px",
        }}
      >
        <h1 className="text-2xl font-semibold">¿Olvido su contraseña?</h1>
        <form
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1em",
          }}
          onSubmit={!successfulCreation ? create : reset}
        >
          {!successfulCreation && (
            <>
              <label htmlFor="email" className="text-lg text-muted-foreground">
                Ingrese su correo electrónico
              </label>
              <Input
                type="email"
                placeholder="correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button className="w-full">Enviar código de verificación</Button>
              {error && (
                <p className="text-red-600 text-sm text-ellipsis whitespace-normal">
                  {messageError[error as string] ?? error}
                </p>
              )}
            </>
          )}

          {successfulCreation && (
            <>
              <label htmlFor="password">Ingrese su nueva contraseña</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <label htmlFor="password">
                Ingrese el código de verificación enviado a su correo
              </label>
              <Input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />

              <Button className="w-full"> Reset</Button>
              {error && (
                <p className="text-red text-sm">
                  {messageError[error as string] ?? error}
                </p>
              )}
            </>
          )}

          {secondFactor && (
            <p>
              veficacion de dos pasos (2FA) es requirida pero la UI no lo puedo
              manejar
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
