# Parallax Space Shooter - Container Hierarchy

This document maps the complete scene container hierarchy for the parallax space shooter example (07-parallax-space-shooter.ts).

## Scene Tree

**Note:** Camera is NOT in the scene tree. It's a separate PIXI.Container with a reference to Scene that manipulates Scene's transform from outside.

```
Camera (PIXI.Container) ──references──> Scene
    │
    └── CameraLogic: Manipulates Scene.position and Scene.scale

PIXI.Application (renderer)
│
└── Scene (PIXI.Container)
    │   • position: (-cameraX, -cameraY)  [camera inverts to create "camera" effect]
    │   • scale: (cameraScaleX, cameraScaleY)  [zoom scales around origin (0,0)]
    │
    ├── ParallaxBackground (PIXI.Container)
    │   │   • position: (cameraX / sceneScale, cameraY / sceneScale)  [re-centers to viewport]
    │   │   • pivot: (0, 0)  [CRITICAL: DO NOT CHANGE]
    │   │   • inherits scene scale (zoom)
    │   │
    │   ├── TilingParallaxLayer #1 - Nebula (PIXI.Container)
    │   │   │   • scrollScale: (0.3, 0.3)  [moves at 30% camera speed]
    │   │   │   • position: (0, 0)  [layer container at origin]
    │   │   │
    │   │   └── TilingSprite (PIXI.TilingSprite)
    │   │       │   • width: rendererWidth / cameraScale
    │   │       │   • height: rendererHeight / cameraScale
    │   │       │   • pivot: (width/2, height/2)  [scales from center]
    │   │       │   • position: (width/2, height/2)  [centers the pivot]
    │   │       │   • tilePosition: (-scrollX, -scrollY)  [parallax scroll offset]
    │   │       │   • tileScale: (1, 1)
    │   │       │
    │   │       └── Texture: nebula.png (256x256 repeating)
    │   │
    │   └── TilingParallaxLayer #2 - Stars (PIXI.Container)
    │       │   • scrollScale: (0.6, 0.6)  [moves at 60% camera speed]
    │       │   • position: (0, 0)  [layer container at origin]
    │       │
    │       └── TilingSprite (PIXI.TilingSprite)
    │           │   • width: rendererWidth / cameraScale
    │           │   • height: rendererHeight / cameraScale
    │           │   • pivot: (width/2, height/2)  [scales from center]
    │           │   • position: (width/2, height/2)  [centers the pivot]
    │           │   • tilePosition: (-scrollX, -scrollY)  [parallax scroll offset]
    │           │   • tileScale: (0.5, 0.5)  [stars scaled 50%]
    │           │
    │           └── Texture: stars.png (256x256 repeating)
    │
    └── Ship (PIXI.Sprite)
        │   • position: (0, 0) initially, moves with arrow keys
        │   • scale: (0.5, 0.5)
        │   • Camera follows this object (keeps at viewport center)
        │
        └── Texture: playerShip1_blue.png (from spritesheet)
```

## Coordinate Spaces

**World Space:**
- Ship and scene entities live here
- Camera follows ship, keeping it at viewport center

**Parallax Space:**
- ParallaxBackground repositions to stay screen-aligned
- Inherits scene scale but breaks out of world positioning
- Each layer scrolls at different speed (scrollScale) for depth illusion

## Transform Flow

1. **Scene Transform:** Position = (-cameraX, -cameraY), Scale = (zoom, zoom) around origin (0,0)
2. **ParallaxBackground:** Repositions to (cameraX / zoom, cameraY / zoom) to stay screen-centered
3. **TilingSprite Sizing:** width/height = rendererSize / zoom (larger when zoomed out)
4. **TilingSprite Pivot:** Set to center (width/2, height/2) so it scales from viewport center
5. **Parallax Scrolling:** tilePosition = -(cameraPos * scrollScale) creates depth effect

## Known Issue

**Zoom Drift:** When zooming after movement, parallax layers shift because:
- Scene scales around (0,0) not the ship location (viewport center)
- When zoom changes, viewport "grows" outward from center
- ParallaxBackground repositioning doesn't compensate for this expansion
- Result: Layers drift diagonally when zooming after the ship has moved
