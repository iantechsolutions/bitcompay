"use client";
import { ChevronRight, Eye, EyeOff, Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useClerk, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { CustomGoogleOneTap } from "./google-onetap";
type Inputs = {
  username: string;
  password: string;
};
interface LoginFormProps {
  setShowRegister: (showRegister: boolean) => void;
}
export default function LoginForm({ setShowRegister }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useForm<Inputs>();
  const signIn = useSignIn();
  const clerk = useClerk();
  const router = useRouter();
  const onSubmit = async () => {
    setLoading(true);
    const values = form.getValues();
    const signInAttempt = await signIn.signIn?.create({
      identifier: values.username,
    });
    // await signInAttempt?.prepareFirstFactor({
    //   strategy:""
    // })
    await signInAttempt?.attemptFirstFactor({
      strategy: "password",
      password: values.password,
    });
    if (
      signInAttempt?.status === "complete" &&
      signInAttempt.createdSessionId
    ) {
      clerk.setActive({ session: signInAttempt.createdSessionId });
      router.push("/dashboard");
    }
  };
  return (
    <div className="flex flex-col items-center px-10 pt-3 pb-7 bg-white rounded-2xl">
      <Image
        src="/public/bitcom-03.png"
        alt="bitcom_logo"
        width={160}
        height={80}
      />
      <p className="text-lg mt-7">
        Acceso a <span className="font-bold"> Entidades</span>
      </p>
      <p className="text-muted-foreground text-xs font-medium">
        Ingrese sus datos para{" "}
        <span className="font-bold"> iniciar sesion</span>
      </p>
      <CustomGoogleOneTap>
        {/* <h1>AAAA</h1> */}
        {/* <img src="public/google-icon.svg" alt="google icon" /> */}
        {/* Ingresar con Google <ChevronRight className="h-4" />{" "} */}
        <Button className="w-full px-20 py-3 mt-6 mb-3 text-black bg-[#DEDEDE] hover:bg-[#DEDEDE] ">
          <img src="public/google-icon.svg" alt="google icon" />
          Ingresar con Google <ChevronRight className="h-4" />{" "}
        </Button>
      </CustomGoogleOneTap>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full flex flex-col items-center"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-muted-foreground text-sm opacity-70 font-medium-medium ">
                  Mail
                </FormLabel>
                <FormControl>
                  <Input {...field} className="w-full" />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="relative w-full mb-4 flex flex-col items-center justify-center ">
            <FormField
              font-medium-medium
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-muted-foreground text-sm opacity-70 font-medium-medium ">
                    Contraseña
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      className="w-full"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {form.watch().password && (
              <Button
                className="absolute right-2 bottom-0"
                onClick={() => setShowPassword(!showPassword)}
                variant="outline"
                size="icon"
              >
                {showPassword ? (
                  <Eye className="h-4 opacity-80 text-muted-foreground" />
                ) : (
                  <EyeOff className="h-4 opacity-80 text-muted-foreground" />
                )}
              </Button>
            )}
            <p className="text-xs font-semibold text-muted-foreground mt-2 hover:cursor-pointer">
              Recupero de contraseña
            </p>
            <Button
              className="w-full px-20 h-8 py-3 my-1 text-black bg-[#1BDFB7] hover:bg-[#1BDFB7] "
              disabled={loading}
            >
              {loading && (
                <Loader2Icon className="mr-2 animate-spin" size={20} />
              )}
              Ingresar <ChevronRight className=" h-4" />
            </Button>
            <p className="text-muted-foreground opacity-60 text-xs">
              ¿No tiene una cuenta?{" "}
              <span
                className="text-[#1BDFB7] font-bold opacity-100 hover:cursor-pointer"
                onClick={() => setShowRegister(true)}
              >
                Registrarme
              </span>
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}
