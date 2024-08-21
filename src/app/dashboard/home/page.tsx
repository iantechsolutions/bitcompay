import LayoutContainer from "~/components/layout-container";

export default function Home() {
  return (
    <LayoutContainer className="flex justify-center items-center max-w-[2000px] mt-5 ">
      <div className="card text-center m-5 pb-2">
        <div className="flex flex-col justify-center items-center gap-7 mt-5">
          <h1 className="text-[#6952EB] text-5xl font-extrabold">
            ¡Bienvenido/a a nuestra plataforma!
          </h1>
          <h2 className="text-[1.7rem]">
            Simplifique la gestión de tesorería de su empresa
          </h2>
          <p className="text-[1.2rem]">
            Acceda desde el menú lateral a todas nuestras funciones.
          </p>
        </div>
      </div>
    </LayoutContainer>
  );
}
