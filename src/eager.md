# Eager Results

```js
const eager = await FileAttachment("./data/eager.tsv").zip();
const eager_tables = await Promise.all(eager.filenames.map(async fn => {
    const batch_name = fn.split("/")[6];
    const tab = await eager.file(fn).tsv();
    return tab.map(row => Object.assign({batch_name: batch_name}, row));
}));
const eager_table = eager_tables.reduce((acc, curr) => acc.concat(curr), []);
```

Loaded eager results for ${eager_table.length} samples.

```js
view(Inputs.table(eager_table))
```


