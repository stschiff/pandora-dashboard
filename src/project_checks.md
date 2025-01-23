# Project MICROSCOPE Checks

```js
import { loadEagerTableProcessed } from "./components/eager.js";
```

```js
const pandoraTables = await FileAttachment("./data/pandora.json").json();
const eagerTableProcessed = await loadEagerTableProcessed();
Object.assign(pandoraTables, {eager: eagerTableProcessed});
const sql = await DuckDBClient.sql(pandoraTables);

```

Checking for samples whose individual is not there:
```sql
SELECT *
FROM
              samples     AS S
    LEFT JOIN individuals AS I ON S.individual = I.Id
WHERE
    I.Id IS NULL;
```

Checking for extracts whose sample is not there:
```sql
SELECT *
FROM
              extracts AS E
    LEFT JOIN samples  AS S ON E.sample = S.Id
WHERE
    S.Id IS NULL;
```

Checking for libraries whose extract is not there:
```sql
SELECT *
FROM
              libraries AS L
    LEFT JOIN extracts  AS E ON L.extract = E.Id
WHERE
    E.Id IS NULL;
```

Checking for captures whose libraries is not there:
```sql
SELECT *
FROM
              captures  AS C
    LEFT JOIN libraries AS L ON C.library = L.Id
WHERE
    L.Id IS NULL;
```

Checking for sequencings whose captures is not there:
```sql
SELECT *
FROM
              sequencings AS S
    LEFT JOIN captures    AS C ON S.capture = C.Id
WHERE
    C.Id IS NULL;
```

Checking for Eager entities whose sequencings are not there:
```sql id=eagerTable
SELECT *
FROM
              eager       AS Ea
    LEFT JOIN sequencings AS Se ON Ea.sample LIKE CONCAT(Se.Full_Sequencing_Id, '%')
WHERE
    Se.Id IS NULL AND
    regexp_full_match(Ea.sample, '[A-Z]{3}[0-9]{3}\.[A-Z][0-9]{4}.[A-Z]{2}[0-9]\.[0-9].+')
```

```js
view(Inputs.table(eagerTable))
```

Showing ${eagerTable.numRows} sequencings