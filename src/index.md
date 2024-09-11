# Pandora dashboard for project MICROSCOPE

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

## Batches
```sql id=batch_table
SELECT DISTINCT
  batch_name,
  LEFT(batch_name, 10) AS date,
  RIGHT(batch_name, LEN(batch_name) - 11) AS short_name
FROM eagerIndividuals
```

```js
const batches_searched = view(Inputs.search(batch_table, {placeholder: "Search batches…"}));
```

```js
const selected_batches = view(Inputs.table(batches_searched));
```


## Sites
```js
const filter_cond_batches = selected_batches.length == [...batch_table].length ? "" :
  selected_batches.length ? `WHERE Ea.batch_name IN (${selected_batches.map(b => `'` + b.batch_name + `'`)})` :
  "WHERE 1==2";
const qSites = `SELECT
  FIRST(I.Full_Site_Id) AS Site_Id,
  FIRST(I.Name)         AS Site,
  FIRST(I.Country)      AS Country,
  COUNT(DISTINCT I.Id)  AS NrIndividuals,
  COUNT(DISTINCT S.Id)  AS NrSamples,  
  COUNT(DISTINCT E.Id)  AS NrExtracts,
  COUNT(DISTINCT L.Id)  AS NrLibraries,
  COUNT(DISTINCT C.Id)  AS NrCaptures,
  COUNT(DISTINCT Se.Id) AS NrSequencings
  FROM
            individuals      AS I
  LEFT JOIN samples          AS S  ON S.Individual = I.Id
  LEFT JOIN extracts         AS E  ON E.Sample     = S.Id
  LEFT JOIN libraries        AS L  ON L.Extract    = E.Id
  LEFT JOIN captures         AS C  ON C.Library    = L.Id
  LEFT JOIN sequencings      AS Se ON Se.Capture   = C.Id
  LEFT JOIN eagerIndividuals AS Ea ON Ea.sample_clean = I.Full_Individual_Id
  ${filter_cond_batches}
  GROUP BY I.Full_Site_Id`
const sites_table = sql([qSites]);
```

```js
const sites_searched = view(Inputs.search(sites_table, {placeholder: "Search sites…"}));
```

```js
const selected_sites = view(Inputs.table(sites_searched));
```

## Individuals

```js 
const filter_cond_sites = selected_sites.length ? `WHERE I.Full_Site_Id IN (${selected_sites.map(s => `'` + s.Site_Id + `'`)})` : "WHERE 1==2";
const qInds = `SELECT
  FIRST(I.Full_Individual_Id) AS Individual,
  FIRST(I.Id)                 AS Id,
  FIRST(I.Name)               AS Site,
  FIRST(I.Country)            AS Country,
  FIRST(Ea.nr_snps_covered)   AS NrSnps,
  FIRST(Ea.xrate)             AS xrate,
  FIRST(Ea.yrate)             AS yrate,
  FIRST(Ea.stranded)          AS type,
  COUNT(DISTINCT L.Id)        AS NrLibraries,
  COUNT(DISTINCT Se.Id)       AS NrSequencings
FROM
            individuals      AS I
  LEFT JOIN samples          AS S    ON S.Individual = I.Id
  LEFT JOIN extracts         AS E    ON E.Sample     = S.Id
  LEFT JOIN libraries        AS L    ON L.Extract    = E.Id
  LEFT JOIN captures         AS C    ON C.Library    = L.Id
  LEFT JOIN sequencings      AS Se   ON Se.Capture   = C.Id
  LEFT JOIN eagerIndividuals AS Ea   ON Ea.sample_clean = I.Full_Individual_Id
  ${filter_cond_sites}
  GROUP BY I.Full_Individual_Id`
const ind_table = sql([qInds]);
```

```js
const selected_individuals = view(Inputs.table(ind_table, {
  columns: ["Individual", "NrLibraries", "NrSequencings", "NrSnps", "xrate", "yrate", "type"]
}));
```
Selected ${selected_individuals.length} individuals.

## Samples
```js 
const filter_cond_inds = selected_individuals.length ? `WHERE I.Id IN (${selected_individuals.map(i => i.Id)})` : "WHERE 1==2";
const qSamples = `SELECT
  FIRST(Sa.Id)              AS Id,
  FIRST(Sa.Full_Sample_Id)  AS Sample,
  FIRST(Sa.Experiment_Date) AS Date,
  FIRST(Sa.TypeGroup)       AS SourceGroup,
  FIRST(Sa.Type)            AS Source,
  COUNT(DISTINCT L.Id)      AS NrLibraries,
  COUNT(DISTINCT Se.Id)     AS NrSequencings
FROM
            samples         AS Sa
  LEFT JOIN individuals     AS I   ON Sa.individual = I.Id
  LEFT JOIN extracts        AS E   ON E.Sample      = Sa.Id
  LEFT JOIN libraries       AS L   ON L.Extract     = E.Id
  LEFT JOIN captures        AS C   ON C.Library     = L.Id
  LEFT JOIN sequencings     AS Se  ON Se.Capture    = C.Id
  ${filter_cond_inds}
  GROUP BY Sa.Full_Sample_Id`
const sample_table = sql([qSamples]);
```

```js
const selected_samples = view(Inputs.table(sample_table, {
  columns: ["Sample", "Date", "SourceGroup", "Source", "NrLibraries", "NrSequencings"],
  format: {
    "Date": (d) => d.substring(0, 10)
  }
}));
```

Selected ${selected_samples.length} samples.

## Library-Sequencing
```js 
const filter_cond_samples = selected_samples.length ? `WHERE Sa.Id IN (${selected_samples.map(s => s.Id)})` : "WHERE 1==2";
const qLibs = `SELECT
  L.Full_Library_Id      AS Library,
  L.Id                   AS Id,
  L.Experiment_Date      AS Date,
  Ea.sample              AS Eager,
  Ea.endog_endorspy_post AS endog,
  Ea.damage_5p1          AS damage,
  Ea.total_reads
FROM
            libraries AS L
  LEFT JOIN extracts  AS E  ON L.extract  = E.Id
  LEFT JOIN samples   AS Sa ON E.sample   = Sa.Id
  LEFT JOIN eager     AS Ea ON Ea.sample_clean LIKE CONCAT(L.Full_Library_Id, '.___')
  ${filter_cond_samples}`
const lib_table = sql([qLibs]);
```

```js
const selected_libs = view(Inputs.table(lib_table, {
  columns: ["Library", "Date", "Eager", "endog", "damage", "total_reads"],
  format: {
    "Date": (d) => d.substring(0, 10)
  }
}));
```

Showing ${lib_table.numRows} library-sequencings

## Sequencings
```js 
const filter_cond_samples = selected_libs.length ? `WHERE L.Id IN (${selected_libs.map(s => s.Id)})` : "WHERE 1==2";
const qSeqs = `SELECT
  Se.Full_Sequencing_Id       AS Sequencing,
  Se.Experiment_Date          AS Date,
  Ea.sample,
  Ea.fastqc_preTrim_total_seq
FROM
            sequencings       AS Se
  LEFT JOIN captures          AS C  ON Se.capture = C.Id
  LEFT JOIN libraries         AS L  ON C.library  = L.Id
  LEFT JOIN extracts          AS E  ON L.extract  = E.Id
  LEFT JOIN samples           AS Sa ON E.sample   = Sa.Id
  LEFT JOIN eager             AS Ea ON Ea.sample LIKE CONCAT(Se.Full_Sequencing_Id, '%')
  ${filter_cond_samples}`
const seq_table = sql([qSeqs]);
```

```js
const selected_seqs = view(Inputs.table(seq_table, {
  format: {
    "Date": (d) => d.substring(0, 10)
  }
}));
```

Showing ${seq_table.numRows} sequencings