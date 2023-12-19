
import AdminSidenav from "~/components/admin-sidenav";
import AppLayout from "~/components/applayout";
import { NavUserData } from "~/components/nav-user-section";
import { Button } from "~/components/ui/button";
import { getServerAuthSession } from "~/server/auth";
// import { UploadButton } from "~/components/uploadthing";

export default async function Home() {
  const session = await getServerAuthSession();

  return (
    <AppLayout
      title="BITCOMPAY"
      user={session?.user}
      sidenav={<AdminSidenav />}
    >
      <div className="flex justify-center mb-10">
        <Button>Test</Button>
      </div>
      <div>
        {/* <UploadButton
          endpoint="imageUploader"
          onClientUploadComplete={(res) => {
            // Do something with the response
            console.log("Files: ", res);
            alert("Upload Completed");
          }}
          onUploadError={(error: Error) => {
            // Do something with the error.
            alert(`ERROR! ${error.message}`);
          }}
        /> */}
      </div>
    </AppLayout>
  );
}