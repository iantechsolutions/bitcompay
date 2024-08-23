"use client";

import { useOrganizationList, useOrganization } from "@clerk/nextjs";
import { useState } from "react";
import { Button } from "../ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { ChevronDown } from "lucide-react";
import { ButtonWithoutSize } from "../ui/buttonWithoutSize";
interface CustomOrganizationSwitcherProps {
  companyName: string | undefined;
}
export const CustomOrganizationSwitcher = ({
  companyName,
}: CustomOrganizationSwitcherProps) => {
  const { isLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });
  const { organization } = useOrganization();

  if (!isLoaded) {
    return <p>cargando...</p>;
  }

  return (
    <>
      <Popover>
        <PopoverTrigger>
          <ButtonWithoutSize
            // variant={"outline"}
            className="bg-white hover:bg-white rounded-2xl px-7 font-normal text-startP flex items-center border-none shadow-none"
          >
            <img
              src="/public/header/Frame-14.png"
              className="h-[3.5vh] mr-[0.6vw]"
            />
            {organization?.name ?? companyName}
            <div className="ml-3">
              <ChevronDown className="h-4 w-auto" strokeWidth={1} />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <h1>Cambiar entre organizaciones</h1>
          <ul>
            {userMemberships.data?.map((mem) => (
              <li key={mem.id}>
                <div
                  className="hover:bg-gray-200 cursor-pointer flex items-center px-3 py-2 rounded-full"
                  onClick={() =>
                    setActive({ organization: mem.organization.id })
                  }
                >
                  {" "}
                  <img
                    src="/public/header/Frame-14.png"
                    className="h-6 mr-2"
                  />{" "}
                  <span>{mem.organization.name}</span>
                </div>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </>
  );
};
