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
};
export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<Inputs>();
  const onSubmit = () => {
    return null;
  };
  return (
    <>
      <div className="flex flex-col items-center px-10 pt-3 pb-7 bg-white rounded-2xl">
        <Image src="/bitcom-03.png" alt="bitcom_logo" width={160} height={80} />
        <p className="text-lg mt-7">
          Acceso a <span className="font-bold"> Entidades</span>
        </p>
        <p className="text-muted-foreground text-xs font-medium">
          Ingrese sus datos para{" "}
          <span className="font-bold"> iniciar sesion</span>
        </p>
        <Button className="w-full px-20 py-3 mt-6 text-black bg-[#DEDEDE] hover:bg-[#DEDEDE] ">
          <img src="google-icon.svg" alt="google icon" />
          Ingresar con Google <ChevronRight className="h-4" />{" "}
        </Button>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 w-full"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-sm opacity-70 font-medium-medium ">
                    Usuario
                  </FormLabel>
                  <FormControl>
                    <Input {...field} className="w-full" />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="relative w-full mb-4">
              <FormField
                font-medium-medium
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
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
              <p className="text-xs font-semibold text-muted-foreground mt-2">
                Recupero de contraseña
              </p>
              <Button className="w-full px-20 h-8 py-3 my-1 text-black bg-[#1BDFB7] hover:bg-[#1BDFB7] ">
                Ingresar <ChevronRight className=" h-4" />
              </Button>
              <p className="text-muted-foreground opacity-60 text-xs">
                ¿No tiene una cuenta?{" "}
                <span className="text-[#1BDFB7] font-bold opacity-100">
                  Registrarme
                </span>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
