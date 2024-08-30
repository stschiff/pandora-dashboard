# Playground

```js
const db = await DuckDBClient.of({base: FileAttachment("./data/test_db.duckdb")});
```

```js
const res = await db.query(`SHOW ALL TABLES`);
// const res = await db.query("SHOW ALL TABLES");
view(Inputs.table(res));
```