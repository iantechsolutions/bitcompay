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
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [code, setCode] = useState("");
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [secondFactor, setSecondFactor] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();

  const messageError: { [key: string]: string } = {
    "Couldn't find your account.": "No se pudo encontrar su cuenta.",
    "You're currently in single session mode. You can only be signed into one account at a time.":
      "Actualmente estas en modo de sesión única. Solo puedes estar logueado en una cuenta a la vez.",
  };

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    router.push("/");
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await signIn
      ?.create({
        strategy: "reset_password_email_code",
        identifier: email,
      })
      .then(() => {
        setSuccessfulCreation(true);
        setError("");
      })
      .catch((err) => {
        console.error("error", err.errors[0].longMessage);
        setError(err.errors[0].longMessage);
      });
  }

  // Verifica el código ingresado por el usuario.
  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setSecondFactor(true);
    await signIn
      ?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
      })
      .then((result) => {
        if (result.status === "needs_second_factor") {
          setSecondFactor(true);
          setError("");
        } else if (result.status === "complete") {
          setCodeVerified(true);
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

  // Restablece la contraseña después de verificar el código
  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();

    if (password !== passwordConfirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    await signIn
      ?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      })
      .then((result) => {
        if (result.status === "complete") {
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
        }}>
        <h1 className="text-2xl font-semibold">¿Olvidó su contraseña?</h1>
        <form
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1em",
          }}
          onSubmit={
            !successfulCreation
              ? create
              : codeVerified
              ? resetPassword
              : verifyCode
          }>
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

          {successfulCreation && !codeVerified && (
            <>
              <label htmlFor="code">
                Ingrese el código de verificación enviado a su correo
              </label>
              <Input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />

              <Button className="w-full">Verificar Código</Button>
              {error && (
                <p className="text-red-600 text-sm">
                  {messageError[error as string] ?? error}
                </p>
              )}
            </>
          )}

          {codeVerified && (
            <>
              <label htmlFor="password">Ingrese su nueva contraseña</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label htmlFor="passwordConfirm">
                Confirme su nueva contraseña
              </label>
              <Input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />

              <Button className="w-full">Restablecer Contraseña</Button>
              {error && (
                <p className="text-red-600 text-sm">
                  {messageError[error as string] ?? error}
                </p>
              )}
            </>
          )}

          {secondFactor && (
            <p>
              La verificación de dos pasos (2FA) es requerida, pero la UI no
              puede manejarla.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
