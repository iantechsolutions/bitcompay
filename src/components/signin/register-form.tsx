"use client";
import { ChevronRight, Eye, EyeOff } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";
import Image from "next/image";
import { useClerk, useSignUp } from "@clerk/nextjs";
import { ClerkAPIError } from "@clerk/types";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { useRouter } from "next/navigation";
import { Title } from "../title";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp";
type Inputs = {
  username: string;
  password: string;
  mail: string;
};
interface RegisterFormProps {
  setShowRegister: (showRegister: boolean) => void;
}
export default function RegisterForm({ setShowRegister }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<ClerkAPIError[]>([]);
  const [error, setError] = useState("");
  const form = useForm<Inputs>();
  const { isLoaded, signUp, setActive } = useSignUp();
  const clerk = useClerk();
  const router = useRouter();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const { username, password, mail } = data;
    if (!isLoaded) return;
    try {
      await signUp.create({ emailAddress: mail, password });
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      setVerifying(true);
    } catch (err: any) {
      const error = JSON.stringify(err);
      console.error(JSON.stringify(err));
    }
  };

  const handleVerify = async () => {
    if (!isLoaded) return;
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      if (completeSignUp.status == "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push("/dashboard");
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2));
      }
    } catch (err: any) {
      if (isClerkAPIResponseError(err)) {
        const apiErrors = err.errors;
        setError(JSON.stringify(apiErrors));
      }
      console.error(JSON.stringify(err, null, 2));
    }
  };
  if (verifying) {
    return (
      <div className="flex flex-col items-center px-10 pt-3 pb-7 bg-white rounded-2xl">
        <Title>Ingresar codigo de verificacion</Title>
        <InputOTP
          value={code}
          onChange={(value: string) => setCode(value)}
          maxLength={6}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        {errors && (
          <ul>
            {errors.map((el, index) => (
              <li key={index}>{el.longMessage}</li>
            ))}
          </ul>
        )}

        <Button
          onClick={handleVerify}
          className="bg-[#1BDFB7] hover:bg-[#1BDFB7] mt-3"
        >
          Verificar
        </Button>
      </div>
    );
  }
  return (
    <>
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
        <p className="text-muted-foreground text-xs font-medium mb-3">
          Ingrese sus datos para{" "}
          <span className="font-bold"> crear cuenta</span>
        </p>

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
                    Usuario
                  </FormLabel>
                  <FormControl>
                    <Input {...field} className="w-full" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mail"
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
            <div className="relative w-full">
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
            </div>
            <div className=" w-full mb-4 flex flex-col items-center justify-center ">
              <Button
                type="submit"
                className="w-full px-32 h-8 py-3 my-1 mt-4
               text-black bg-[#1BDFB7] hover:bg-[#1BDFB7] "
              >
                Continuar <ChevronRight className=" h-4" />
              </Button>

              <p className="text-muted-foreground opacity-60 text-xs">
                ¿Ya tiene una cuenta ?{" "}
                <span
                  className="text-[#1BDFB7] font-bold opacity-100 hover:cursor-pointer"
                  onClick={() => setShowRegister(false)}
                >
                  Ingresar
                </span>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
