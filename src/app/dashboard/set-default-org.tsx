"use client";
import { useOrganization, useOrganizationList, useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export function SetDefaultOrganization() {
  const { user, isLoaded } = useUser();
  const { organization } = useOrganization();
  const { setActive, userMemberships } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  useEffect(() => {
    if (
      !organization &&
      isLoaded &&
      user &&
      userMemberships.data &&
      userMemberships.data.length > 0
    ) {
      const firstOrg = userMemberships!.data[0]!.organization;
      if (setActive) setActive({ organization: firstOrg.id });
    }
  }, [user, userMemberships.data, setActive]);

  return null;
}
