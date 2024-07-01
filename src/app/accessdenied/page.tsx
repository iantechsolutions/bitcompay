import { SignOutButton } from "@clerk/nextjs";

export default function AccessDenied() {
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 top-0 flex items-center justify-center ">
        <div> Acceso denegado.</div>
        <div className="px-16 py-16 float-right">
          <SignOutButton></SignOutButton>
        </div>
      </div>
    </>
  );
}
