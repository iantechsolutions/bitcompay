"use client";
import { ChevronRight, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";
import Image from "next/image";
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
  const form = useForm<Inputs>();
  const onSubmit = () => {
    const values = form.getValues();
    return null;
  };
  return (
    <>
      <div className="flex flex-col items-center px-10 pt-3 pb-7 bg-white rounded-2xl">
        <Image src="/bitcom-03.png" alt="bitcom_logo" width={160} height={80} />
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

              <Button
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
