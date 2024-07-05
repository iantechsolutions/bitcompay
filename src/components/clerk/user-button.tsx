"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useUser, useClerk, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// Create a new UserButtonandMenu component and move the old return into this
const UserButtonAndMenu = () => {
  const { signOut, openUserProfile } = useClerk();
  const router = useRouter();
  const { user } = useUser();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {/* Render a button using the image and email from `user` */}
        <button className="flex flex-row rounded-xl border border-gray-200 bg-white px-4 py-3 text-black drop-shadow-md">
          <Image
            alt={user?.primaryEmailAddress?.emailAddress!}
            src={user?.imageUrl}
            width={30}
            height={30}
            className="mr-2 rounded-full border border-gray-200 drop-shadow-sm"
          />
          {user?.username
            ? user.username
            : user?.primaryEmailAddress?.emailAddress!}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="mt-4 w-52 rounded-xl border border-gray-200 bg-white px-6 py-4 text-black drop-shadow-2xl">
          <DropdownMenu.Label />
          <DropdownMenu.Group className="py-3">
            <DropdownMenu.Item asChild>
              {/* Create a button with an onClick to open the User Profile modal */}
              <button onClick={() => openUserProfile()} className="pb-3">
                Profile
              </button>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              {/* Create a fictional link to /subscriptions */}
              <Link href="/subscriptions" passHref className="py-3">
                Subscription
              </Link>
            </DropdownMenu.Item>
          </DropdownMenu.Group>
          <DropdownMenu.Separator className="my-1 h-px bg-gray-500" />
          <DropdownMenu.Item asChild>
            {/* Create a Sign Out button -- signOut() takes a call back where the user is redirected */}
            <button
              onClick={() => signOut(() => router.push("/"))}
              className="py-3"
            >
              Sign Out{" "}
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

// Refactor to show the default <SignInButton /> if the user is logged out
// Show the UserButtonAndMenu if the user is logged in
export const UserButton = () => {
  const { isLoaded, user } = useUser();

  if (!isLoaded) return null;

  if (!user?.id) return <SignInButton />;

  return <UserButtonAndMenu />;
};
