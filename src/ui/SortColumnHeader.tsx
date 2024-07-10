import { useCallback, useMemo, ReactNode } from "react";
import { useSearchParams } from "react-router-dom";

// define the sort arrow style
const sortArrowStyle: React.CSSProperties = { color: "#777", position: "relative", top: "-0.15em" };

// define types/interfaces
type TableDataItem = {
  [key: string]: any;
};
type SortDirection = "asc" | "desc";
type SortType = "alpha" | "numeric";
interface SortColumnHeaderProps {
  children: ReactNode;
  sortProperty: string;
  sortType?: SortType;
}

// sort array of objects alphabetically by property
function alphaSortByProperty(
  toSort: TableDataItem[],
  sortProperty: string,
  sortDirection: SortDirection = "asc"
): TableDataItem[] {
  return [...toSort].sort((a, b) => {
    const propertyA = a?.[sortProperty]?.toUpperCase();
    const propertyB = b?.[sortProperty]?.toUpperCase();
    if (propertyA < propertyB) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (propertyA > propertyB) {
      return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });
}

// sort array of objects numerically by property
function numericSortByProperty(
  toSort: TableDataItem[],
  sortProperty: string,
  sortDirection: SortDirection = "asc"
): TableDataItem[] {
  return [...toSort].sort((a, b) => {
    return sortDirection === "asc"
      ? a?.[sortProperty] - b?.[sortProperty]
      : b?.[sortProperty] - a?.[sortProperty];
  });
}

// toggle sort direction
function toggleDirection(sortDirection: SortDirection): SortDirection {
  return sortDirection === "asc" ? "desc" : "asc";
}

// parse sort search parameters
function parseSortSearchParams(searchParams: URLSearchParams): [string | null, SortDirection | null, string | null] {
  // "sort" search param will be in format `${sortProperty} ${sortDirection: "asc" | "desc"} ${sortType: "a" | "n"}`
  const [sortProperty, sortDirection, sortType] = searchParams.get("sort")?.split(" ") || [null, null, null];
  return [sortProperty, sortDirection as SortDirection, sortType];
}

/*
  Usage:
  1) Wrap column headers in SortColumnHeader component, setting sortProperty prop to the name of the object property this column sorts by.
  2) Run useSortTable() hook on array of objects used for table data, receiving the sorted array as the return value.
*/
export default function SortColumnHeader({
  children,
  sortProperty,
  sortType = "alpha",
}: SortColumnHeaderProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentSortProperty, currentDirection] = parseSortSearchParams(searchParams);

  // changes "sort" search param to new value
  const setSort = useCallback(
    (sortProperty: string, sortType: SortType) => {
      setSearchParams((prevParams) => {
        const [prevSortProperty, prevSortDirection] = parseSortSearchParams(prevParams);
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
    [setSearchParams]
  );

  // adds sort functionality and sort directional arrows to column headers
  return (
    <span onClick={() => setSort(sortProperty, sortType)} style={{ cursor: "pointer" }}>
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

// hook to sort array of objects that is used for table data in accordance with set "sort" search param
SortColumnHeader.useSortTable = function (tableData: TableDataItem[]): TableDataItem[] {
  const [searchParams] = useSearchParams();
  const [sortProperty, sortDirection, sortType] = parseSortSearchParams(searchParams);

  const sortedTableData = useMemo(() => {
    if (!sortProperty) return tableData; // if no sort search param, skip sort
    return sortType === "a"
      ? alphaSortByProperty(tableData, sortProperty, sortDirection || "asc")
      : numericSortByProperty(tableData, sortProperty, sortDirection || "asc");
  }, [tableData, sortProperty, sortDirection, sortType]);

  return sortedTableData;
};
