import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import LandingPage from "~/components/landing";


export default async function Home() {
  // const session = await getServerAuthSession();

  return (
    <LandingPage/>
  );
}
