"use client";

import { Button } from "~/components/ui/button";
import { UploadButton } from "~/components/uploadthing";

export default function Home() {
  return (
    <main className="p-10">
      <div className="flex justify-center mb-10">
        <Button>Test</Button>
      </div>
      <div>
        <UploadButton
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
        />
      </div>
    </main>
  );
}