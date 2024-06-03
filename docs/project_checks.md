# Project MICROSCOPE Checks

```js
const sql = FileAttachment("./data/pandora.json").json().then(json => DuckDBClient.sql(json));
```

Checking for individuals whose sites is not there:
```sql
SELECT * FROM individuals AS I LEFT JOIN sites AS S on I.site = S.Id WHERE S.Id IS NULL;
```
