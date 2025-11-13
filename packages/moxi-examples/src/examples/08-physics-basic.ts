/**
 * Example 08: Basic Physics
 * Demonstrates the MOXI physics system with Planck.js
 * Features: falling boxes, bouncing balls, sprite with collision shape, static ground
 */
import {
  setupMoxi,
  asPhysicsEntity,
  PhysicsMaterials,
  getPhysicsBody
} from 'moxi';
import { Graphics, Point, Sprite, Assets } from 'pixi.js';
import * as planck from 'planck';
import { ASSETS } from '../assets-config';

export async function initPhysicsBasic() {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('App element not found');

  // Setup with physics enabled
  const { scene, engine, physicsWorld } = await setupMoxi({
    hostElement: root,
    physics: {
      gravity: { x: 0, y: 9.8 },
      pixelsPerMeter: 30
    }
  });

  // Load spritesheet for meteor sprite
  const spaceShooter2Sheet = await Assets.load(ASSETS.SPACE_SHOOTER2_JSON);

  scene.renderer.background.color = 0x1a1a2e; // Dark blue/navy background

  // Enable debug renderer with bright, thick lines
  const debugRenderer = physicsWorld!.enableDebugRenderer(scene, {
    showShapes: true,
    showVelocities: false,
    showAABBs: false,
    showCenterOfMass: false,
    showContactPoints: false,
    colorStatic: 0x00FF00,      // Bright green for static
    colorDynamic: 0xFF00FF,     // Bright magenta for dynamic
    colorKinematic: 0x00FFFF,   // Cyan for kinematic
    colorSleeping: 0x666666,    // Gray for sleeping
    colorSensor: 0xFFFF00,      // Yellow for sensors
    alpha: 0.9,                 // More opaque
    lineWidth: 4                // Thicker lines
  });

  // Toggle debug view with 'P' key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') {
      debugRenderer.toggle();
      console.log(`Physics debug: ${debugRenderer.getVisible() ? 'ON' : 'OFF'}`);
    }
  });

  // Create ground platform (centered at origin to match physics shape)
  // Make it wide - 85% of screen width (1280px * 0.85 = 1088px)
  const groundWidth = 1088;
  const ground = new Graphics();
  ground.rect(-groundWidth / 2, -25, groundWidth, 50);
  ground.fill(0x8B4513); // Brown

  // Graphics collision shape is auto-extracted!
  const groundEntity = asPhysicsEntity(ground, physicsWorld!, {
    type: 'static',
    ...PhysicsMaterials.terrain,
    collisionTags: ['terrain']
  });
  groundEntity.x = 640; // Center horizontally (1280/2)
  groundEntity.y = 650;
  scene.addChild(groundEntity);

  // Create boxes
  const colors = [0xFF6B6B, 0x4ECDC4, 0xFFE66D, 0x95E1D3, 0xF38181];

  for (let i = 0; i < 5; i++) {
    const box = new Graphics();
    box.rect(-25, -25, 50, 50);
    box.fill(colors[i]);

    // Graphics collision shape is auto-extracted!
    const boxEntity = asPhysicsEntity(box, physicsWorld!, {
      type: 'dynamic',
      ...PhysicsMaterials.wood,
      collisionTags: ['object'],
      collidesWith: ['terrain', 'object']
    });

    boxEntity.x = 300 + i * 150;
    boxEntity.y = 100 + i * 50;
    scene.addChild(boxEntity);
  }

  // Create bouncy balls
  const ballEntities: any[] = [];
  for (let i = 0; i < 3; i++) {
    const ball = new Graphics();
    ball.circle(0, 0, 25);
    ball.fill(0xFF1493); // Deep pink

    // Graphics collision shape is auto-extracted!
    const ballEntity = asPhysicsEntity(ball, physicsWorld!, {
      type: 'dynamic',
      ...PhysicsMaterials.bouncy,
      collisionTags: ['object'],
      collidesWith: ['terrain', 'object']
    });

    ballEntity.x = 400 + i * 200;
    ballEntity.y = 50;
    scene.addChild(ballEntity);
    ballEntities.push(ballEntity);
  }

  // Create sprite with explicit collision shape (meteor)
  const meteorTexture = spaceShooter2Sheet.textures['spaceMeteors_001.png'];

  // Set pixel-perfect rendering to avoid texture bleeding
  meteorTexture.source.scaleMode = 'nearest';

  const meteor = new Sprite(meteorTexture);
  meteor.anchor.set(0.5);

  // Sprites require an explicit Graphics collision shape
  const meteorCollisionShape = new Graphics();
  meteorCollisionShape.circle(0, 0, 108); // Meteor is 215x211px, radius ~108

  const meteorEntity = asPhysicsEntity(meteor, physicsWorld!, {
    type: 'dynamic',
    collisionShape: meteorCollisionShape,
    ...PhysicsMaterials.bouncy,
    collisionTags: ['object'],
    collidesWith: ['terrain', 'object']
  });

  meteorEntity.x = 640; // Center of screen (1280/2)
  meteorEntity.y = 100; // Higher up so it drops
  scene.addChild(meteorEntity);

  // Mouse interaction - drag physics objects with MouseJoint
  const canvasElement = scene.renderer.canvas;

  // Drag state
  let mouseJoint: any = null; // planck.MouseJoint
  let groundBody: any = null; // Static body for joint anchor
  let mouseWorldPos: any = null; // Current mouse in world coords

  // Helper to convert screen to world coords
  const screenToWorld = (clientX: number, clientY: number) => {
    const rect = canvasElement.getBoundingClientRect();
    const scaleX = scene.renderer.width / rect.width;
    const scaleY = scene.renderer.height / rect.height;
    const pixelX = (clientX - rect.left) * scaleX;
    const pixelY = (clientY - rect.top) * scaleY;

    return physicsWorld!.toPhysicsPoint(new Point(pixelX, pixelY));
  };

  // Helper to find body under mouse (using AABB query)
  const findBodyAtPoint = (worldPoint: any): any => {
    let foundBody: any = null;
    const aabb = planck.AABB(
      planck.Vec2(worldPoint.x - 0.001, worldPoint.y - 0.001),
      planck.Vec2(worldPoint.x + 0.001, worldPoint.y + 0.001)
    );

    physicsWorld!.world.queryAABB(aabb, (fixture: any) => {
      const body = fixture.getBody();
      if (body.isDynamic() && fixture.testPoint(worldPoint)) {
        foundBody = body;
        return false; // Stop searching
      }
      return true;
    });

    return foundBody;
  };

  // Track mouse position
  canvasElement.addEventListener('mousemove', (e) => {
    mouseWorldPos = screenToWorld(e.clientX, e.clientY);

    // Update joint target if dragging
    if (mouseJoint && mouseWorldPos) {
      mouseJoint.setTarget(mouseWorldPos);
    }
  });

  // Mouse down - create MouseJoint
  canvasElement.addEventListener('mousedown', (e) => {
    const worldPoint = screenToWorld(e.clientX, e.clientY);
    const body = findBodyAtPoint(worldPoint);

    if (body) {
      // Create ground body if not exists
      if (!groundBody) {
        groundBody = physicsWorld!.world.createBody();
      }

      // Create MouseJoint at exact click point
      mouseJoint = physicsWorld!.world.createJoint(
        planck.MouseJoint({
          maxForce: 1000 * body.getMass(),
          frequencyHz: 5,
          dampingRatio: 0.7
        }, groundBody, body, worldPoint)
      );

      body.setAwake(true);
    }
  });

  // Mouse up - destroy joint or spawn box
  canvasElement.addEventListener('mouseup', (e) => {
    if (mouseJoint) {
      // Clean up joint
      physicsWorld!.world.destroyJoint(mouseJoint);
      mouseJoint = null;
    } else {
      // Spawn a box
      const worldPoint = screenToWorld(e.clientX, e.clientY);
      const pixelPoint = physicsWorld!.toPixelsPoint(worldPoint);

      const box = new Graphics();
      box.rect(-25, -25, 50, 50);
      box.fill(colors[Math.floor(Math.random() * colors.length)]);

      const boxEntity = asPhysicsEntity(box, physicsWorld!, {
        type: 'dynamic',
        ...PhysicsMaterials.wood,
        collisionTags: ['object'],
        collidesWith: ['terrain', 'object']
      });

      boxEntity.x = pixelPoint.x;
      boxEntity.y = pixelPoint.y;
      scene.addChild(boxEntity);
      boxEntity.moxiEntity.init(scene.renderer);
    }
  });

  // Initialize and start
  scene.init();
  engine.start();

  // Give balls a random impulse after initialization
  ballEntities.forEach((ballEntity) => {
    const body = getPhysicsBody(ballEntity);
    if (body) {
      body.applyImpulse(new Point(
        (Math.random() - 0.5) * 10,
        -Math.random() * 5
      ));
    }
  });

  // Give meteor a slight spin as it drops
  const meteorBody = getPhysicsBody(meteorEntity);
  if (meteorBody) {
    meteorBody.applyImpulse(new Point(2, 0)); // Slight horizontal drift
  }

  console.log('✅ Physics demo loaded!');
  console.log('   🖱️  Click and drag to move objects');
  console.log('   🖱️  Click empty space to spawn boxes');
  console.log('   ⌨️  Press P to toggle physics debug view');
  console.log('   📦 Watch the boxes, balls, and meteor interact with physics');
}
