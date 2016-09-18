# texture-atlas

[atlaspack](https://github.com/shama/atlaspack) rewritten in TypeScript with some API changes.

## API changes

Most of this API changes are meant to promote type consistency.

### Use ES6 module

```javascript

// Import module

// es6
import { Atlas } from 'texture-atlas';

// commonjs
const Atlas = require('texture-atlas').Atlas;

// Create an instance

const canvas = getCanvasElementSomehow();
const atlas = new Atlas(canvas);
```

### No factory function

Create an instance using `new` operator.

### `new Atlas(canvas[, options])`

- `canvas` *HTMLCanvasElement* A canvas element to store atlas.
- `options` *Object*
  - `tilepad` *Boolean* If true, each packed image pads itself with a tiled pattern of itself. Useful for avoiding texture bleeding when mipmapping.

### `Atlas#pack(id, drawable)`

- `id` *string* texture id. used by `Atlas#uv` and `Atlas#uv2`.
- `drawable *HTMLImageElement | HTMLCanvasElement* texture image.
- `Altas#pack` returns `null` on failure.

### `Atlas#expand(id, drawable)`

- `id` *string* texture id. used by `Atlas#uv` and `Atlas#uv2`.
- `drawable *HTMLImageElement | HTMLCanvasElement* texture image.
- `Altas#expand` does not return a new Atlas instance. It mutates the calling instance.

### `Atlas#uv`

- `Atlas#uv` does not receive any parameter. It uses `altas.canvas` width and height.

### `Atlas#uv2`

- `Atlas#uv2` returns uv in `Float32Array` format. (shape = [4,2], stride = [2,1])

```javascript
const uv1 = atlas.uv()['my_awesome_uv'];
const uv2 = atlas.uv2()['my_awesome_uv'];

assert(uv1[0][0] === uv2[0]);
assert(uv1[0][1] === uv2[1]);
assert(uv1[1][0] === uv2[2]);
assert(uv1[1][1] === uv2[3]);
assert(uv1[2][0] === uv2[4]);
assert(uv1[2][1] === uv2[5]);
assert(uv1[3][0] === uv2[6]);
assert(uv1[3][1] === uv2[7]);
```

### `Atlas#json`

- `Atlas#json` has been removed.

### `Atlas#_debug`

- `Atlas#_debug` has been moved into `utils` namespace.

```javascript
import { debug } from 'texture-atlas/lib/utils';

debug(atlas);
```

## install

```bash
$ npm install texture-atlas
```

## Development

### Test

```bash
$ npm test
```

### Build

```bash
$ npm run build
$ npm run build:watch
```

## License

MIT
