# Playground

```js
const db = await DuckDBClient.of({base: FileAttachment("./data/pandora_eager.duckdb")});
```

```js
const res = await db.query(`SELECT * FROM base.testTable`);
// const res = await db.query("SHOW ALL TABLES");
view(Inputs.table(res));
```