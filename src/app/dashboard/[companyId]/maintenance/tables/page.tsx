import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/server";

const items = [
  { es: "documentos subidos", en: "uploaded_documents" },
  { es: "generos", en: "genders" },
  { es: "estados civiles", en: "civil_status" },
  { es: "parental", en: "parental" },
  { es: "modos", en: "modos" },
  { es: "obras sociales", en: "health_insurances" },
  { es: "niveles comerciales", en: "market_levels" },
  { es: "entidades financieras", en: "financial_entities" },
  { es: "estados", en: "status" },
  { es: "comprobantes", en: "receipt" },
  { es: "impuestos", en: "taxes" },
  { es: "rubros", en: "items" },
  { es: "conceptos", en: "concepts" },
  { es: "unidades de negocios", en: "bussiness_unit" },
  { es: "categorias", en: "categories" },
  { es: "nomenclador", en: "Nomenclator" },
  { es: "provincias", en: "state" },
  { es: "paises", en: "countries" },
  { es: "zonas", en: "zone" },
  { es: "condicion afip", en: "afip_status" },
  { es: "iva", en: "iva" },
  { es: "condicion iibb", en: "ingresos_brutos" },
  { es: "codigos postales", en: "postal_codes" }
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
