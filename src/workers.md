# Workers

```js
const pandoraTables = await FileAttachment("./data/pandora.json").json();
const sql = await DuckDBClient.sql(pandoraTables);
```

```js
const worker = view(Inputs.select(["Tanja Schmidt", "Johannes Liebau"]));
```

## Samples
```sql
SELECT
    S.Full_Sample_Id  AS Entity,
    I.Country         AS Country,
    S.Experiment_Date AS Date,
    S.Worker          AS Worker
FROM
               samples     AS S
    INNER JOIN individuals AS I ON S.Individual = I.Id
WHERE
    Worker = ${worker};
```

## Extracts
```sql
SELECT
    E.Full_Extract_Id AS Entity,
    I.Country         AS Country,
    E.Experiment_Date AS Date,
    E.Worker          AS Worker
FROM
               extracts    AS E
    INNER JOIN samples     AS S ON E.Sample = S.Id
    INNER JOIN individuals AS I ON S.Individual = I.Id
WHERE
    E.Worker = ${worker};
```

## Libraries
```sql
SELECT
    L.Full_Library_Id AS Entity,
    I.Country         AS Country,
    L.Experiment_Date AS Date,
    L.Worker          AS Worker
FROM
               libraries   AS L
    INNER JOIN extracts    AS E ON L.Extract = E.Id
    INNER JOIN samples     AS S ON E.Sample = S.Id
    INNER JOIN individuals AS I ON S.Individual = I.Id
WHERE
    L.Worker = ${worker};
```

## Captures
```sql
SELECT
    C.Full_Capture_Id AS Entity,
    I.Country         AS Country,
    C.Experiment_Date AS Date,
    C.Worker          AS Worker
FROM
               captures    AS C
    INNER JOIN libraries   AS L ON C.Library = L.Id
    INNER JOIN extracts    AS E ON L.Extract = E.Id
    INNER JOIN samples     AS S ON E.Sample = S.Id
    INNER JOIN individuals AS I ON S.Individual = I.Id
WHERE
    C.Worker = ${worker};
```
