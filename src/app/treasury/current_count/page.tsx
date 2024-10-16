import { api } from "~/trpc/server";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { CircleUserRound } from "lucide-react";
import UploadDropzoneV1 from "~/components/upload-dropzone";

export default async function Page(props: { params: { companyId: string } }) {
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Cuenta corriente</Title>
          <Title>Drop zone</Title>
          <UploadDropzoneV1 />
          
        </div>
      </section>
    </LayoutContainer>
  );
}
