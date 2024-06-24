# Project MICROSCOPE Checks

```js
const sql = FileAttachment("./data/pandora.json").json().then(json => DuckDBClient.sql(json));
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
