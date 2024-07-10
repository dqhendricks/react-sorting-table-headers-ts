import { useCallback, useMemo, ReactNode } from "react";
import { useSearchParams } from "react-router-dom";

// Define the sort arrow style
const sortArrowStyle: React.CSSProperties = {
  color: "#777",
  position: "relative",
  top: "-0.15em",
};

// Define a type for table data items
type TableDataItem = {
  [key: string]: string | number;
};

// Define the type for sort direction
type SortDirection = "asc" | "desc";

// Define the type for sort type
type SortType = "alpha" | "numeric";

// Function to sort array of objects alphabetically by property
function alphaSortByProperty(
  toSort: TableDataItem[],
  sortProperty: string,
  sortDirection: SortDirection = "asc",
): TableDataItem[] {
  return [...toSort].sort((a, b) => {
    const propertyA = a?.[sortProperty]?.toString().toUpperCase();
    const propertyB = b?.[sortProperty]?.toString().toUpperCase();
    if (propertyA < propertyB) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (propertyA > propertyB) {
      return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });
}

// Function to sort array of objects numerically by property
function numericSortByProperty(
  toSort: TableDataItem[],
  sortProperty: string,
  sortDirection: SortDirection = "asc",
): TableDataItem[] {
  return [...toSort].sort((a, b) => {
    return sortDirection === "asc"
      ? (a?.[sortProperty] as number) - (b?.[sortProperty] as number)
      : (b?.[sortProperty] as number) - (a?.[sortProperty] as number);
  });
}

// Function to toggle sort direction
function toggleDirection(sortDirection: SortDirection): SortDirection {
  return sortDirection === "asc" ? "desc" : "asc";
}

// Function to parse sort search parameters
function parseSortSearchParams(
  searchParams: URLSearchParams,
): [string | null, SortDirection | null, string | null] {
  // "sort" search param will be in format `${sortProperty} ${sortDirection: "asc" | "desc"} ${sortType: "a" | "n"}`
  const [sortProperty, sortDirection, sortType] = searchParams
    .get("sort")
    ?.split(" ") || [null, null, null];
  return [sortProperty, sortDirection as SortDirection, sortType];
}

// Props type for SortColumnHeader component
interface SortColumnHeaderProps {
  children: ReactNode;
  sortProperty: string;
  sortType?: SortType; // "alpha" | "numeric"
}

/*
  Usage:
  1) Wrap column headers in SortColumnHeader component, setting sortProperty prop to the name of the object property this column sorts by.
  2) Run useSortTable() hook on array of objects used for table data, receiving the sorted array as the return value.
*/
export default function SortColumnHeader({
  children,
  sortProperty,
  sortType = "alpha", // "alpha" | "numeric"
}: SortColumnHeaderProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentSortProperty, currentDirection] =
    parseSortSearchParams(searchParams);

  // Changes "sort" search param to new value
  const setSort = useCallback(
    (sortProperty: string, sortType: SortType) => {
      setSearchParams((prevParams) => {
        const [prevSortProperty, prevSortDirection] =
          parseSortSearchParams(prevParams);
        const newParamArray = [
          sortProperty,
          prevSortProperty !== sortProperty // if clicking new column, default to direction "asc"
            ? "asc"
            : toggleDirection(prevSortDirection || "asc"),
          sortType === "alpha" ? "a" : "n",
        ];
        const newParams = new URLSearchParams(prevParams);
        newParams.set("sort", newParamArray.join(" "));
        return newParams;
      });
    },
    [setSearchParams],
  );

  // Adds sort functionality and sort directional arrows to column headers
  return (
    <span
      onClick={() => setSort(sortProperty, sortType)}
      style={{ cursor: "pointer" }}
    >
      {children}
      {currentSortProperty === sortProperty &&
        (currentDirection === "asc" ? (
          <span style={sortArrowStyle}>&nbsp;↑</span>
        ) : (
          <span style={sortArrowStyle}>&nbsp;↓</span>
        ))}
    </span>
  );
}

// Type guard to check if table data items contain strings
function isAlphaTableData(
  data: TableDataItem[],
  sortProperty: string,
): data is TableDataItem[] {
  return typeof data[0]?.[sortProperty] === "string";
}

// Type guard to check if table data items contain numbers
function isNumericTableData(
  data: TableDataItem[],
  sortProperty: string,
): data is TableDataItem[] {
  return typeof data[0]?.[sortProperty] === "number";
}

// Hook to sort array of objects that is used for table data in accordance with "sort" search param
SortColumnHeader.useSortTable = function (
  tableData: TableDataItem[],
): TableDataItem[] {
  const [searchParams] = useSearchParams();
  const [sortProperty, sortDirection, sortType] =
    parseSortSearchParams(searchParams);

  const sortedTableData = useMemo(() => {
    if (!sortProperty) return tableData; // if no sort search param, skip sort

    if (sortType === "a" && isAlphaTableData(tableData, sortProperty)) {
      return alphaSortByProperty(
        tableData,
        sortProperty,
        sortDirection || "asc",
      );
    }

    if (sortType === "n" && isNumericTableData(tableData, sortProperty)) {
      return numericSortByProperty(
        tableData,
        sortProperty,
        sortDirection || "asc",
      );
    }

    return tableData;
  }, [tableData, sortProperty, sortDirection, sortType]);

  return sortedTableData;
};
