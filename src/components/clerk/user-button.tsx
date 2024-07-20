"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useUser, useClerk, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import {
  CircleUserRound,
  LogIn,
  LogOut,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useEffect, useState } from "react";
// Create a new UserButtonandMenu component and move the old return into this
const UserButtonAndMenu = ({
  companyName,
}: {
  companyName: string | undefined;
}) => {
  const { signOut, openUserProfile } = useClerk();
  const router = useRouter();
  const { user } = useUser();
  const [active, setActive] = useState(true);
  useEffect(() => {
    console.log(active);
  }, [active]);
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {/* Render a button using the image and email from `user` */}
        <Button
          onClick={() => setActive(!active)}
          className="flex flex-row rounded-3xl border items-center border-gray-200 bg-white px-3 py-5 hover:bg-white text-black drop-shadow-md"
        >
          <CircleUserRound className="w-6 h-6 mr-2" color="#8140FF" />
          <div className="flex flex-col justify-center">
            <div>
              {user?.fullName
                ? trimName(user.fullName)
                : user?.primaryEmailAddress?.emailAddress!}
            </div>
            <div className="text-xs text-left color-[#b5b5b5] opacity-50 -mt-0.5">
              {companyName ?? " "}
            </div>
          </div>
          <div className="ml-3 border-none">
            {active && <ChevronDown className="h-4 w-auto self-end" />}
            {!active && <ChevronUp className="h-4 w-auto self-end" />}
          </div>
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="mt-4 w-52 rounded-2xl border border-gray-200 bg-white px-4 py-2 pb-5 pt-3 text-black drop-shadow-2xl">
          <DropdownMenu.Label />
          <DropdownMenu.Group>
            <DropdownMenu.Item asChild>
              <div>
                <div>
                  <p className="text-sm font-bold">{user?.fullName ?? ""}</p>
                  <p className="text-xs opacity-70">
                    {user?.primaryEmailAddress?.emailAddress! ?? ""}
                  </p>
                </div>
                <div className="flex flex-row justify-between mb-2 mt-2">
                  <Button className="w-[48%] h-6 text-[0.6rem] rounded-2xl px-5 bg-[#EAEAEA] hover:bg-[#EAEAEA] text-black">
                    Administración
                  </Button>
                  <Button className="w-[48%] h-6 text-[0.6rem]  rounded-2xl px-5 bg-[#EAEAEA] hover:bg-[#EAEAEA]  text-black">
                    I AN TECH
                  </Button>
                </div>
                <Button
                  onClick={() => signOut(() => router.push("/"))}
                  className="border-none h-7 py-1 w-full bg-[#0DA485] hover:bg-[#0DA485] rounded-2xl text-white text-[0.8rem]"
                >
                  Salir
                </Button>
              </div>
            </DropdownMenu.Item>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

// Refactor to show the default <SignInButton /> if the user is logged out
// Show the UserButtonAndMenu if the user is logged in
export const UserButton = ({
  companyName,
}: {
  companyName: string | undefined;
}) => {
  const { isLoaded, user } = useUser();
  const { openSignIn } = useClerk();

  if (!isLoaded || !user?.id) {
    /* Use the new <Button /> component for the sign-in button */
    return (
      <Button onClick={() => openSignIn()}>
        {" "}
        <LogIn className="mr-2 h-6 w-auto" />
        Sign In
      </Button>
    );
  }

  return <UserButtonAndMenu companyName={companyName} />;
};

function trimName(name: string) {
  if (name.length < 20) return name;
  return name.split(" ")[0];
}
