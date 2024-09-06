# Entities with open decisions or ToDos

```js
import { loadEagerTableProcessed, loadEagerIndividuals } from "./components/eager.js";
```

```js
const pandoraTables = await FileAttachment("./data/pandora.json").json();
const eagerTableProcessed = await loadEagerTableProcessed();
const eagerIndividuals = await loadEagerIndividuals();
Object.assign(pandoraTables, {eager: eagerTableProcessed, eagerIndividuals});
const sql = await DuckDBClient.sql(pandoraTables);
```

# Individuals without extracts

# Extracts without libraries

# Libraries without sequencing

# Sequencing without Eager

# Individuals who need additional sequencing