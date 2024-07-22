import { SignIn } from "@clerk/nextjs";
import LayoutContainer from "~/components/layout-container";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Form, FormField } from "~/components/ui/form";

export default function SignInComponent() {
  const onSubmit = () => {
    return null;
  };
  return (
    <LayoutContainer>
      <div className="flex flex-col items-center px-5 pt-3 pb-7">
        <p className="text-lg">
          Acceso a <span className="font-bold"> Entidades</span>
        </p>
        <p className="text-muted-foreground text-xs">
          Ingrese sus datos para{" "}
          <span className="font-bold"> iniciar sesion</span>
        </p>
        <Button className="w-full">Ingresar con Google</Button>
        <p className="text-xs text-muted-foreground">recupero de contraseña</p>
        <Button className="w-full h-8">Ingresar</Button>
        <p className="text-muted-foreground opacity-60">
          ¿No tiene una cuenta?{" "}
          <span className="text-[#4dd694] font-bold opacity-100">
            Registrarme
          </span>
        </p>
      </div>
    </LayoutContainer>
  );
}
