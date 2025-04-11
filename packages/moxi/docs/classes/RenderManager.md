[**Moxi v0.1.0**](../README.md)

***

[Moxi](../globals.md) / RenderManager

# Class: RenderManager

Defined in: [render-manager.ts:3](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/render-manager.ts#L3)

## Constructors

### Constructor

> **new RenderManager**(`htmlRoot`, `renderer`): `RenderManager`

Defined in: [render-manager.ts:16](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/render-manager.ts#L16)

#### Parameters

##### htmlRoot

`HTMLElement`

##### renderer

`Renderer`

#### Returns

`RenderManager`

## Properties

### getRenderer()

> `static` **getRenderer**: (`options`) => `Promise`\<`Renderer`\<`HTMLCanvasElement`\>\>

Defined in: [render-manager.ts:4](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/render-manager.ts#L4)

#### Parameters

##### options

`Partial`\<`AutoDetectOptions`\>

#### Returns

`Promise`\<`Renderer`\<`HTMLCanvasElement`\>\>

***

### create()

> `static` **create**: (`htmlRoot`, `options`) => `Promise`\<`RenderManager`\>

Defined in: [render-manager.ts:8](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/render-manager.ts#L8)

#### Parameters

##### htmlRoot

`HTMLElement`

##### options

`Partial`\<`AutoDetectOptions`\>

#### Returns

`Promise`\<`RenderManager`\>

***

### htmlRoot

> **htmlRoot**: `HTMLElement`

Defined in: [render-manager.ts:12](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/render-manager.ts#L12)

***

### renderer

> **renderer**: `Renderer`

Defined in: [render-manager.ts:13](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/render-manager.ts#L13)

***

### fitToWindow

> **fitToWindow**: `boolean` = `false`

Defined in: [render-manager.ts:14](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/render-manager.ts#L14)

## Methods

### render()

> **render**(`stage`): `void`

Defined in: [render-manager.ts:25](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/render-manager.ts#L25)

#### Parameters

##### stage

`Container`

#### Returns

`void`

***

### onResize()

> **onResize**(): `void`

Defined in: [render-manager.ts:29](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/render-manager.ts#L29)

#### Returns

`void`
