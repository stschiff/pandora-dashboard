# Eager Results

```js
import {loadEagerTable} from "./components/eager.js";
```

```js
const eagerTable = await loadEagerTable();
```

Loaded eager results for ${eagerTable.length} samples.

```js
view(Inputs.table(eagerTable))
```


