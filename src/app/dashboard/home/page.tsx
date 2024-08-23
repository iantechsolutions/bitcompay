import LayoutContainer from "~/components/layout-container";

export default function Home() {
  return (
    <LayoutContainer className="flex justify-center items-center">
      <div className="card text-center m-5 pb-2">
        <div className="flex flex-col justify-center items-center gap-7 mt-[3vh]">
          <h1 className="text-[#6952EB] text-startH2 font-extrabold">
            ¡Bienvenido/a a nuestra plataforma!
          </h1>
          <h2 className="text-startH3">
            Simplifique la gestión de tesorería de su empresa
          </h2>
          <p className="text-startP">
            Acceda desde el menú lateral a todas nuestras funciones.
          </p>
        </div>
      </div>
    </LayoutContainer>
  );
}
