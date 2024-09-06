# Entities with open decisions or ToDos

```js
import { loadEagerTableProcessed, loadEagerIndividuals } from "./components/eager.js";
```

```js
const pandoraTables = await FileAttachment("./data/pandora.json").json();
const eagerTableProcessed = await loadEagerTableProcessed();
const eagerIndividuals = await loadEagerIndividuals();
Object.assign(pandoraTables, {eager: eagerTableProcessed, eagerIndividuals});
const sql = await DuckDBClient.sql(pandoraTables);
```

## Individuals without extracts

```js 
const qInds = `SELECT
  FIRST(I.Full_Individual_Id) AS Individual,
  FIRST(I.Name)               AS Site,
  FIRST(I.Country)            AS Country,
  FIRST(I.Creation_Date)      AS Creation_Date, 
  COUNT(E.Id)                 AS NrExtracts
FROM
            individuals       AS I
  LEFT JOIN samples           AS S    ON S.Individual = I.Id
  LEFT JOIN extracts          AS E    ON E.Sample     = S.Id
  GROUP BY I.Full_Individual_Id
  HAVING NrExtracts = 0`
const ind_table = sql([qInds]);
```

```js
const found_individuals = view(Inputs.table(ind_table, {
  format: {
    "Creation_Date": (d) => d.substring(0, 10)
  }}));
```
Found ${found_individuals.length} individuals.


## Extracts without libraries

```js 
const qExts = `SELECT
  FIRST(E.Full_Extract_Id) AS Extract,
  FIRST(I.Name)            AS Site,
  FIRST(I.Country)         AS Country,
  FIRST(S.Experiment_Date) AS Experiment_Date, 
  COUNT(L.Id)              AS NrLibraries
FROM
            extracts       AS E
  LEFT JOIN libraries      AS L    ON L.extract = E.Id
  LEFT JOIN samples        AS S    ON E.sample = S.Id
  LEFT JOIN individuals    AS I    ON S.individual     = I.Id
  GROUP BY E.Full_Extract_Id
  HAVING NrLibraries = 0`
const ext_table = sql([qExts]);
```

```js
const found_extracts = view(Inputs.table(ext_table, {
  format: {
    "Experiment_Date": (d) => d.substring(0, 10)
  }}));
```
Found ${found_extracts.length} extracts.

## Libraries without sequencing

```js 
const qExts = `SELECT
  FIRST(E.Full_Extract_Id) AS Extract,
  FIRST(I.Name)            AS Site,
  FIRST(I.Country)         AS Country,
  FIRST(S.Experiment_Date) AS Experiment_Date, 
  COUNT(L.Id)              AS NrLibraries
FROM
            extracts       AS E
  LEFT JOIN libraries      AS L    ON L.extract = E.Id
  LEFT JOIN samples        AS S    ON E.sample = S.Id
  LEFT JOIN individuals    AS I    ON S.individual     = I.Id
  GROUP BY E.Full_Extract_Id
  HAVING NrLibraries = 0`
const ext_table = sql([qExts]);
```

```js
const found_extracts = view(Inputs.table(ext_table, {
  format: {
    "Experiment_Date": (d) => d.substring(0, 10)
  }}));
```
Found ${found_extracts.length} extracts.
## Sequencing without Eager

## Individuals who need additional sequencing