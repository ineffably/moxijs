[**Moxi v0.1.0**](../README.md)

***

[Moxi](../globals.md) / Camera

# Class: Camera

Defined in: [camera.ts:97](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/camera.ts#L97)

Camera entity for controlling the viewport and following game objects.
The Camera applies transformations to the scene to simulate camera movement.

## Implements

## Example

```typescript
// Make the camera follow a player entity
camera.moxiEntity.getBehavior<CameraBehavior>('CameraBehavior').target = player;

// Set the camera zoom level
camera.desiredScale.set(2, 2); // 2x zoom
```

## Extends

- `Container`

## Implements

- `AsEntity`\<`PIXI.Container`\>

## Constructors

### Constructor

> **new Camera**(`scene`, `renderer`, `behaviors`): `Camera`

Defined in: [camera.ts:137](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/camera.ts#L137)

Creates a new Camera instance

#### Parameters

##### scene

[`Scene`](Scene.md)

The scene being viewed by this camera

##### renderer

`Renderer`

The PIXI renderer

##### behaviors

`MoxiBehaviors`\<`Container`\<`ContainerChild`\>\> = `{}`

Additional behaviors to attach to this camera

#### Returns

`Camera`

#### Overrides

`PIXI.Container.constructor`

## Properties

### scene

> **scene**: [`Scene`](Scene.md)

Defined in: [camera.ts:101](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/camera.ts#L101)

Reference to the scene being viewed by this camera

***

### renderer

> **renderer**: `Renderer`

Defined in: [camera.ts:106](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/camera.ts#L106)

Reference to the renderer

***

### speed

> **speed**: `number` = `0.1`

Defined in: [camera.ts:112](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/camera.ts#L112)

Speed at which the camera transitions

#### Default

```ts
0.1
```

***

### moxiEntity

> **moxiEntity**: `MoxiEntity`\<`Container`\<`ContainerChild`\>\>

Defined in: [camera.ts:117](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/camera.ts#L117)

MoxiEntity reference as required by the AsEntity interface

#### Implementation of

`AsEntity.moxiEntity`

***

### desiredScale

> **desiredScale**: `Point`

Defined in: [camera.ts:123](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/camera.ts#L123)

The target scale (zoom) for the camera

#### Default

```ts
new Point(1, 1)
```

***

### desiredPosition

> **desiredPosition**: `Point`

Defined in: [camera.ts:129](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/camera.ts#L129)

The target position for the camera

#### Default

```ts
new Point(0, 0)
```
