"use client";
import { useOrganization, useOrganizationList, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import AccessDenied from "../accessdenied/page";

export function SetDefaultOrganization() {
  const { user, isLoaded: isloadedUser } = useUser();
  const { organization } = useOrganization();
  const { setActive, userMemberships } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });
  useEffect(() => {
    if (
      !organization &&
      isloadedUser &&
      user &&
      userMemberships.data &&
      userMemberships.data.length > 0
    ) {
      const firstOrg = userMemberships!.data[0]!.organization;
      if (setActive) setActive({ organization: firstOrg.id });
    }
  }, [user, userMemberships.data, setActive]);
  if (userMemberships.isLoading) return <></>;
  if (!userMemberships.isLoading && userMemberships.data?.length == 0)
    return <AccessDenied />;
  else return null;
}
