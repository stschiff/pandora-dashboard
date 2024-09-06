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

```sql id=ind_table
SELECT
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
  HAVING NrExtracts = 0
```

```js
const found_individuals = view(Inputs.table(ind_table, {
  format: {
    "Creation_Date": (d) => d.substring(0, 10)
  }}));
```
Found ${found_individuals.length} individuals.


## Extracts without libraries

```sql id=ext_table
SELECT
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
  HAVING NrLibraries = 0
```

```js
const found_extracts = view(Inputs.table(ext_table, {
  format: {
    "Experiment_Date": (d) => d.substring(0, 10)
  }}));
```
Found ${found_extracts.length} extracts.

## Libraries without sequencing

```sql id=lib_table
SELECT
  FIRST(L.Full_Library_Id) AS Library,
  FIRST(I.Name)            AS Site,
  FIRST(I.Country)         AS Country,
  FIRST(L.Experiment_Date) AS Experiment_Date, 
  COUNT(Se.Id)             AS NrSequencings
FROM
            libraries      AS L    
  LEFT JOIN extracts       AS E  ON L.extract    = E.Id
  LEFT JOIN samples        AS S  ON E.sample     = S.Id
  LEFT JOIN individuals    AS I  ON S.individual = I.Id
  LEFT JOIN captures       AS C  ON C.library    = L.Id
  LEFT JOIN sequencings    AS Se ON Se.capture   = C.Id
  GROUP BY E.Full_Extract_Id
  HAVING NrSequencings = 0
```

```js
const found_libraries = view(Inputs.table(lib_table, {
  format: {
    "Experiment_Date": (d) => d.substring(0, 10)
  }}));
```
Found ${found_libraries.length} libraries.

## Sequencing without Eager

```sql id=seq_table
SELECT
  FIRST(Se.Full_Sequencing_Id) AS Sequencing,
  FIRST(I.Name)                AS Site,
  FIRST(I.Country)             AS Country,
  FIRST(Se.Experiment_Date)    AS Experiment_Date,
  COUNT(Ea.Sample)             AS NrEager
FROM
            sequencings AS Se
  LEFT JOIN eager       AS Ea ON Ea.sample LIKE CONCAT(Se.Full_Sequencing_Id, '%')
  LEFT JOIN captures    AS C  ON Se.capture    = C.Id
  LEFT JOIN libraries   AS L  ON C.library     = L.Id
  LEFT JOIN extracts    AS E  ON L.extract     = E.Id
  LEFT JOIN samples     AS Sa ON E.sample      = Sa.Id
  LEFT JOIN individuals AS I  ON Sa.individual = I.Id
  GROUP BY Se.Full_Sequencing_Id
  HAVING NrEager = 0
```

```js
const found_sequencings = view(Inputs.table(seq_table, {
  format: {
    "Experiment_Date": (d) => d.substring(0, 10)
  }}));
```
Found ${found_sequencings.length} libraries.


## Individuals who need additional sequencing