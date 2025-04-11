[**Moxi v0.1.0**](../README.md)

***

[Moxi](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [index.ts:38](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/index.ts#L38)

## Type declaration

### loadFonts()

> **loadFonts**: () => `Promise`\<`unknown`\>

#### Returns

`Promise`\<`unknown`\>

### utils

> **utils**: [`utils`](../Moxi/namespaces/utils/README.md)

### PIXI

> **PIXI**: `__module`

### RenderManager

> **RenderManager**: *typeof* [`RenderManager`](../classes/RenderManager.md)

### asEntity()

> **asEntity**: \<`T`\>(`entity`, `behaviors`) => `AsEntity`\<`T`\>

Helper function to convert a PIXI Container into an AsEntity
This is the primary way to create entities in Moxi

#### Type Parameters

##### T

`T` *extends* `Container`\<`ContainerChild`\>

The type of container being converted

#### Parameters

##### entity

`T`

The PIXI Container to convert

##### behaviors

`MoxiBehaviors`\<`T`\> = `{}`

Optional initial behaviors to attach

#### Returns

`AsEntity`\<`T`\>

The enhanced container as an AsEntity

#### Example

```typescript
// Basic usage
const sprite = new PIXI.Sprite(texture);
const entitySprite = asEntity(sprite);
scene.addChild(entitySprite);

// With initial behaviors
const player = asEntity(
  new PIXI.Sprite(playerTexture),
  {
    'PlayerMovement': new PlayerMovementBehavior(),
    'Health': new HealthBehavior(100)
  }
);
```

### MoxiEntity

> **MoxiEntity**: *typeof* `MoxiEntity`

### Scene

> **Scene**: *typeof* [`Scene`](../classes/Scene.md)

### Engine

> **Engine**: *typeof* [`Engine`](../classes/Engine.md)

### ClientEvents

> **ClientEvents**: *typeof* [`ClientEvents`](../classes/ClientEvents.md)

### AssetLoader

> **AssetLoader**: *typeof* [`AssetLoader`](../classes/AssetLoader.md)

### Behavior

> **Behavior**: *typeof* [`Behavior`](../classes/Behavior.md)

### defaultRenderOptions

> **defaultRenderOptions**: `Partial`\<`AutoDetectOptions`\>

### prepMoxi()

> **prepMoxi**: (`__namedParameters`) => `Promise`\<\{ `scene`: [`Scene`](../classes/Scene.md); `engine`: [`Engine`](../classes/Engine.md); `PIXIAssets`: `AssetsClass`; `renderer`: `Renderer`\<`HTMLCanvasElement`\>; `loadAssets`: (`assets`) => `Promise`\<[`AssetLoader`](../classes/AssetLoader.md)\>; `camera`: [`Camera`](../classes/Camera.md); \}\>

#### Parameters

##### \_\_namedParameters

`PrepareArgs` = `...`

#### Returns

`Promise`\<\{ `scene`: [`Scene`](../classes/Scene.md); `engine`: [`Engine`](../classes/Engine.md); `PIXIAssets`: `AssetsClass`; `renderer`: `Renderer`\<`HTMLCanvasElement`\>; `loadAssets`: (`assets`) => `Promise`\<[`AssetLoader`](../classes/AssetLoader.md)\>; `camera`: [`Camera`](../classes/Camera.md); \}\>

### Camera

> **Camera**: *typeof* [`Camera`](../classes/Camera.md)

### CameraBehavior

> **CameraBehavior**: *typeof* `CameraBehavior`
