import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/server";

const items = [
  { es: "Documentos subidos", en: "uploaded_documents" },
  { es: "Generos", en: "genders" },
  { es: "Estados civiles", en: "civil_status" },
  { es: "Parental", en: "parental" },
  { es: "Modos", en: "modos" },
  { es: "Obras sociales", en: "health_insurances" },
  { es: "Niveles comerciales", en: "market_levels" },
  { es: "Entidades financieras", en: "financial_entities" },
  { es: "Estados", en: "status" },
  { es: "Comprobantes", en: "receipt" },
  { es: "Impuestos", en: "taxes" },
  { es: "Rubros", en: "items" },
  { es: "Conceptos", en: "concepts" },
  { es: "Unidades de negocios", en: "bussiness_unit" },
  { es: "Categorias", en: "categories" },
  { es: "Nomenclador", en: "Nomenclator" },
  { es: "Provincias", en: "state" },
  { es: "Paises", en: "countries" },
  { es: "Zonas", en: "zone" },
  { es: "Condicion afip", en: "afip_status" },
  { es: "Iva", en: "iva" },
  { es: "Condicion iibb", en: "ingresos_brutos" },
  { es: "Codigos postales", en: "postal_codes" }
];

export default async function Maintenance(props: { params: { companyId: string } }) {
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Mantenimiento</Title>
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
