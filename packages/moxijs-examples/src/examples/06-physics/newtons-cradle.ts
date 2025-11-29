/**
 * Newton's Cradle Physics Example
 * Classic momentum transfer demonstration with pendulum balls
 * Features: Distance joints, momentum conservation, click to pull balls
 */
import {
  setupMoxi,
  asPhysicsEntity,
  asGraphics,
  asText,
  getPhysicsBody,
  Logic,
  asEntity,
  ClientEvents
} from '@moxijs/core';
import { Graphics, Point, Container } from 'pixi.js';
import * as planck from 'planck';

export async function initNewtonsCradle() {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('App element not found');

  const { scene, engine, physicsWorld } = await setupMoxi({
    hostElement: root,
    showLoadingScene: true,
    backgroundColor: 0x1a1a2e,
    physics: {
      gravity: { x: 0, y: 20 }, // Stronger gravity for snappier pendulum motion
      pixelsPerMeter: 30
    }
  });

  // Enable debug renderer
  const debugRenderer = physicsWorld!.enableDebugRenderer(scene, {
    showShapes: true,
    showVelocities: false,
    showAABBs: false,
    showCenterOfMass: false,
    showContactPoints: true,
    colorStatic: 0x00FF00,
    colorDynamic: 0xFF00FF,
    alpha: 0.7,
    lineWidth: 2
  });

  // Setup input handling with ClientEvents
  const clientEvents = new ClientEvents({
    onAnyEvent: (ev) => {
      // Toggle debug view with 'P' key
      if (ev.eventType === 'keydown' && (ev.event as KeyboardEvent).key.toLowerCase() === 'p') {
        debugRenderer.toggle();
      }
    }
  });

  const centerX = 640;
  const anchorY = 150;
  const ropeLength = 250;
  const ballRadius = 30;
  const ballSpacing = ballRadius * 2 + 2; // Balls just touching
  const numBalls = 5;

  // Create the frame (visual only)
  const frame = asGraphics();
  // Top bar
  frame.rect(centerX - 150, anchorY - 20, 300, 15);
  // Left leg
  frame.rect(centerX - 150, anchorY - 20, 15, 350);
  // Right leg
  frame.rect(centerX + 135, anchorY - 20, 15, 350);
  // Base
  frame.rect(centerX - 160, anchorY + 315, 320, 20);
  frame.fill(0x4a4a4a);
  scene.addChild(frame);

  // Store ball entities for interaction
  const balls: any[] = [];
  const ropes: Graphics[] = [];
  const ballPositions: { x: number; y: number }[] = [];

  // Create balls (joints will be added after scene.init)
  const startX = centerX - ((numBalls - 1) * ballSpacing) / 2;

  for (let i = 0; i < numBalls; i++) {
    const ballX = startX + i * ballSpacing;
    const ballY = anchorY + ropeLength;
    ballPositions.push({ x: ballX, y: ballY });

    // Create ball graphic
    const ball = asGraphics();
    ball.circle(0, 0, ballRadius);
    ball.fill(0xc0c0c0); // Silver
    // Add shine effect
    ball.circle(-ballRadius * 0.3, -ballRadius * 0.3, ballRadius * 0.2);
    ball.fill(0xffffff);

    // Create explicit collision shape (the shine confuses auto-detection)
    const collisionShape = new Graphics();
    collisionShape.circle(0, 0, ballRadius);

    // Create physics entity with high restitution for elastic collisions
    const ballEntity = asPhysicsEntity(ball, physicsWorld!, {
      type: 'dynamic',
      collisionShape: collisionShape,
      density: 15, // Heavy steel balls
      friction: 0.0,
      restitution: 1.0, // Perfect elastic collision
      collisionTags: ['ball'],
      collidesWith: ['ball']
    });

    ballEntity.x = ballX;
    ballEntity.y = ballY;
    scene.addChild(ballEntity);
    balls.push(ballEntity);

    // Create rope visual (will be updated each frame)
    const rope = asGraphics();
    scene.addChild(rope);
    ropes.push(rope);
  }

  // Function to create joints (called after scene.init)
  const createJoints = () => {
    for (let i = 0; i < numBalls; i++) {
      const ballX = ballPositions[i].x;
      const ballEntity = balls[i];

      // Create anchor point (static body at top)
      const anchorBody = physicsWorld!.world.createBody({
        type: 'static',
        position: physicsWorld!.toPhysicsPoint(new Point(ballX, anchorY))
      });

      // Create distance joint (acts like a rope)
      const ballBodyLogic = getPhysicsBody(ballEntity);
      if (ballBodyLogic && ballBodyLogic.body) {
        const ballBody = ballBodyLogic.body;
        const ropeLengthMeters = physicsWorld!.toPhysics(ropeLength);

        physicsWorld!.world.createJoint(
          new planck.DistanceJoint({
            frequencyHz: 0, // Rigid distance (no spring)
            dampingRatio: 0,
            length: ropeLengthMeters
          }, anchorBody, ballBody,
            anchorBody.getPosition(),
            ballBody.getPosition()
          )
        );
      }
    }
  };

  // Mouse interaction - drag to pull balls
  const canvasElement = scene.renderer.canvas;
  let draggedBall: any = null;
  let mouseJoint: any = null;
  let groundBody: any = null;

  // Convert screen coordinates to canvas pixel coordinates
  const screenToPixel = (clientX: number, clientY: number): Point => {
    const rect = canvasElement.getBoundingClientRect();
    const scaleX = scene.renderer.width / rect.width;
    const scaleY = scene.renderer.height / rect.height;
    return new Point(
      (clientX - rect.left) * scaleX,
      (clientY - rect.top) * scaleY
    );
  };

  // Convert screen coordinates to physics world coordinates
  const screenToWorld = (clientX: number, clientY: number) => {
    return physicsWorld!.toPhysicsPoint(screenToPixel(clientX, clientY));
  };

  const findBallAtPixelPoint = (pixelPoint: Point): any => {
    let foundBall: any = null;

    // Use PhysicsWorld's queryPoint helper
    physicsWorld!.queryPoint(pixelPoint, (fixture) => {
      const body = fixture.getBody();
      if (body.isDynamic()) {
        // Find which ball entity this body belongs to
        for (const ball of balls) {
          const bodyLogic = getPhysicsBody(ball);
          if (bodyLogic && bodyLogic.body === body) {
            foundBall = ball;
            return false; // Stop searching
          }
        }
      }
      return true; // Continue searching
    });

    return foundBall;
  };

  canvasElement.addEventListener('mousedown', (e) => {
    const pixelPoint = screenToPixel(e.clientX, e.clientY);
    draggedBall = findBallAtPixelPoint(pixelPoint);

    if (draggedBall) {
      const bodyLogic = getPhysicsBody(draggedBall);
      if (bodyLogic) {
        const body = bodyLogic.body;
        if (!groundBody) {
          groundBody = physicsWorld!.world.createBody();
        }

        const worldPoint = physicsWorld!.toPhysicsPoint(pixelPoint);
        mouseJoint = physicsWorld!.world.createJoint(
          new planck.MouseJoint({
            maxForce: 5000 * body.getMass(),
            frequencyHz: 5,
            dampingRatio: 0.9
          }, groundBody, body, worldPoint)
        );
      }
    }
  });

  canvasElement.addEventListener('mousemove', (e) => {
    if (mouseJoint) {
      const worldPoint = screenToWorld(e.clientX, e.clientY);
      mouseJoint.setTarget(worldPoint);
    }
  });

  canvasElement.addEventListener('mouseup', () => {
    if (mouseJoint) {
      physicsWorld!.world.destroyJoint(mouseJoint);
      mouseJoint = null;
      draggedBall = null;
    }
  });

  // UI instructions
  const instructionText = asText({
    text: 'Click and drag the end balls to start the motion',
    style: { fontFamily: 'Arial', fontSize: 18, fill: 0xffffff }
  });
  instructionText.x = centerX - instructionText.width / 2;
  instructionText.y = 550;
  scene.addChild(instructionText);

  const tipText = asText({
    text: 'Tip: Pull one ball on the left or right side  |  Press P for debug view',
    style: { fontFamily: 'Arial', fontSize: 14, fill: 0x888888 }
  });
  tipText.x = centerX - tipText.width / 2;
  tipText.y = 580;
  scene.addChild(tipText);

  // Create a Logic component to update rope visuals
  class RopeUpdaterLogic extends Logic<Container> {
    name = 'RopeUpdaterLogic';

    update(entity: Container, deltaTime: number) {
      for (let i = 0; i < numBalls; i++) {
        const ball = balls[i];
        const rope = ropes[i];
        const anchorX = startX + i * ballSpacing;

        rope.clear();
        rope.moveTo(anchorX, anchorY);
        rope.lineTo(ball.x, ball.y);
        rope.stroke({ width: 2, color: 0x888888 });
      }
    }
  }

  // Add rope updater to a container entity
  const updater = asEntity(new Container());
  updater.moxiEntity.addLogic(new RopeUpdaterLogic());
  scene.addChild(updater);

  scene.init();

  // Create joints after scene init (physics bodies are now ready)
  createJoints();

  engine.start();

  // Give the first ball an initial push to demonstrate
  setTimeout(() => {
    const firstBall = balls[0];
    const body = getPhysicsBody(firstBall);
    if (body) {
      body.applyImpulse(new Point(-250, 0));
    }
  }, 500);

  console.log("Newton's Cradle loaded!");
  console.log('   Click and drag end balls to pull them');
  console.log('   Release to watch momentum transfer');
  console.log('   Press P to toggle physics debug view');
}
