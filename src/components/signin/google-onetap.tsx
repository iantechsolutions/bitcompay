"use client";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";
import { env } from "~/env";

// Add clerk to Window to avoid type errors
declare global {
  interface Window {
    google: any;
  }
}

export function CustomGoogleOneTap({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerk = useClerk();
  const router = useRouter();

  useEffect(() => {
    // Will show the One Tap UI after two seconds
    console.log("useEffect");
    const timeout = setTimeout(() => oneTap(), 2000);
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const oneTap = () => {
    console.log("One Tap");
    const { google } = window;
    if (google) {
      console.log("Google");
      google.accounts.id.initialize({
        // Add your Google Client ID here.
        use_fedcm_for_prompt: true,
        client_id:
          "386943125567-r86179ke4p0nfg1q1ir6p1klc6849vpg.apps.googleusercontent.com",

        callback: async (response: any) => {
          // Here we call our provider with the token provided by Google
          await call(response.credential);
        },
      });

      // Uncomment below to show the One Tap UI without
      // logging any notifications.
      // return google.accounts.id.prompt() // without listening to notification

      // Display the One Tap UI, and log any errors that occur.
      return google.accounts.id.prompt((notification: any) => {
        console.log("Notification ::", notification);
        if (notification.isNotDisplayed()) {
          console.log(
            "getNotDisplayedReason ::",
            notification.getNotDisplayedReason()
          );
          document.cookie = `g_state=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT`;
          google.accounts.id.prompt();
        } else if (notification.isSkippedMoment()) {
          console.log("getSkippedReason  ::", notification.getSkippedReason());
          document.cookie = `g_state=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT`;
          google.accounts.id.prompt();
        } else if (notification.isDismissedMoment()) {
          console.log(
            "getDismissedReason ::",
            notification.getDismissedReason()
          );
        }
      });
    }
  };

  const call = async (token: any) => {
    try {
      console.log("response", token);
      const res = await clerk.authenticateWithGoogleOneTap({
        token,
      });
      clerk.handleGoogleOneTapCallback(res, {});
      // await clerk.handleGoogleOneTapCallback(res, {
      //   signInFallbackRedirectUrl: "/dashboard",
      // });
      // router.push("/dashboard");
    } catch (error) {
      router.push("/signin");
    }
  };

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="beforeInteractive"
      ></Script>
      {children}
    </>
  );
}
