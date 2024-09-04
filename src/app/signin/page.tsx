"use client";
import { useState } from "react";
import LayoutContainer from "~/components/layout-container";
import LoginForm from "~/components/signin/login-form";
import RegisterForm from "~/components/signin/register-form";

export default function SignInComponent() {
  const [showRegister, setShowRegister] = useState(false);
  const onSubmit = () => {
    return null;
  };
  return (
    <LayoutContainer className="flex h-screen w-screen justify-center items-center bg-bg-singnin bg-cover bg-scroll max-w-full space-y-0 rounded-lg md:ml-0 sm:ml-0 mt-0 mr-0">
      {showRegister ? (
        <RegisterForm setShowRegister={setShowRegister} />
      ) : (
        <LoginForm setShowRegister={setShowRegister} />
      )}
    </LayoutContainer>
  );
}
