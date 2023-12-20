
import AppSidenav from "~/components/app-sidenav";
import AppLayout from "~/components/applayout";
import { List, ListTile } from "~/components/list";
import { UserAvatarCircle } from "~/components/user-avatar-circle";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";

export default async function Home() {
  const session = await getServerAuthSession();

  const users = await db.query.users.findMany({
    columns: {
      email: true,
      name: true,
      id: true,
      image: true,
    },
    with: {
      roles: {
        with: {
          role: {
            columns: {
              name: true,
              id: true,
            }
          }
        }
      }
    }
  })

  return (
    <AppLayout
      title={<h1>Usuarios</h1>}
      user={session?.user}
      sidenav={<AppSidenav />}
    >
      <List>
        {users.map(user => <ListTile
          leading={<UserAvatarCircle user={user} />}
          title={<p>{user.name}</p>}
          subtitle={<p>{user.email}</p>}
        />)}
      </List>
    </AppLayout>
  );
}