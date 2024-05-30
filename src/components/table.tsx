import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
} from "react";
import { FixedSizeList as List } from "react-window";
dayjs.extend(utc);
export type TableHeaders = {
  key: string;
  label: React.ReactNode;
  width?: number;
  alwaysRequired?: boolean;
}[];

const tableContext = createContext<{
  rows: Record<string, unknown>[];
  headers: TableHeaders;
}>({
  rows: [],
  headers: [],
});

export function LargeTable(props: {
  rows: Record<string, unknown>[];
  headers?: TableHeaders;
  height?: number;
}) {
  const listHeight =
    props.rows.length * 35 > 600 ? 600 : props.rows.length * 35 + 10;

  const document =
    typeof global.document !== "undefined" ? global.document : null;

  const headers = useTableHeaders(props.headers, props.rows);

  const headerId = useId();
  const uniqueClassName = useId();

  useLayoutEffect(() => {
    const header = document?.getElementById(headerId);
    const list = document?.getElementsByClassName(uniqueClassName)[0];

    const syncScroll = () => {
      if (header && list) {
        header.scrollLeft = list.scrollLeft;
      }
    };

    if (list) {
      list.addEventListener("scroll", syncScroll);
    }

    return () => {
      if (list) {
        list.removeEventListener("scroll", syncScroll);
      }
    };
  }, [headerId, uniqueClassName]);

  return (
    <tableContext.Provider
      value={{
        rows: props.rows,
        headers,
      }}
    >
      <div className="overflow-hidden">
        <div
          id={headerId}
          className="flex flex-nowrap overflow-hidden py-1 shadow-md"
        >
          {headers.map((header) => {
            const w = header.width ?? 160;
            return (
              <div
                key={header.key}
                className="flex items-center overflow-hidden text-ellipsis whitespace-nowrap px-1 font-semibold text-xs"
                style={{
                  width: w,
                  maxWidth: w,
                  minWidth: w,
                }}
              >
                {header.label}
              </div>
            );
          })}
          <div className="min-w-[100px]" />
        </div>
        <List
          className={uniqueClassName}
          height={listHeight}
          itemCount={props.rows.length}
          itemSize={35}
          width={"100%"}
        >
          {Row}
        </List>
      </div>
    </tableContext.Provider>
  );
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function useTableHeaders(
  headers: TableHeaders | undefined,
  data: Record<string, any>[]
): TableHeaders {
  return useMemo(() => {
    if (headers) {
      return headers;
    }

    const keys = new Set<string>();
    for (const row of data) {
      for (const key of Object.keys(row)) {
        keys.add(key);
      }
    }

    return Array.from(keys).map((key) => {
      return {
        key,
        label: key,
      };
    });
  }, [headers, data]);
}

function Row(props: { style?: React.CSSProperties; index: number }) {
  const ctx = useContext(tableContext);
  const row = ctx.rows[props.index]!;

  return (
    <div
      style={{
        ...props.style,
        width: "",
      }}
      className="flex border-b last:border-none"
    >
      {ctx.headers.map((header) => {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        let value: any = row[header.key];

        if (value instanceof Date) {
          value = dayjs.utc(value).format("DD-MM-YYYY");
        }

        if (typeof value === "boolean") {
          value = value ? "Sí" : "No";
        }

        const w = header.width ?? 160;

        return (
          <div
            key={header.key}
            style={{
              width: w,
              maxWidth: w,
              minWidth: w,
            }}
            className="flex items-center overflow-hidden text-ellipsis whitespace-nowrap border-r px-1 last:border-none"
          >
            {value}
          </div>
        );
      })}
    </div>
  );
}
