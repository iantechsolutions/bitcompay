import { List, ListTile } from "~/components/list";
import { Title } from "~/components/title";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";

export default async function Home() {
  // const user = await currentUser();

  // const users = await db.query.users.findMany({
  //   columns: {
  //     email: true,
  //     name: true,
  //     id: true,
  //     image: true,
  //   },
  // });

  return (
    <>
      <Title>Usuarios</Title>
      {/* <List>
        {users.map((user) => (
          <ListTile
            key={user.id}
            leading={<UserAvatarCircle user={user} />}
            title={<p>{user.name}</p>}
            subtitle={<p>{user.email}</p>}
          />
        ))}
      </List> */}
    </>
  );
}
