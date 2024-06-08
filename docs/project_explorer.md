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
const selected_sites = view(Inputs.table(sites_searched));
```

## Individuals
```js 
const selected_sites_ids = selected_sites.map(s => s.Id)
const filter_cond = selected_sites.length ? `WHERE S.Id IN (${selected_sites_ids})` : "WHERE 1==2";
const q = `SELECT
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
  LEFT JOIN sequencings       AS Se ON Se.Capture   = C.Id
  ${filter_cond}
  GROUP BY I.Full_Individual_Id`
const ind_table = sql([q]);
```

```js
const selected_individuals = view(Inputs.table(ind_table));
```

## Samples
```js 
const selected_individual_ids = selected_individuals.map(i => i.Id);
const filter_cond = selected_individuals.length ? `WHERE I.Id IN (${selected_individual_ids})` : "WHERE 1==2";
const q = `SELECT
  FIRST(Sa.Full_Sample_Id)  AS Sample,
  FIRST(Sa.Experiment_Date) AS Date,
  FIRST(Sa.TypeGroup)            AS SourceGroup,
  FIRST(Sa.Type)            AS Source,
  COUNT(DISTINCT E.Id)      AS NrExtracts,
  COUNT(DISTINCT L.Id)      AS NrLibraries,
  COUNT(DISTINCT C.Id)      AS NrCaptures,
  COUNT(DISTINCT Se.Id)     AS NrSequencings
  FROM samples              AS Sa
  LEFT JOIN individuals     AS I  ON Sa.individual = I.Id
  LEFT JOIN sites           AS Si  ON I.site        = Si.Id
  LEFT JOIN extracts        AS E  ON E.Sample      = Sa.Id
  LEFT JOIN libraries       AS L  ON L.Extract     = E.Id
  LEFT JOIN captures        AS C  ON C.Library     = L.Id
  LEFT JOIN sequencings     AS Se ON Se.Capture   = C.Id
  ${filter_cond}
  GROUP BY Sa.Full_Sample_Id`
const sample_table = sql([q]);
```

```js
Inputs.table(sample_table)
```
