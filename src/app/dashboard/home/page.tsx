import LayoutContainer from "~/components/layout-container";

export default function Home() {
  return (
    <LayoutContainer className="flex justify-center items-center">
      <div className="flex flex-col justify-center items-center gap-5 mt-5">
        <h1 className="text-[#6952EB] text-4xl font-bold">
          ¡Bienvenido/a a nuestra plataforma!
        </h1>
        <h2 className="text-[1.3rem]">
          Simplifique la gestión de tesorería de su empresa
        </h2>
        <p>Acceda desde el menú lateral a todas nuestras funciones.</p>
      </div>
    </LayoutContainer>
  );
}
