[**Moxi v0.1.0**](../README.md)

***

[Moxi](../globals.md) / Behavior

# Class: `abstract` Behavior\<T\>

Defined in: [bahavior.ts:19](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/bahavior.ts#L19)

Base abstract class for all behaviors in the Moxi engine.
Behaviors are components that can be attached to entities to add functionality.

## Example

```typescript
class MyBehavior extends Behavior<Sprite> {
  update(entity: Sprite, deltaTime: number) {
    entity.rotation += deltaTime;
  }
}
```

## Type Parameters

### T

`T`

The type of entity this behavior can be attached to

## Constructors

### Constructor

> **new Behavior**\<`T`\>(): `Behavior`\<`T`\>

#### Returns

`Behavior`\<`T`\>

## Properties

### active

> **active**: `boolean` = `true`

Defined in: [bahavior.ts:24](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/bahavior.ts#L24)

Whether this behavior is currently active and should be updated

#### Default

```ts
true
```

## Methods

### init()

> **init**(`entity?`, `renderer?`, ...`args?`): `void`

Defined in: [bahavior.ts:32](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/bahavior.ts#L32)

Initializes the behavior with the entity it's attached to

#### Parameters

##### entity?

`T`

The entity this behavior is attached to

##### renderer?

`Renderer`\<`HTMLCanvasElement`\>

The PIXI renderer instance

##### args?

...`any`[]

Additional initialization arguments

#### Returns

`void`

***

### update()

> **update**(`entity?`, `deltaTime?`): `void`

Defined in: [bahavior.ts:41](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/bahavior.ts#L41)

Updates the behavior's state

#### Parameters

##### entity?

`T`

The entity this behavior is attached to

##### deltaTime?

`number`

Time elapsed since last update in seconds

#### Returns

`void`
