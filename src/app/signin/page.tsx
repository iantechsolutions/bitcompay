"use client";
import { SignIn } from "@clerk/nextjs";
import { ChevronRight } from "lucide-react";
import LayoutContainer from "~/components/layout-container";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Input } from "~/components/ui/input";
import { Form, FormField } from "~/components/ui/form";
import LoginForm from "~/components/signin/login-form";
import Image from "next/image";
import { useState } from "react";
export default function SignInComponent() {
  const [showRegister, setShowRegister] = useState(false);
  const onSubmit = () => {
    return null;
  };
  return (
    <LayoutContainer className="flex h-screen w-screen justify-center items-center bg-bg-singnin bg-cover bg-scroll">
      <LoginForm />
    </LayoutContainer>
  );
}
