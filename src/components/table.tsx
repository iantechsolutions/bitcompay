import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
} from "react";
import { FixedSizeList as List } from "react-window";
import dayjs from "dayjs";

export type TableHeaders = {
  key: string;
  label: React.ReactNode;
  width?: number;
  alwaysRequired?: boolean;
}[];

const tableContext = createContext<{
  rows: Record<string, any>[];
  headers: TableHeaders;
}>({
  rows: [],
  headers: [],
});

export function LargeTable(props: {
  rows: Record<string, any>[];
  headers?: TableHeaders;
  height?: number;
}) {
  const height = props.height || 600;

  const document =
    typeof global.document !== "undefined" ? global.document : null;

  const headers = useTableHeaders(props.headers, props.rows);

  const headerId = useId();

  const uniqueClassName = useId();

  const header = document?.getElementById(headerId);
  const list = document?.getElementsByClassName(uniqueClassName)[0];

  useLayoutEffect(() => {
    // Set list scroll (uniqueClasName) to scroll headerId

    if (!header || !list) return;
    list.addEventListener("scroll", () => {
      header.scrollLeft = list.scrollLeft;
    });

    return () => {
      list.removeEventListener("scroll", () => {
        header.scrollLeft = list.scrollLeft;
      });
    };
  }, [header, list]);

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
                className="flex items-center overflow-hidden text-ellipsis whitespace-nowrap px-1 text-xs font-semibold"
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
          height={height}
          itemCount={props.rows.length}
          itemSize={35}
          width={"100%"}
          children={Row}
        />
      </div>
    </tableContext.Provider>
  );
}

function useTableHeaders(
  headers: TableHeaders | undefined,
  data: Record<string, any>[],
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
        let value: any = row[header.key];

        if (value instanceof Date) {
          value = dayjs(value).format("YYYY-MM-DD");
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
