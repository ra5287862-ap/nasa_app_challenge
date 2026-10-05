# 3D Models Directory (.glb / .gltf)

Place your `.glb` or `.gltf` 3D files inside this directory:
`public/models/`

### Example:
- Place your file as: `public/models/spacecraft.glb`
- Or: `public/models/astronaut.glb`
- Or: `public/models/model.glb`

### How it is referenced in code:
In Vite / TanStack Start, any file in `public/` is served directly from the root path:
- `public/models/spacecraft.glb` ➔ `/models/spacecraft.glb`
- `public/models/my-model.glb` ➔ `/models/my-model.glb`

You can also use the live 3D Model Explorer on the Home page to select or test your models!
