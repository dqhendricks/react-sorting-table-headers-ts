# react-sorting-table-headers-ts
This react component allows us to wrap table headers enabling them to add sort data to search params, as well as provides a hook that uses the added search param to sort the table data.

*Notes: react-router-dom must be installed properly.*

For a working example, view the code sandbox [here](https://codesandbox.io/p/devbox/react-sorting-table-header-ts-4n99jl), or see below.

**Example usage:**

```
import React from "react";
import SortColumnHeader from "./ui/SortColumnHeader.tsx";

type ExampleDataItem = {
  id: number;
  name: string;
  age: number;
  city: string;
};

const exampleData: ExampleDataItem[] = [
  { id: 1, name: "Alice", age: 30, city: "New York" },
  { id: 2, name: "Bob", age: 25, city: "San Francisco" },
  { id: 3, name: "Charlie", age: 35, city: "Los Angeles" },
  { id: 4, name: "David", age: 28, city: "Chicago" },
];

const ExampleTable: React.FC = () => {
  const sortedData = SortColumnHeader.useSortTable(exampleData);

  return (
    <table>
      <thead>
        <tr>
          <th>
            <SortColumnHeader sortProperty="id" sortType="numeric">
              ID
            </SortColumnHeader>
          </th>
          <th>
            <SortColumnHeader sortProperty="name" sortType="alpha">
              Name
            </SortColumnHeader>
          </th>
          <th>
            <SortColumnHeader sortProperty="age" sortType="numeric">
              Age
            </SortColumnHeader>
          </th>
          <th>
            <SortColumnHeader sortProperty="city" sortType="alpha">
              City
            </SortColumnHeader>
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedData.map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.name}</td>
            <td>{item.age}</td>
            <td>{item.city}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ExampleTable;
```
