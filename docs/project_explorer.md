# Pandora dashboard for project MICROSCOPE

```js
const sql = FileAttachment("./data/pandora.json").json().then(json => DuckDBClient.sql(json));
```

```sql
SELECT * FROM individuals AS I LEFT JOIN sites AS S on I.site = S.Id WHERE S.Id IS NULL;
```

## Sites
```sql id=sites_table
SELECT
  FIRST(S.Id) AS Id, FIRST(S.Site_Id) AS Site_Id, FIRST(S.Name)   AS Site, FIRST(S.Country) AS Country,
  COUNT(I.Id) AS NrIndividuals,
  COUNT(Sa.Id)          AS NrSamples,   COUNT(E.Id)      AS NrExtracts,
  COUNT(L.Id)           AS NrLibraries, COUNT(C.Id)      AS NrCaptures,
  COUNT(Se.Id)          AS NrSequencings
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
const q = `SELECT
  FIRST(I.Full_Individual_Id)  AS Individual,
  FIRST(S.Name)         AS Site,        FIRST(S.Country) AS Country,
  COUNT(Sa.Id)          AS NrSamples,   COUNT(E.Id)      AS NrExtracts,
  COUNT(L.Id)           AS NrLibraries, COUNT(C.Id)      AS NrCaptures,
  COUNT(Se.Id)          AS NrSequencings
  FROM individuals      AS I
  LEFT JOIN sites       AS S  ON I.site        = S.Id
  LEFT JOIN samples     AS Sa ON Sa.Individual = I.Id
  LEFT JOIN extracts    AS E  ON E.Sample      = Sa.Id
  LEFT JOIN libraries   AS L  ON L.Extract     = E.Id
  LEFT JOIN captures    AS C  ON C.Library     = L.Id
  LEFT JOIN sequencings AS Se ON Se.Capture   = C.Id
  WHERE S.Id IN (${selected_sites_ids})
  GROUP BY I.Full_Individual_Id`
const ind_table = sql([q]);
```

```js
Inputs.table(ind_table)
```