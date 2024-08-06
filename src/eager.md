```js
import "npm:d3-dsv";
```

# Eager Results

```js
import {loadEagerTable, loadEagerTableRaw} from "./components/eager.js";
```

```js
const eagerTable = await loadEagerTable();
const eagerTableRaw = await loadEagerTableRaw();
```

```js
const eagerSearched = view(Inputs.search(eagerTable, {placeholder: "Search Eager…"}));
```

Loaded eager results for ${eagerTable.length} samples.

```js
view(Inputs.table(eagerSearched))
```

## Raw

```js
const eagerRawSearched = view(Inputs.search(eagerTableRaw, {placeholder: "Search Eager…"}));
```
Loaded eager results for ${eagerTable.length} samples.

```js
view(Inputs.table(eagerRawSearched))
```
