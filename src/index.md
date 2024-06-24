# Pandora dashboard for project MICROSCOPE

```js
const sql = FileAttachment("./data/pandora.json").json().then(json => DuckDBClient.sql(json));
```

## Sites
```sql id=sites_table
SELECT
  FIRST(S.Id)           AS Id,
  FIRST(S.Site_Id)      AS Site_Id,
  FIRST(S.Name)         AS Site,
  FIRST(S.Country)      AS Country,
  COUNT(DISTINCT I.Id)  AS NrIndividuals,
  COUNT(DISTINCT Sa.Id) AS NrSamples,  
  COUNT(DISTINCT E.Id)  AS NrExtracts,
  COUNT(DISTINCT L.Id)  AS NrLibraries,
  COUNT(DISTINCT C.Id)  AS NrCaptures,
  COUNT(DISTINCT Se.Id) AS NrSequencings
  FROM individuals      AS I
  LEFT JOIN sites       AS S  ON I.site        = S.Id
  LEFT JOIN samples     AS Sa ON Sa.Individual = I.Id
  LEFT JOIN extracts    AS E  ON E.Sample      = Sa.Id
  LEFT JOIN libraries   AS L  ON L.Extract     = E.Id
  LEFT JOIN captures    AS C  ON C.Library     = L.Id
  LEFT JOIN sequencings AS Se ON Se.Capture   = C.Id
  GROUP BY S.Id
```

```js
const sites_searched = view(Inputs.search(sites_table, {placeholder: "Search sites…"}));
```

```js
const selected_sites = view(Inputs.table(sites_searched, {
  columns: ["Site_Id", "Site", "Country", "NrIndividuals", "NrSamples", "NrExtracts", "NrLibraries", "NrCaptures", "NrSequencings"]
}));
```

## Individuals
```js 
const filter_cond_sites = selected_sites.length ? `WHERE S.Id IN (${selected_sites.map(s => s.Id)})` : "WHERE 1==2";
const qInds = `SELECT
  FIRST(I.Full_Individual_Id) AS Individual,
  FIRST(I.Id)                 AS Id,
  FIRST(S.Name)               AS Site,
  FIRST(S.Country)            AS Country,
  COUNT(DISTINCT Sa.Id)       AS NrSamples, 
  COUNT(DISTINCT E.Id)        AS NrExtracts,
  COUNT(DISTINCT L.Id)        AS NrLibraries,
  COUNT(DISTINCT C.Id)        AS NrCaptures,
  COUNT(DISTINCT Se.Id)       AS NrSequencings
  FROM individuals            AS I
  LEFT JOIN sites             AS S  ON I.site        = S.Id
  LEFT JOIN samples           AS Sa ON Sa.Individual = I.Id
  LEFT JOIN extracts          AS E  ON E.Sample      = Sa.Id
  LEFT JOIN libraries         AS L  ON L.Extract     = E.Id
  LEFT JOIN captures          AS C  ON C.Library     = L.Id
  LEFT JOIN sequencings       AS Se ON Se.Capture    = C.Id
  ${filter_cond_sites}
  GROUP BY I.Full_Individual_Id`
const ind_table = sql([qInds]);
```

```js
const selected_individuals = view(Inputs.table(ind_table, {
  columns: ["Individual", "Site", "Country", "NrSamples", "NrExtracts", "NrLibraries", "NrCaptures", "NrSequencings"]
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
  COUNT(DISTINCT E.Id)      AS NrExtracts,
  COUNT(DISTINCT L.Id)      AS NrLibraries,
  COUNT(DISTINCT C.Id)      AS NrCaptures,
  COUNT(DISTINCT Se.Id)     AS NrSequencings
  FROM samples              AS Sa
  LEFT JOIN individuals     AS I   ON Sa.individual = I.Id
  LEFT JOIN sites           AS Si  ON I.site        = Si.Id
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
  columns: ["Sample", "Date", "SourceGroup", "Source", "NrExtracts", "NrLibraries", "NrCaptures", "NrSequencings"],
  format: {
    "Date": (d) => d.substring(0, 10)
  }
}));
```

Selected ${selected_samples.length} samples.

## Sequencings
```js 
const filter_cond_samples = selected_samples.length ? `WHERE Sa.Id IN (${selected_samples.map(s => s.Id)})` : "WHERE 1==2";
const qSeqs = `SELECT
  Se.Full_Sequencing_Id AS Sequencing,
  Se.Experiment_Date    AS Date,
  C.Name
  FROM sequencings      AS Se
  LEFT JOIN captures    AS C  ON Se.capture = C.Id
  LEFT JOIN libraries   AS L  ON C.library  = L.Id
  LEFT JOIN extracts    AS E  ON L.extract  = E.Id
  LEFT JOIN samples     AS Sa ON E.sample   = Sa.Id
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