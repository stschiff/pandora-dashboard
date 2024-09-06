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

# Individuals without extracts

```js 
const qInds = `SELECT
  FIRST(I.Full_Individual_Id) AS Individual,
  FIRST(I.Name)               AS Site,
  FIRST(I.Country)            AS Country,
  COUNT(E.Id)     AS NrExtracts
FROM
            individuals      AS I
  LEFT JOIN samples          AS S    ON S.Individual = I.Id
  LEFT JOIN extracts         AS E    ON E.Sample     = S.Id
  GROUP BY I.Full_Individual_Id`
const ind_table = sql([qInds]);
```

```js
const selected_individuals = view(Inputs.table(ind_table));
```
Selected ${selected_individuals.length} individuals.



# Extracts without libraries

# Libraries without sequencing

# Sequencing without Eager

# Individuals who need additional sequencing