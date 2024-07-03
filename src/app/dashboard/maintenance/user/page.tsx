"use server";
import { clerkClient } from "@clerk/nextjs/server";
import { setRole } from "~/app/dashboard/_actions";
import { List, ListTile } from "~/components/list";

import { Title } from "~/components/title";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { checkRole } from "~/lib/utils/server/roles";
import { getServerAuthSession } from "~/server/auth";
import { useOrganization, useOrganizationList } from "@clerk/nextjs";

export type UsersType = Awaited<
  ReturnType<typeof clerkClient.users.getUserList>
>["data"][number];

export default async function AdminDashboard(params: {
  searchParams: { search?: string };
}) {
  // if (!checkRole("admin")) {
  //   redirect("/");
  // }

  const usersList = (await clerkClient.users.getUserList({})).data;
  const organizations = (
    await clerkClient.organizations.getOrganizationList({})
  ).data;

  const session = await getServerAuthSession();

  const user = usersList.find((users) => users.id === session!.user.id);

  const organization = organizations.find((x) => x.id === session?.orgId);

  // const users = usersList.filter((x) => x.);

  const isAdmin = checkRole("admin");
  return (
    <>
      <Title>Usuarios</Title>
      {isAdmin ? (
        usersList.map((user) => (
          <List key={user.id}>
            <ListTile
              href={`./user/${user.id}`}
              title={
                <>
                  {user.firstName} {user.lastName}
                </>
              }
              subtitle={
                user.emailAddresses.find(
                  (email) => email.id === user.primaryEmailAddressId
                )?.emailAddress
              }
              leading={
                <div>
                  <img
                    className="h-10 rounded-full"
                    src={user.imageUrl}
                    alt="User Profile"
                  />
                </div>
              }
              // trailing={<Badge>{user.}</Badge>}
            />
          </List>
        ))
      ) : user ? (
        <List>
          <ListTile
            href={`./user/${user.id}`}
            title={
              <>
                {user.firstName} {user.lastName}
              </>
            }
            subtitle={
              user.emailAddresses.find(
                (email) => email.id === user.primaryEmailAddressId
              )?.emailAddress
            }
            leading={
              <div>
                <img
                  className="h-10 rounded-full"
                  src={user.imageUrl}
                  alt="User Profile"
                />
              </div>
            }
          />
        </List>
      ) : (
        <h1>No existe</h1>
      )}
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
