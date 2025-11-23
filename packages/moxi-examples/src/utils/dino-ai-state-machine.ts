import { StateLogic, StateMachine } from 'moxi';
import * as PIXI from 'pixi.js';
import { RadarLogic } from '../examples/behavior-logic/radar-logic';
import { FollowTargetLogic } from '../examples/behavior-logic/follow-target-logic';
import { FleeFromTargetLogic } from '../examples/behavior-logic/flee-from-target-logic';
import { WanderLogic } from '../examples/behavior-logic/wander-logic';
import { PatrolLogic } from '../examples/behavior-logic/patrol-logic';
import { DinoAnimationLogic } from '../examples/behavior-logic/dino-animation-logic';

/**
 * Idle State - Entity stays still, watching for targets
 */
export class IdleState extends StateLogic {
  private radar: RadarLogic;

  constructor(radar: RadarLogic) {
    super('Idle');
    this.radar = radar;
  }

  onEnter(state: string) {
    // Could add idle animation trigger here
  }

  update(entity: PIXI.Container, deltaTime: number) {
    // Idle state just monitors radar
    // State transitions handled by the state machine logic
  }
}

/**
 * Patrol State - Entity follows waypoints
 */
export class PatrolState extends StateLogic {
  private patrol: PatrolLogic;
  private radar: RadarLogic;

  constructor(patrol: PatrolLogic, radar: RadarLogic) {
    super('Patrol');
    this.patrol = patrol;
    this.radar = radar;
  }

  onEnter(state: string) {
    this.patrol.resume();
  }

  onExit(state: string) {
    this.patrol.pause();
  }

  update(entity: PIXI.Container, deltaTime: number) {
    // Patrol logic handles the actual movement
    this.patrol.update(entity, deltaTime);
  }
}

/**
 * Chase State - Entity follows a target
 */
export class ChaseState extends StateLogic {
  private follow: FollowTargetLogic;
  private radar: RadarLogic;

  constructor(follow: FollowTargetLogic, radar: RadarLogic) {
    super('Chase');
    this.follow = follow;
    this.radar = radar;
  }

  onEnter(state: string) {
    // Set target from radar detections
    const closest = this.radar.getClosestEntity();
    if (closest) {
      this.follow.setTarget(closest);
    }
  }

  onExit(state: string) {
    this.follow.setTarget(null);
  }

  update(entity: PIXI.Container, deltaTime: number) {
    // Update target from radar (in case it changes)
    const closest = this.radar.getClosestEntity();
    if (closest && closest !== this.follow.getTarget()) {
      this.follow.setTarget(closest);
    }

    // Follow logic handles the actual movement
    this.follow.update(entity, deltaTime);
  }
}

/**
 * Flee State - Entity runs away from target
 */
export class FleeState extends StateLogic {
  private flee: FleeFromTargetLogic;
  private radar: RadarLogic;

  constructor(flee: FleeFromTargetLogic, radar: RadarLogic) {
    super('Flee');
    this.flee = flee;
    this.radar = radar;
  }

  onEnter(state: string) {
    // Set target from radar detections
    const closest = this.radar.getClosestEntity();
    if (closest) {
      this.flee.setTarget(closest);
    }
  }

  onExit(state: string) {
    this.flee.setTarget(null);
  }

  update(entity: PIXI.Container, deltaTime: number) {
    // Update target from radar
    const closest = this.radar.getClosestEntity();
    if (closest && closest !== this.flee.getTarget()) {
      this.flee.setTarget(closest);
    }

    // Flee logic handles the actual movement
    this.flee.update(entity, deltaTime);
  }
}

/**
 * Wander State - Entity wanders randomly
 */
export class WanderState extends StateLogic {
  private wander: WanderLogic;
  private radar: RadarLogic;
  private animLogic?: DinoAnimationLogic;

  constructor(wander: WanderLogic, radar: RadarLogic, animLogic?: DinoAnimationLogic) {
    super('Wander');
    this.wander = wander;
    this.radar = radar;
    this.animLogic = animLogic;
  }

  onEnter(state: string) {
    this.wander.resume(this.entity);
    // Use sneak animation for wandering
    if (this.animLogic) {
      this.animLogic.playAnimation('sneak');
    }
  }

  onExit(state: string) {
    this.wander.pause();
  }

  update(entity: PIXI.Container, deltaTime: number) {
    // Wander logic handles the actual movement
    this.wander.update(entity, deltaTime);
  }
}

/**
 * Attack State - Entity attacks target
 */
export class AttackState extends StateLogic {
  private radar: RadarLogic;
  private target: PIXI.Container | null = null;
  private animLogic?: DinoAnimationLogic;

  constructor(radar: RadarLogic, animLogic?: DinoAnimationLogic) {
    super('Attack');
    this.radar = radar;
    this.animLogic = animLogic;
  }

  onEnter(state: string) {
    this.target = this.radar.getClosestEntity();
    // Play attack/kick animation
    if (this.animLogic) {
      this.animLogic.playAnimation('attack');
    }
  }

  onExit(state: string) {
    this.target = null;
  }

  update(entity: PIXI.Container, deltaTime: number) {
    // Attack animation/logic would go here
    // Animation logic handles the attack animation display
  }
}

/**
 * Configuration for Dino AI behavior
 */
export interface DinoAIConfig {
  /**
   * Initial state name
   */
  initialState: string;

  /**
   * Detection range for radar
   */
  detectionRadius: number;

  /**
   * Chase range - distance within which dino starts chasing
   */
  chaseRange?: number;

  /**
   * Attack range - distance within which dino attacks
   */
  attackRange?: number;

  /**
   * Flee range - distance within which dino flees
   */
  fleeRange?: number;

  /**
   * Movement speed
   */
  speed: number;

  /**
   * Target filter for radar (e.g., only detect players)
   */
  targetFilter?: (entity: PIXI.Container) => boolean;

  /**
   * Patrol waypoints (if using patrol behavior)
   */
  patrolWaypoints?: PIXI.Point[];

  /**
   * Whether to enable debug visualization
   */
  debugDraw?: boolean;
}

/**
 * DinoAIStateMachine - Complete AI system for dino behaviors
 *
 * Manages state transitions based on radar detection and configured behavior.
 * Combines RadarLogic with movement logic and state-based decision making.
 *
 * @example
 * ```typescript
 * // Chase behavior (like Doux)
 * const chaseAI = DinoAIStateMachine.createChaseAI({
 *   detectionRadius: 200,
 *   chaseRange: 200,
 *   speed: 1.5,
 *   targetFilter: (e) => e.name === 'player'
 * });
 * dinoEntity.moxiEntity.addLogic(chaseAI);
 *
 * // Flee behavior (like Mort)
 * const fleeAI = DinoAIStateMachine.createFleeAI({
 *   detectionRadius: 150,
 *   fleeRange: 150,
 *   speed: 2.0,
 *   targetFilter: (e) => e.name === 'player'
 * });
 * ```
 */
export class DinoAIStateMachine extends StateLogic {
  private stateMachine: StateMachine;
  private radar: RadarLogic;
  private config: DinoAIConfig;
  private animLogic?: DinoAnimationLogic;

  // Movement logic components
  private followLogic?: FollowTargetLogic;
  private fleeLogic?: FleeFromTargetLogic;
  private wanderLogic?: WanderLogic;
  private patrolLogic?: PatrolLogic;

  constructor(config: DinoAIConfig, animLogic?: DinoAnimationLogic) {
    super('DinoAI');
    this.config = config;
    this.animLogic = animLogic;

    // Create radar
    this.radar = new RadarLogic({
      radius: config.detectionRadius,
      updateInterval: 100,
      filter: config.targetFilter,
      debugDraw: config.debugDraw ?? false
    });

    // Create state machine
    this.stateMachine = new StateMachine();
  }

  init(entity: PIXI.Container, renderer: PIXI.Renderer) {
    super.init(entity, renderer);

    // Initialize radar
    this.radar.init(entity, renderer);

    // Setup states based on config
    this.setupStates(entity, renderer);

    // Set initial state
    this.stateMachine.setState(this.config.initialState);
  }

  private setupStates(entity: PIXI.Container, renderer: PIXI.Renderer) {
    // Create movement logic components as needed

    // Follow logic for chase behavior
    if (this.config.chaseRange !== undefined) {
      this.followLogic = new FollowTargetLogic({
        speed: this.config.speed,
        stopDistance: this.config.attackRange ?? 30,
        smoothing: 0.1
      });
      this.followLogic.init(entity, renderer);

      const chaseState = new ChaseState(this.followLogic, this.radar);
      chaseState.init(entity, renderer);
      this.stateMachine.addState(chaseState);
    }

    // Flee logic for flee behavior
    if (this.config.fleeRange !== undefined) {
      this.fleeLogic = new FleeFromTargetLogic({
        speed: this.config.speed,
        fleeDistance: this.config.fleeRange,
        safeDistance: this.config.fleeRange * 2,
        panicFactor: 0.2
      });
      this.fleeLogic.init(entity, renderer);

      const fleeState = new FleeState(this.fleeLogic, this.radar);
      fleeState.init(entity, renderer);
      this.stateMachine.addState(fleeState);
    }

    // Wander logic
    this.wanderLogic = new WanderLogic({
      speed: this.config.speed * 0.5, // Wander slower than active movement
      changeDirectionInterval: 3000,
      pauseProbability: 0.3,
      maxWanderDistance: 150
    });
    this.wanderLogic.init(entity, renderer);

    const wanderState = new WanderState(this.wanderLogic, this.radar, this.animLogic);
    wanderState.init(entity, renderer);
    this.stateMachine.addState(wanderState);

    // Patrol logic (if waypoints provided)
    if (this.config.patrolWaypoints && this.config.patrolWaypoints.length > 0) {
      this.patrolLogic = new PatrolLogic({
        speed: this.config.speed,
        waypoints: this.config.patrolWaypoints,
        patrolMode: 'loop',
        pauseAtWaypoint: 500
      });
      this.patrolLogic.init(entity, renderer);

      const patrolState = new PatrolState(this.patrolLogic, this.radar);
      patrolState.init(entity, renderer);
      this.stateMachine.addState(patrolState);
    }

    // Idle state
    const idleState = new IdleState(this.radar);
    idleState.init(entity, renderer);
    this.stateMachine.addState(idleState);

    // Attack state
    const attackState = new AttackState(this.radar, this.animLogic);
    attackState.init(entity, renderer);
    this.stateMachine.addState(attackState);
  }

  update(entity: PIXI.Container, deltaTime: number) {
    // Update radar
    this.radar.update(entity, deltaTime);

    // Decide state transitions based on radar and behavior
    this.updateStateTransitions(entity);

    // Update current state
    this.stateMachine.update(deltaTime);
  }

  private updateStateTransitions(entity: PIXI.Container) {
    const hasDetections = this.radar.hasDetections();
    const currentState = this.stateMachine.currentState;

    // Chase behavior transitions
    if (this.config.chaseRange !== undefined) {
      if (hasDetections) {
        const closest = this.radar.getClosestEntity(entity);
        if (closest) {
          const distance = this.getDistance(entity.getGlobalPosition(), closest.getGlobalPosition());

          if (distance <= (this.config.attackRange ?? 30)) {
            if (currentState !== 'Attack') {
              this.stateMachine.setState('Attack');
            }
          } else if (distance <= this.config.chaseRange) {
            if (currentState !== 'Chase') {
              this.stateMachine.setState('Chase');
            }
          } else {
            if (currentState !== 'Idle' && currentState !== 'Wander' && currentState !== 'Patrol') {
              this.returnToDefaultState();
            }
          }
        }
      } else {
        if (currentState === 'Chase' || currentState === 'Attack') {
          this.returnToDefaultState();
        }
      }
    }

    // Flee behavior transitions
    if (this.config.fleeRange !== undefined) {
      if (hasDetections) {
        const closest = this.radar.getClosestEntity(entity);
        if (closest) {
          const distance = this.getDistance(entity.getGlobalPosition(), closest.getGlobalPosition());

          if (distance <= this.config.fleeRange) {
            if (currentState !== 'Flee') {
              this.stateMachine.setState('Flee');
            }
          } else {
            if (currentState === 'Flee') {
              this.returnToDefaultState();
            }
          }
        }
      } else {
        if (currentState === 'Flee') {
          this.returnToDefaultState();
        }
      }
    }
  }

  private returnToDefaultState() {
    // Return to patrol if available, otherwise wander
    if (this.config.patrolWaypoints && this.config.patrolWaypoints.length > 0) {
      this.stateMachine.setState('Patrol');
    } else {
      this.stateMachine.setState('Wander');
    }
  }

  private getDistance(p1: PIXI.Point, p2: PIXI.Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Get current AI state name
   */
  getCurrentState(): string | null {
    return this.stateMachine.currentState;
  }

  /**
   * Get radar component
   */
  getRadar(): RadarLogic {
    return this.radar;
  }

  // Factory methods for common AI behaviors

  /**
   * Create a chase/follow AI (like Doux)
   */
  static createChaseAI(config: Partial<DinoAIConfig> & { speed: number }, animLogic?: DinoAnimationLogic): DinoAIStateMachine {
    return new DinoAIStateMachine({
      initialState: 'Wander',
      detectionRadius: config.detectionRadius ?? 200,
      chaseRange: config.chaseRange ?? 200,
      attackRange: config.attackRange ?? 30,
      speed: config.speed,
      targetFilter: config.targetFilter,
      debugDraw: config.debugDraw ?? false
    }, animLogic);
  }

  /**
   * Create a flee AI (like Mort)
   */
  static createFleeAI(config: Partial<DinoAIConfig> & { speed: number }, animLogic?: DinoAnimationLogic): DinoAIStateMachine {
    return new DinoAIStateMachine({
      initialState: 'Wander',
      detectionRadius: config.detectionRadius ?? 150,
      fleeRange: config.fleeRange ?? 150,
      speed: config.speed,
      targetFilter: config.targetFilter,
      debugDraw: config.debugDraw ?? false
    }, animLogic);
  }

  /**
   * Create a patrol AI (like Tard)
   */
  static createPatrolAI(
    config: Partial<DinoAIConfig> & { speed: number; patrolWaypoints: PIXI.Point[] },
    animLogic?: DinoAnimationLogic
  ): DinoAIStateMachine {
    return new DinoAIStateMachine({
      initialState: 'Patrol',
      detectionRadius: config.detectionRadius ?? 150,
      chaseRange: config.chaseRange ?? 100,
      attackRange: config.attackRange ?? 30,
      speed: config.speed,
      patrolWaypoints: config.patrolWaypoints,
      targetFilter: config.targetFilter,
      debugDraw: config.debugDraw ?? false
    }, animLogic);
  }

  /**
   * Create a wander/attack AI (like Vita)
   */
  static createWanderAttackAI(config: Partial<DinoAIConfig> & { speed: number }, animLogic?: DinoAnimationLogic): DinoAIStateMachine {
    return new DinoAIStateMachine({
      initialState: 'Wander',
      detectionRadius: config.detectionRadius ?? 100,
      chaseRange: config.chaseRange ?? 100,
      attackRange: config.attackRange ?? 40,
      speed: config.speed,
      targetFilter: config.targetFilter,
      debugDraw: config.debugDraw ?? false
    }, animLogic);
  }
}
