"use client";
import { User } from "@clerk/nextjs/server";
import { CheckIcon, Loader2 } from "lucide-react";
import { type MouseEventHandler, useState, use, useEffect } from "react";
import { toast } from "sonner";
import LayoutContainer from "~/components/layout-container";
import { List, ListTile } from "~/components/list";
import { Title } from "~/components/title";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import {
  SelectItem,
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { asTRPCError } from "~/lib/errors";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/shared";
import { useRouter } from "next/navigation";

export default function UserPage(props: { params: { userId: string } }) {
  const router = useRouter();
  const { data: user } = api.clerk.getUserbyId.useQuery({
    id: props.params.userId,
  });
  const { mutateAsync: editUser, isLoading } = api.clerk.editUser.useMutation();
  const {data:orgs } = api.companies.list.useQuery();
  const {data:relOrgs} = api.clerk.relatedOrgs.useQuery({userId: props.params.userId});
  console.log(relOrgs);
  // const relCompanies = orgs?.map(x=> x.)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const relatedOrgs: Map<string,boolean> = new Map<string,boolean>();
  useEffect(() => {
    if (user) {
      setFirstName(user?.firstName ?? "");
      setLastName(user?.lastName ?? "");
      setUsername(user?.username ?? "");
      setRole((user?.publicMetadata.role as string) ?? "");
    }
  }, [user]);
  async function handleChange() {
    try {
      const entities = Array.from(relatedOrgs.entries()).map(([k,v]) => 
      {
        if(v && k) return k;
      }) ?? [];
      const res = await editUser({
        userId: props.params.userId,
        role,
        firstName,
        lastName,
        username,
        entities
      });
      if (res.message) {
        toast.error(res.message);
        return;
      }
      toast.success("Se han guardado los cambios");
      router.refresh();
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }
  if (!user) return <div> no se encontro usuario </div>;
  return (
    <LayoutContainer>
      {isLoading ? (
        <div> Cargando...</div>
      ) : (
        <section className="space-y-2">
          <div className="flex justify-between">
            <Title>
              {" "}
              {user?.firstName} {user?.lastName}{" "}
            </Title>
            <Button onClick={handleChange} disabled={isLoading}>
              <CheckIcon className="mr-2" />
              Aplicar
            </Button>
          </div>

          <Accordion type="single" collapsible={true} className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                <h2 className="text-md">Info. del usuario</h2>
              </AccordionTrigger>
              <AccordionContent>
                <Card className="p-5">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Nombre</Label>
                      <Input
                        id="first_name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="description">Apellido</Label>
                      <Input
                        id="last_name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="description">Nombre de usuario</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                  </div>
                </Card>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>
                <h2 className="text-md">Roles</h2>
              </AccordionTrigger>
              <AccordionContent>
                <Card className="p-5">
                  <div>
                    <Label htmlFor="role">Rol</Label>
                    <Select
                      defaultValue={role}
                      onValueChange={(value) => setRole(value)}
                    >
                      <SelectTrigger>
                        <SelectValue>{role}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="user">Usuario</SelectItem>
                        <SelectItem value="unauthorized">
                          No autorizado
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Card>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
            <AccordionTrigger>
              <h2 className="text-md">Agregar a entidad</h2>
            </AccordionTrigger>
            <AccordionContent>
              <List>
                {orgs?.map((company) => {
                  const isChecked = (relOrgs?.orgIds ?? []).some(
                    (c) => c === company?.id
                  );
                  return (
                    <ListTile 
                      key={company?.id}
                      title={company?.name}
                      trailing={
                        <Switch
                          checked={isChecked}
                          onCheckedChange={(required) =>
                            relatedOrgs.set(company?.id, required)
                          }
                        />
                      }
                    />
                  );
                })}
              </List>
            </AccordionContent>
          </AccordionItem>
          </Accordion>
        </section>
      )}
    </LayoutContainer>
  );
}
