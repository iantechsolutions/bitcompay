import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/server";

const items = [
  { es: "Documentos Subidos", en: "uploaded_documents" },
  { es: "Generos", en: "genders" },
  { es: "Estados Civiles", en: "civil_status" },
  { es: "Parental", en: "parental" },
  { es: "Modos", en: "modos" },
  { es: "Obras Sociales", en: "health_insurances" },
  { es: "Niveles Comerciales", en: "market_levels" },
  { es: "Entidades Financieras", en: "financial_entities" },
  { es: "Estados", en: "status" },
  { es: "Comprobantes", en: "receipt" },
  { es: "Impuestos", en: "taxes" },
  { es: "Rubros", en: "items" },
  { es: "Conceptos", en: "concepts" },
  { es: "Unidades de negocio", en: "bussiness_unit" },
  { es: "Categorias", en: "categories" },
  { es: "Nomenclador", en: "Nomenclator" },
  { es: "Provincias", en: "state" },
  { es: "Paises", en: "countries" },
  { es: "Zonas", en: "zone" },
  { es: "Condiciones AFIP", en: "afip_status" },
  { es: "IVA", en: "iva" },
  { es: "Condicion IIBB", en: "ingresos_brutos" },
  { es: "Codigos postales", en: "postal_codes" },
  { es: "Establecimientos", en: "establishments" },
];

export default async function Maintenance(props: {
  params: { companyId: string };
}) {
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Tablas</Title>
        </div>
        <List>
          {items.map(({ es, en }) => (
            <ListTile
              key={en}
              href={`/dashboard/faIKDivwt7Z8Gp-B5yFrv/maintenance/tables/${en}`}
              title={es as React.ReactNode}
            />
          ))}
        </List>
      </section>
    </LayoutContainer>
  );
}
