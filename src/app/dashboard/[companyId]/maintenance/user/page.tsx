import { redirect } from "next/navigation";
import { checkRole } from "~/lib/utils/roles";
import { clerkClient } from "@clerk/nextjs/server";
import { setRole } from "~/app/dashboard/_actions";
import { List, ListTile } from "~/components/list";

import { Badge } from "~/components/ui/badge";
import { Title } from "~/components/title";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

type UsersType = Awaited<
  ReturnType<typeof clerkClient.users.getUserList>
>["data"][number];
export default async function AdminDashboard(params: {
  searchParams: { search?: string };
}) {
  // if (!checkRole("admin")) {
  //   redirect("/");
  // }

  const users = (await clerkClient.users.getUserList({})).data;

  return (
    <>
      <Title>Usuarios</Title>

      {users.map((user) => {
        return (
          <List>
            <ListTile
              key={user.id}
              title={`${user.firstName} ${user.lastName}`}
              subtitle={
                user.emailAddresses.find(
                  (email) => email.id === user.primaryEmailAddressId
                )?.emailAddress
              }
              leading={<Badge>{user.publicMetadata.role as string}</Badge>}
              trailing={<FormSetRole user={user} />}
            />
          </List>
        );
      })}
    </>
  );
}

function FormSetRole({ user }: { user: UsersType }) {
  return (
    <div className="flex gap-2">
      <div>
        <form action={setRole}>
          <Input type="hidden" value={user.id} name="id" />
          <Input type="hidden" value="admin" name="role" />
          <Button type="submit">Hacer admin </Button>
        </form>
      </div>
      <div>
        <form action={setRole}>
          <Input type="hidden" value={user.id} name="id" />
          <Input type="hidden" value="user" name="role" />
          <Button type="submit">Autorizar usuario</Button>
        </form>
      </div>
      <div>
        <form action={setRole}>
          <Input type="hidden" value={user.id} name="id" />
          <Input type="hidden" value="unauthorized" name="role" />
          <Button type="submit">Desautorizar</Button>
        </form>
      </div>
    </div>
  );
}
