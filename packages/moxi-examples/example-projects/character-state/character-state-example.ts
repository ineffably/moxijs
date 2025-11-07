import { setupMoxi, asEntity, CameraLogic, asTextureFrames } from 'moxi';
import PIXI from 'pixi.js';

export const init = (async () => {
  const root = document.getElementById('app');

  // Configure the renderer with centered, scale-to-fit behavior
  const renderOptions = {
    width: 1280,
    height: 720,
    backgroundColor: 0x3a4466, // Dark blue background
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    antialias: false
  };

  // Get the Moxi setup with our custom renderer options
  const { scene, engine, loadAssets, camera, PIXIAssets } = await setupMoxi({
    hostElement: root,
    renderOptions
  });

  // Set up responsive scaling and centering of the game
  const resizeHandler = () => {
    // Get the parent dimensions
    const parentWidth = root.clientWidth;
    const parentHeight = root.clientHeight;

    // Maintain aspect ratio
    const ratio = Math.min(
      parentWidth / renderOptions.width,
      parentHeight / renderOptions.height
    );

    // Apply the styles to the root element
    root.style.display = 'flex';
    root.style.justifyContent = 'center';
    root.style.alignItems = 'center';
    root.style.overflow = 'hidden';

    // Update the canvas element
    if (root.firstElementChild) {
      const canvas = root.firstElementChild as HTMLCanvasElement;
      canvas.style.width = `${Math.round(renderOptions.width * ratio)}px`;
      canvas.style.height = `${Math.round(renderOptions.height * ratio)}px`;
      canvas.style.display = 'block';
      canvas.style.imageRendering = 'pixelated';
    }
  };

  // Set up initial size and add resize listener
  resizeHandler();
  window.addEventListener('resize', resizeHandler);

  // Load character spritesheet
  const assetList = [
    { src: './assets/sproutlands/characters/basic-spritesheet.png', alias: 'character_sheet' },
  ];

  await loadAssets(assetList);

  // Set up camera
  camera.desiredScale.set(3);

  // Get the character sheet texture
  const baseTexture = PIXIAssets.get<PIXI.TextureSource>('character_sheet');

  // Set the scale mode to nearest neighbor for better quality
  baseTexture.source.style.scaleMode = 'nearest';

  // Create texture frames from the character spritesheet
  const characterFrames = asTextureFrames(PIXI, baseTexture, {
    frameWidth: 48,
    frameHeight: 48,
    columns: 4,
    rows: 4
  });

  // Create UI text to display current state
  const stateText = new PIXI.Text({
    text: 'TextureFrameSequences Example',
    style: {
      fontFamily: 'Arial',
      fontSize: 18,
      fill: 0xffffff
    }
  });
  stateText.position.set(10, 10);

  // Create character sprite
  const character = new PIXI.AnimatedSprite(characterFrames);
  character.anchor.set(0.5);
  
  // Set up the idle animation (first two frames)
  character.textures = [characterFrames[0], characterFrames[1]];
  character.animationSpeed = 0.05;
  character.play();

  // Convert to Moxi entity
  const characterEntity = asEntity<PIXI.AnimatedSprite>(character);

  // Create UI container
  const uiContainer = new PIXI.Container();
  uiContainer.addChild(stateText);
  const uiEntity = asEntity(uiContainer);

  // Add character and UI to scene
  scene.addChild(characterEntity);
  scene.addChild(uiEntity);

  // Make camera follow the character
  const cameraLogic = camera.moxiEntity.getLogic<CameraLogic>('CameraLogic');
  cameraLogic.target = character;

  // Add instructions text
  const instructionsText = new PIXI.Text({
    text: 'A simple character animation example',
    style: {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xffffff
    }
  });
  instructionsText.position.set(10, 50);
  uiContainer.addChild(instructionsText);

  // Initialize and start
  scene.init();
  engine.start();
});

if((window as any).moxiedit) {
  init();
}
