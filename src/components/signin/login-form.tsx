"use client";
import {
  ArrowLeftIcon,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2Icon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useClerk, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { CustomGoogleOneTap } from "./google-onetap";
import { toast } from "sonner";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import ForgotPasswordPage from "~/components/signin/forgotPassword";
import Link from "next/link";
type Inputs = {
  username: string;
  password: string;
};

interface LoginFormProps {
  setShowRegister: (showRegister: boolean) => void;
}

export default function LoginForm({ setShowRegister }: LoginFormProps) {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  function showGoogle() {
    console.log("showGoogle");
    const params = {
      cancelOnTapOutside: false,
      itpSupport: false,
      fedCmSupport: false,
    };
    clerk.openGoogleOneTap(params);
    if (clerk.session) {
    }
  }

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const form = useForm<Inputs>();
  const signIn = useSignIn();
  const clerk = useClerk();
  const router = useRouter();

  useEffect(() => {
    console.log("useEffect");
    console.log(clerk.session);
    if (clerk.session) {
      router.push("/");
    }
  }, [clerk.session]);

  const onSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const values = form.getValues();
      const signInAttempt = await signIn.signIn?.create({
        identifier: values.username,
      });
      await signInAttempt?.attemptFirstFactor({
        strategy: "password",
        password: values.password,
      });

      if (
        signInAttempt?.status === "complete" &&
        signInAttempt.createdSessionId
      ) {
        clerk.setActive({ session: signInAttempt.createdSessionId });
      } else {
        setError("Los datos proporcionados no son correctos");
        setLoading(false);
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      if (isClerkAPIResponseError(err)) {
        setError("Los datos proporcionados no son correctos");
        setLoading(false);
      } else {
        setError("Los datos proporcionados no son correctos");
        setLoading(false);
      }
    } finally {
      // setLoading(false);
    }
  };

  if (showForgotPassword) {
    return <ForgotPasswordPage />;
  }
  return (
    <div className="flex flex-col px-10 pt-5 pb-7 bg-white rounded-3xl">
      <div className="flex flex-col items-center px-10 pt-3 pb-7 bg-white rounded-2xl">
        <p className="text-lg mt-7 font-bold">
          Inicia sesión en{" "}
          <Image
            className="inline-block"
            src="/public/bitcom-03.png"
            alt="bitcom_logo"
            width={160}
            height={80}
          />
        </p>
        <p className="text-muted-foreground text-sm opacity-80 font-medium">
          Acceso a entidades
        </p>
        <div className="w-full items-center flex justify-center gap-3">
          <Button
            variant="outline"
            className="px-10 py-3 mt-6 mb-3 text-black rounded-lg border-[#e4e4e4] shadow-none"
            onClick={showGoogle}
          >
            <img
              src="public/apple-icon.svg"
              alt="apple icon"
              className="h-5 w-auto"
            />
          </Button>
          <Button
            variant="outline"
            className="px-10 py-3 mt-6 mb-3 text-black rounded-lg border-[#e4e4e4] shadow-none"
            onClick={showGoogle}
          >
            <img
              src="public/facebook-icon.svg"
              alt="facebook icon"
              className="h-5 w-auto"
            />
          </Button>
          <Button
            variant="outline"
            className="px-10 py-3 mt-6 mb-3 text-black rounded-lg border border-[#e4e4e4] shadow-none"
            onClick={showGoogle}
          >
            <img
              src="public/google-icon.svg"
              alt="google icon"
              className="h-5 w-auto"
            />
          </Button>
        </div>

        <div className="flex items-center my-3 w-full">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-2 text-gray-500 font-semibold text-sm">o</span>
          <hr className="flex-grow border-gray-300" />
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 w-full flex flex-col items-start"
          >
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-muted-foreground text-xs font-thin pl-2 ">
                    Email o nombre de usuario
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="w-full border border-[#e4e4e4] rounded-lg py-4 h-11"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="relative w-full ">
              <FormField
                font-medium-medium
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-muted-foreground text-xs font-thin pl-2 ">
                      Contraseña
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        className="w-full border border-[#e4e4e4] rounded-lg py-4 h-11"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {form.watch().password && (
                <Button
                  className="absolute right-2 bottom-1 rounded-full h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                  // variant="outline"
                  variant="ghost"
                  size="icon"
                  type="button"
                >
                  {showPassword ? (
                    <Eye className="h-4 opacity-80 text-muted-foreground" />
                  ) : (
                    <EyeOff className="h-4 opacity-80 text-muted-foreground" />
                  )}
                </Button>
              )}
            </div>
            <p
              onClick={() => setShowForgotPassword(true)}
              className="text-xs text-[#85CE81] pl-2 font-semibold mt-2 hover:cursor-pointer"
            >
              Recuperar contraseña
            </p>
            <Button
              className="w-full h-8 py-5  rounded-full flex justify-between text-[#477b43] font-bold bg-[#BEF0BB] hover:bg-[#DEF5DD] "
              disabled={loading}
            >
              {loading && (
                <Loader2Icon className="mr-2 animate-spin" size={20} />
              )}
              Ingresar <ChevronRight className=" h-6" />
            </Button>
            <p className="text-muted-foreground opacity-60 text-xs">
              ¿No tiene una cuenta?{" "}
              <span
                className="text-[#3e3e3e] underline font-bold hover:cursor-pointer"
                onClick={() => setShowRegister(true)}
              >
                Registrarme
              </span>
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
}
