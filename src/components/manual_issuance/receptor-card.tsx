import ElementCard from "../affiliate-page/element-card";

interface Props {
    nombre: string;
    nroDocumentoDNI: string;
    nroDocumento: string;
    conditionIVA?: string;
    conditionVenta?: string;
}
const ReceptorCard = ({nombre, nroDocumentoDNI, nroDocumento, conditionIVA, conditionVenta}: Props) => {
  return (
    <div className="bg-[#F7F7F7] rounded-lg py-4 pb-6 px-2">
      <div className="w-full grid grid-flow-col justify-stretch px-4 gap-4">
        <ElementCard
          element={{ key: "NOMBRE", value: nombre }}
          className="grow-0"
        ></ElementCard>

        <ElementCard
          element={{ key: "DNI", value: nroDocumentoDNI }}
          className="pr-8 "
        ></ElementCard>
        <ElementCard
          element={{ key: "CUIT", value: nroDocumento }}
          className="pr-11 "
        ></ElementCard>
      </div>
      <div className="w-full grid grid-flow-col justify-stretch px-4 gap-4 mt-3 capitalize">
        <ElementCard
          className="grow-0"
          element={{
            key: "Condición IVA",
            value: conditionIVA ?? "Responsable Inscripto",
          }}
        ></ElementCard>
        <ElementCard
          className=""
          element={{
            key: "Condición de Venta",
            value: conditionVenta ?? "Cuenta corriente",
          }}
        ></ElementCard>
      </div>
    </div>
  );
};

export default ReceptorCard;
