/**
 * Stacking Tower Physics Example
 * Drop shapes and try to build the tallest stable tower!
 * Features: Random shapes, height tracking, reset functionality
 */
import {
  setupMoxi,
  asPhysicsEntity,
  PhysicsMaterials,
  asGraphics,
  Logic,
  asEntity
} from '@moxijs/core';
import { Graphics, Text, TextStyle, Container, Renderer } from 'pixi.js';

export async function initStackingTower() {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('App element not found');

  const { scene, engine, physicsWorld } = await setupMoxi({
    hostElement: root,
    showLoadingScene: true,
    backgroundColor: 0x2c3e50,
    physics: {
      gravity: { x: 0, y: 9.8 },
      pixelsPerMeter: 30
    }
  });

  // Ground platform
  const groundWidth = 400;
  const ground = asGraphics();
  ground.rect(-groundWidth / 2, -20, groundWidth, 40);
  ground.fill(0x34495e);

  const groundEntity = asPhysicsEntity(ground, physicsWorld!, {
    type: 'static',
    ...PhysicsMaterials.terrain,
    collisionTags: ['terrain']
  });
  groundEntity.x = 640;
  groundEntity.y = 680;
  scene.addChild(groundEntity);

  // Side walls to keep blocks from falling off screen
  const createWall = (x: number) => {
    const wall = asGraphics();
    wall.rect(-10, -400, 20, 800);
    wall.fill(0x34495e);
    const wallEntity = asPhysicsEntity(wall, physicsWorld!, {
      type: 'static',
      ...PhysicsMaterials.terrain,
      collisionTags: ['terrain']
    });
    wallEntity.x = x;
    wallEntity.y = 400;
    scene.addChild(wallEntity);
  };
  createWall(100);  // Left wall
  createWall(1180); // Right wall

  // Track spawned blocks for cleanup
  const blocks: any[] = [];
  let highestY = 680; // Ground level
  let blockCount = 0;

  // Colors for blocks
  const colors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6, 0x1abc9c];

  // Shape creators
  const createBox = (width: number, height: number, color: number) => {
    const box = asGraphics();
    box.rect(-width / 2, -height / 2, width, height);
    box.fill(color);
    return box;
  };

  const createCircle = (radius: number, color: number) => {
    const circle = asGraphics();
    circle.circle(0, 0, radius);
    circle.fill(color);
    return circle;
  };

  // Spawn a random block at the top
  const spawnBlock = (x: number) => {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shapeType = Math.random();

    let shape: Graphics;
    if (shapeType < 0.5) {
      // Box - various sizes
      const width = 40 + Math.random() * 60;
      const height = 30 + Math.random() * 40;
      shape = createBox(width, height, color);
    } else if (shapeType < 0.8) {
      // Wide plank
      shape = createBox(80 + Math.random() * 40, 20, color);
    } else {
      // Circle
      shape = createCircle(20 + Math.random() * 15, color);
    }

    const blockEntity = asPhysicsEntity(shape, physicsWorld!, {
      type: 'dynamic',
      ...PhysicsMaterials.wood,
      collisionTags: ['block'],
      collidesWith: ['terrain', 'block']
    });

    blockEntity.x = x;
    blockEntity.y = 50;
    scene.addChild(blockEntity);
    blockEntity.moxiEntity.init(scene.renderer);
    blocks.push(blockEntity);
    blockCount++;
  };

  // UI - Height display
  const textStyle = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0xffffff,
    stroke: { color: 0x000000, width: 3 }
  });

  const heightText = new Text({ text: 'Height: 0', style: textStyle });
  heightText.x = 20;
  heightText.y = 20;
  scene.addChild(heightText);

  const blockText = new Text({ text: 'Blocks: 0', style: textStyle });
  blockText.x = 20;
  blockText.y = 50;
  scene.addChild(blockText);

  const instructionText = new Text({
    text: 'Click to drop blocks | R to reset',
    style: new TextStyle({
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xaaaaaa
    })
  });
  instructionText.x = 20;
  instructionText.y = 90;
  scene.addChild(instructionText);

  // Preview block that follows mouse
  const preview = asGraphics();
  preview.rect(-30, -20, 60, 40);
  preview.fill({ color: 0xffffff, alpha: 0.3 });
  preview.y = 50;
  scene.addChild(preview);

  // Mouse tracking for preview and spawning
  const canvasElement = scene.renderer.canvas;

  const getMouseX = (e: MouseEvent) => {
    const rect = canvasElement.getBoundingClientRect();
    const scaleX = scene.renderer.width / rect.width;
    return (e.clientX - rect.left) * scaleX;
  };

  canvasElement.addEventListener('mousemove', (e) => {
    const x = Math.max(150, Math.min(1130, getMouseX(e)));
    preview.x = x;
  });

  canvasElement.addEventListener('click', (e) => {
    const x = Math.max(150, Math.min(1130, getMouseX(e)));
    spawnBlock(x);
  });

  // Reset function
  const reset = () => {
    blocks.forEach(block => {
      if (block.parent) {
        block.parent.removeChild(block);
      }
    });
    blocks.length = 0;
    highestY = 680;
    blockCount = 0;
    heightText.text = 'Height: 0';
    blockText.text = 'Blocks: 0';
  };

  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
      reset();
    }
  });

  // Create a Logic component to track tower height
  class TowerTrackerLogic extends Logic<Container> {
    name = 'TowerTrackerLogic';

    update(entity: Container, deltaTime: number) {
      // Find highest block
      let newHighestY = 680;
      blocks.forEach(block => {
        if (block.y < newHighestY) {
          newHighestY = block.y;
        }
      });

      if (newHighestY < highestY) {
        highestY = newHighestY;
      }

      // Calculate height from ground
      const height = Math.max(0, Math.floor((680 - highestY) / 10));
      heightText.text = `Height: ${height}`;
      blockText.text = `Blocks: ${blockCount}`;
    }
  }

  // Add tracker to a container entity
  const tracker = asEntity(new Container());
  tracker.moxiEntity.addLogic(new TowerTrackerLogic());
  scene.addChild(tracker);

  scene.init();
  engine.start();

  console.log('Stacking Tower loaded!');
  console.log('   Click to drop blocks');
  console.log('   Press R to reset');
  console.log('   Try to build the tallest tower!');
}
