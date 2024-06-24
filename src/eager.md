# Eager Results

```js
import {loadEagerTable} from "./components/eager.js";
```

```js
const eagerTable = await loadEagerTable();
```

```js
const eagerSearched = view(Inputs.search(eagerTable, {placeholder: "Search Eager…"}));
```

Loaded eager results for ${eagerTable.length} samples.

```js
view(Inputs.table(eagerSearched))
```


