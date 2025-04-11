[**Moxi v0.1.0**](../README.md)

***

[Moxi](../globals.md) / ClientEvents

# Class: ClientEvents

Defined in: [client-events.ts:25](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/client-events.ts#L25)

Manages input events from the client (keyboard, mouse, etc.) and provides an interface
for querying the current input state.

Implements the Singleton pattern to ensure only one instance of event handlers exists.

## Example

```typescript
// Create/get the ClientEvents instance
const events = new ClientEvents();

// Check if a key is currently pressed
if (events.isKeyDown('ArrowRight')) {
  player.moveRight();
}

// Access mouse position
const mousePos = events.movePosition;
```

## Constructors

### Constructor

> **new ClientEvents**(`options`): `ClientEvents`

Defined in: [client-events.ts:100](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/client-events.ts#L100)

Creates a new ClientEvents instance or returns the existing singleton instance

#### Parameters

##### options

[`ClientEventsArgs`](../interfaces/ClientEventsArgs.md) = `{}`

Configuration options

#### Returns

`ClientEvents`

## Properties

### wheelDelta

> **wheelDelta**: `object`

Defined in: [client-events.ts:29](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/client-events.ts#L29)

Current wheel scroll delta values

#### yValue

> **yValue**: `number`

#### xValue

> **xValue**: `number`

***

### mouseUpEvent

> **mouseUpEvent**: `MouseEvent`

Defined in: [client-events.ts:34](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/client-events.ts#L34)

The most recent mouse up event

***

### mouseDownEvent

> **mouseDownEvent**: `MouseEvent`

Defined in: [client-events.ts:39](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/client-events.ts#L39)

The most recent mouse down event

***

### lastMouseDown

> **lastMouseDown**: `MouseEvent`

Defined in: [client-events.ts:44](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/client-events.ts#L44)

The last mouse down event that occurred

***

### lastMouseUp

> **lastMouseUp**: `MouseEvent`

Defined in: [client-events.ts:49](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/client-events.ts#L49)

The last mouse up event that occurred

***

### keyDownEvent

> **keyDownEvent**: `KeyboardEvent`

Defined in: [client-events.ts:54](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/client-events.ts#L54)

The most recent key down event

***

### keyUpEvent

> **keyUpEvent**: `KeyboardEvent`

Defined in: [client-events.ts:59](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/client-events.ts#L59)

The most recent key up event

***

### keydown

> **keydown**: `Record`\<`string`, `KeyboardEvent`\>

Defined in: [client-events.ts:65](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/client-events.ts#L65)

**`Internal`**

Map of currently pressed keys

***

### wheelOffets

> **wheelOffets**: `Point`

Defined in: [client-events.ts:70](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/client-events.ts#L70)

Accumulated wheel offset values

***

### movePosition

> **movePosition**: `Point`

Defined in: [client-events.ts:75](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/client-events.ts#L75)

Current mouse position

***

### lastMovePosition

> **lastMovePosition**: `Point`

Defined in: [client-events.ts:80](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/client-events.ts#L80)

Previous mouse position

***

### moveDelta

> **moveDelta**: `Point`

Defined in: [client-events.ts:85](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/client-events.ts#L85)

Change in mouse position since last update

***

### instance

> `static` **instance**: `ClientEvents` = `null`

Defined in: [client-events.ts:91](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/client-events.ts#L91)

Singleton instance of ClientEvents

#### Static

## Methods

### isKeyDown()

> **isKeyDown**(`key`): `boolean`

Defined in: [client-events.ts:183](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/client-events.ts#L183)

Checks if a specific key is currently pressed down

#### Parameters

##### key

`string`

The key to check, e.g., 'a', 'ArrowUp', 'Space'

#### Returns

`boolean`

True if the key is currently pressed, false otherwise

#### Example

```typescript
if (events.isKeyDown('Space')) {
  player.jump();
}
```

***

### isKeyUp()

> **isKeyUp**(`key`): `boolean`

Defined in: [client-events.ts:193](https://github.com/ineffably/moxi/blob/8bf1a7c4752644db238fd52faac0236b06bbbbd3/packages/moxi/src/client-events.ts#L193)

Checks if a specific key is currently not pressed

#### Parameters

##### key

`string`

The key to check, e.g., 'a', 'ArrowUp', 'Space'

#### Returns

`boolean`

True if the key is currently not pressed, false if it is pressed
