import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import LandingPage from "~/components/landing";
import { redirect } from "next/navigation";


export default async function Home() {
  return redirect("/dashboard");
}
