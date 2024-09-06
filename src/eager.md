```js
import "npm:d3-dsv";
```

# Eager Results

```js
import * as eager from "./components/eager.js";
```

```js
const eagerTable = await eager.loadEagerTableProcessed();
const eagerSearched = view(Inputs.search(eagerTable, {placeholder: "Search Eager…"}));
```

Loaded eager results for ${eagerTable.length} samples.

```js
view(Inputs.table(eagerSearched))
```

## Raw

```js
const eagerTableRaw = await eager.loadEagerTableRaw();
const eagerRawSearched = view(Inputs.search(eagerTableRaw, {placeholder: "Search Eager…"}));
```
Loaded eager results for ${eagerTable.length} samples.

```js
view(Inputs.table(eagerRawSearched))
```

# Joined
```js
const eagerTableIndividuals = await eager.loadEagerIndividuals();
const eagerIndividuals = view(Inputs.search(eagerTableIndividuals, {placeholder: "Search Eager…"}));
```

```js
view(Inputs.table(eagerIndividuals))
```
