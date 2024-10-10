import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/server";

const items = [
  { es: "Categorías", en: "categories" },
  { es: "Códigos postales", en: "postal_codes" },
  { es: "Comprobantes", en: "receipt" },
  { es: "Conceptos", en: "concepts" },
  { es: "Condición IIBB", en: "ingresos_brutos" },
  { es: "Condiciónes AFIP", en: "afip_status" },
  { es: "Documentos subidos", en: "uploaded_documents" },
  { es: "Entidades financieras", en: "financial_entities" },
  { es: "Estados", en: "status" },
  { es: "Estados civiles", en: "civil_status" },
  { es: "Establecimientos", en: "establishments" },
  { es: "Género", en: "genders" },
  { es: "IVA", en: "iva" },
  { es: "Impuestos", en: "taxes" },
  { es: "Modos", en: "modos" },
  { es: "Niveles comerciales", en: "market_levels" },
  { es: "Nomenclador", en: "nomenclator" },
  { es: "Países", en: "countries" },
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
