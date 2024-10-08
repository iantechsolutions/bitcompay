import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/server";

const items = [
  { es: "Categorias", en: "categories" },
  { es: "Codigos postales", en: "postal_codes" },
  { es: "Comprobantes", en: "receipt" },
  { es: "Conceptos", en: "concepts" },
  { es: "Condicion IIBB", en: "ingresos_brutos" },
  { es: "Condiciones AFIP", en: "afip_status" },
  { es: "Documentos Subidos", en: "uploaded_documents" },
  { es: "Entidades Financieras", en: "financial_entities" },
  { es: "Estados", en: "status" },
  { es: "Estados Civiles", en: "civil_status" },
  { es: "Establecimientos", en: "establishments" },
  { es: "Generos", en: "genders" },
  { es: "IVA", en: "iva" },
  { es: "Impuestos", en: "taxes" },
  { es: "Modos", en: "modos" },
  { es: "Niveles Comerciales", en: "market_levels" },
  { es: "Nomenclador", en: "nomenclator" },
  { es: "Paises", en: "countries" },
  { es: "Parental", en: "parental" },
  { es: "Provincias", en: "province" },
  { es: "Rubros", en: "items" },
  { es: "Unidades de negocio", en: "bussiness_unit" },
  { es: "Zonas", en: "zone" },
  {es: "Obras sociales no clientes", en: "no-client-os"}
];

export default async function Maintenance() {
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
              href={`/maintenance/tables/${en}`}
              title={es as React.ReactNode}
            />
          ))}
        </List>
      </section>
    </LayoutContainer>
  );
}
