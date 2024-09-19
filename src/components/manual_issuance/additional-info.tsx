import ElementCard from "../affiliate-page/element-card";
import { Select, SelectTrigger, SelectValue } from "../ui/select";

type AdditionalInfoProps = {};

export default function AdditionalInfo() {
  const AdditionalInfoMap : Record<string, React.ReactNode> = {
    "Factura": (<></>),
    "Nota de crédito": (<></>),
    "Recibo": (<></>)
  }
  return (
    <>
      {AdditionalInfoMap["Factura"]}
    </>
  );
}
