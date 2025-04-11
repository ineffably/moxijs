[**Moxi v0.1.0**](../README.md)

***

[Moxi](../globals.md) / asEntity

# Function: asEntity()

> **asEntity**\<`T`\>(`entity`, `behaviors`): `AsEntity`\<`T`\>

Defined in: [moxi-entity.ts:213](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/moxi-entity.ts#L213)

Helper function to convert a PIXI Container into an AsEntity
This is the primary way to create entities in Moxi

## Type Parameters

### T

`T` *extends* `Container`\<`ContainerChild`\>

The type of container being converted

## Parameters

### entity

`T`

The PIXI Container to convert

### behaviors

`MoxiBehaviors`\<`T`\> = `{}`

Optional initial behaviors to attach

## Returns

`AsEntity`\<`T`\>

The enhanced container as an AsEntity

## Example

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
