import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { FixedSizeList as List } from "react-window";
import dayjs from "dayjs";
import { Input } from "./ui/input";

export type TableHeaders = {
  key: string;
  label: React.ReactNode;
  width?: number;
  alwaysRequired?: boolean;
}[];

const tableContext = createContext<{
  rows: Record<string, unknown>[];
  headers: TableHeaders;
  columns: (string | number | undefined)[];
  onInputChange?: (rowIndex: number, key: string, newValue: string) => void;
}>({
  rows: [],
  headers: [],
  columns: [],
  onInputChange: () => {},
});

export function LargeEditableTable(props: {
  rows: Record<string, unknown>[];
  headers?: TableHeaders;
  height?: number;
  columns?: (string | number | undefined)[];
  reason?: string;
  onRowChange?: (rowIndex: number, updatedRow: Record<string, unknown>) => void;
}) {
  const height = props.height ?? 600;

  const document =
    typeof global.document !== "undefined" ? global.document : null;

  const headers = useTableHeaders(props.headers, props.rows);
  const handleInputChange = (
    rowIndex: number,
    key: string,
    newValue: string,
  ) => {
    const row = props.rows[rowIndex];
    if (props.onRowChange) {
      const updatedRow = { ...props.rows[rowIndex], [key]: newValue };
      props.onRowChange(rowIndex, updatedRow);
    }
  };
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
        columns: props.columns || [],
        onInputChange: handleInputChange,
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
      {props.reason && (
        <div style={{ backgroundColor: "red" }}>{props.reason}</div>
      )}
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

  // Determine if this row should have a special cell
  const specialCellKey = ctx.columns[props.index];

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
        const [variable, setVariable] = useState(value);

        if (value instanceof Date) {
          value = dayjs(value).format("YYYY-MM-DD");
        }

        const w = header.width ?? 160;

        if (header.label?.toString() === specialCellKey) {
          const handleVariableChange = (newValue: any) => {
            setVariable(newValue);
            ctx.onInputChange!(props.index, header.key, newValue);
          };
          return (
            <div
              key={header.key}
              style={{
                width: w,
                maxWidth: w,
                minWidth: w,
                backgroundColor: "red",
              }}
              className="flex items-center overflow-hidden text-ellipsis whitespace-nowrap border-r px-1 last:border-none"
            >
              <Input
                value={variable}
                onChange={(e) => {
                  handleVariableChange(e.target.value);
                }}
              />
            </div>
          );
        } else {
          return (
            <div
              key={header.key}
              style={{
                width: w,
                maxWidth: w,
                minWidth: w,
                backgroundColor:
                  header.key === specialCellKey ? "red" : undefined,
              }}
              className="flex items-center overflow-hidden text-ellipsis whitespace-nowrap border-r px-1 last:border-none"
            >
              {value}
            </div>
          );
        }
      })}
    </div>
  );
}
