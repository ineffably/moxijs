/**
 * Example 16: Sprite Library
 * Browse all available sprites and textures loaded in the examples app
 */
import { setupMoxi, asEntity, UITextInput, UILabel, FlexContainer, FlexDirection, FlexAlign, UILayer, UIScrollContainer, EdgeInsets, UIComponent, asTextureFrames } from 'moxi-kit';
import { Sprite, Container, Graphics, BitmapText, Assets, BitmapFont } from 'pixi.js';
import * as PIXI from 'pixi.js';
import { ASSETS } from '../assets-config';

interface SpriteEntry {
  name: string;
  texture: any;
  category: string;
}

// Simple wrapper UIComponent for sprite cards container
class SpriteCardsContainer extends UIComponent {
  public container: Container; // Explicitly declare inherited property for TypeScript
  private cardsContainer: Container;
  private viewportWidth: number;

  constructor(viewportWidth: number) {
    super();
    this.viewportWidth = viewportWidth;
    this.cardsContainer = new Container();
    this.container.addChild(this.cardsContainer);
  }

  getCardsContainer(): Container {
    return this.cardsContainer;
  }

  measure() {
    // Calculate height from children, width is viewport width
    if (this.cardsContainer.children.length === 0) {
      return { width: this.viewportWidth, height: 0 };
    }
    
    let minY = Infinity;
    let maxY = -Infinity;
    
    this.cardsContainer.children.forEach(child => {
      const bounds = child.getBounds();
      minY = Math.min(minY, bounds.y);
      maxY = Math.max(maxY, bounds.y + bounds.height);
    });
    
    return {
      width: this.viewportWidth,
      height: Math.max(0, maxY - minY + 20) // Add padding at bottom
    };
  }

  layout(availableWidth: number, availableHeight: number) {
    // No-op, children are absolutely positioned
  }

  protected render(): void {
    // No-op, children are rendered directly
  }
}

export async function initSpriteLibrary() {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('App element not found');

  const { scene, engine, loadAssets, PIXIAssets } = await setupMoxi({ 
    hostElement: root,
    showLoadingScene: true
  });
  
  scene.renderer.background.color = 0x1a1a2e;

  // Load font for BitmapText
  await Assets.load(ASSETS.KENNEY_FUTURE_NARROW_FONT);
  
  // Install bitmap font
  BitmapFont.install({
    name: 'KenneyFutureNarrow',
    style: {
      fontFamily: 'Kenney Future Narrow',
      fontSize: 24,
      fill: 0xffffff
    }
  });

  // Load all spritesheets
  await loadAssets([
    { src: ASSETS.SPACE_SHOOTER_JSON, alias: 'space_shooter' },
    { src: ASSETS.SPACE_SHOOTER2_JSON, alias: 'space_shooter2' },
    { src: ASSETS.SPROUTLANDS_CHARACTER_JSON, alias: 'sproutlands_character' },
    { src: ASSETS.UIPACK_SPACE_JSON, alias: 'uipack_space' },
    { src: ASSETS.SQUARE_BUTTONS_JSON, alias: 'square_buttons' },
    { src: ASSETS.EMOJI_SPRITESHEET_JSON, alias: 'emoji_sheet' },
    { src: ASSETS.ROBOT_IDLE_JSON, alias: 'robot_idle' },
    { src: ASSETS.DINO_DOUX, alias: 'dino_doux' },
    { src: ASSETS.DINO_MORT, alias: 'dino_mort' },
    { src: ASSETS.DINO_TARD, alias: 'dino_tard' },
    { src: ASSETS.DINO_VITA, alias: 'dino_vita' },
    { src: ASSETS.GRASS_TILES, alias: 'grass_tiles' },
    { src: ASSETS.GRASS_BIOME_THINGS, alias: 'grass_biome_things' },
  ]);

  // Collect all sprites by category
  const spriteEntries: SpriteEntry[] = [];

  // Space Shooter series
  const spaceShooterSheet = PIXIAssets.get('space_shooter');
  const spaceShooter2Sheet = PIXIAssets.get('space_shooter2');
  if (spaceShooterSheet?.textures) {
    // Set scale mode to nearest for pixel art
    if (spaceShooterSheet.textureSource) {
      spaceShooterSheet.textureSource.scaleMode = 'nearest';
    }
    Object.keys(spaceShooterSheet.textures).forEach(name => {
      const texture = spaceShooterSheet.textures[name];
      texture.source.scaleMode = 'nearest';
      spriteEntries.push({
        name,
        texture,
        category: 'Space Shooter'
      });
    });
  }
  if (spaceShooter2Sheet?.textures) {
    // Set scale mode to nearest for pixel art
    if (spaceShooter2Sheet.textureSource) {
      spaceShooter2Sheet.textureSource.scaleMode = 'nearest';
    }
    Object.keys(spaceShooter2Sheet.textures).forEach(name => {
      const texture = spaceShooter2Sheet.textures[name];
      texture.source.scaleMode = 'nearest';
      spriteEntries.push({
        name,
        texture,
        category: 'Space Shooter 2'
      });
    });
  }

  // Sproutlands Character
  const sproutlandsSheet = PIXIAssets.get('sproutlands_character');
  if (sproutlandsSheet?.textures) {
    // Set scale mode to nearest for pixel art
    if (sproutlandsSheet.textureSource) {
      sproutlandsSheet.textureSource.scaleMode = 'nearest';
    }
    Object.keys(sproutlandsSheet.textures).forEach(name => {
      const texture = sproutlandsSheet.textures[name];
      texture.source.scaleMode = 'nearest';
      spriteEntries.push({
        name,
        texture,
        category: 'Sproutlands'
      });
    });
  }

  // UI Pack Space
  const uipackSheet = PIXIAssets.get('uipack_space');
  if (uipackSheet?.textures) {
    // Set scale mode to nearest for pixel art
    if (uipackSheet.textureSource) {
      uipackSheet.textureSource.scaleMode = 'nearest';
    }
    Object.keys(uipackSheet.textures).forEach(name => {
      const texture = uipackSheet.textures[name];
      texture.source.scaleMode = 'nearest';
      spriteEntries.push({
        name,
        texture,
        category: 'UI Pack Space'
      });
    });
  }

  // Square Buttons
  const squareButtonsSheet = PIXIAssets.get('square_buttons');
  if (squareButtonsSheet?.textures) {
    // Set scale mode to nearest for pixel art
    if (squareButtonsSheet.textureSource) {
      squareButtonsSheet.textureSource.scaleMode = 'nearest';
    }
    Object.keys(squareButtonsSheet.textures).forEach(name => {
      const texture = squareButtonsSheet.textures[name];
      texture.source.scaleMode = 'nearest';
      spriteEntries.push({
        name,
        texture,
        category: 'Square Buttons'
      });
    });
  }

  // Emoji Sheet
  const emojiSheet = PIXIAssets.get('emoji_sheet');
  if (emojiSheet?.textures) {
    // Set scale mode to nearest for pixel art
    if (emojiSheet.textureSource) {
      emojiSheet.textureSource.scaleMode = 'nearest';
    }
    Object.keys(emojiSheet.textures).forEach(name => {
      const texture = emojiSheet.textures[name];
      texture.source.scaleMode = 'nearest';
      spriteEntries.push({
        name,
        texture,
        category: 'Emojis'
      });
    });
  }

  // Robot Idle
  const robotSheet = PIXIAssets.get('robot_idle');
  if (robotSheet?.textures) {
    // Set scale mode to nearest for pixel art
    if (robotSheet.textureSource) {
      robotSheet.textureSource.scaleMode = 'nearest';
    }
    Object.keys(robotSheet.textures).forEach(name => {
      const texture = robotSheet.textures[name];
      texture.source.scaleMode = 'nearest';
      spriteEntries.push({
        name,
        texture,
        category: 'Robot'
      });
    });
  }

  // Dino sprites (extract frames from texture sheets)
  const dinoNames = ['dino_doux', 'dino_mort', 'dino_tard', 'dino_vita'];
  for (const dinoAlias of dinoNames) {
    const dinoTexture = PIXIAssets.get<PIXI.TextureSource>(dinoAlias);
    if (dinoTexture) {
      // Set scale mode to nearest neighbor for pixel art
      dinoTexture.source.scaleMode = 'nearest';
      
      // Extract frames (24x24 pixels, 24 frames in a row)
      const dinoFrames = asTextureFrames(PIXI, dinoTexture, {
        frameWidth: 24,
        frameHeight: 24,
        columns: 24,
        rows: 1
      });
      
      // Add each frame to sprite entries
      dinoFrames.forEach((frame, index) => {
        frame.source.scaleMode = 'nearest';
        spriteEntries.push({
          name: `${dinoAlias.replace('dino_', '')}_frame_${index}`,
          texture: frame,
          category: 'Dino'
        });
      });
    }
  }

  // Grass Tiles (extract frames from texture sheet)
  const grassTilesTexture = PIXIAssets.get<PIXI.TextureSource>('grass_tiles');
  if (grassTilesTexture) {
    grassTilesTexture.source.scaleMode = 'nearest';
    
    // Extract frames (16x16 pixels, 11 columns x 7 rows)
    const grassFrames = asTextureFrames(PIXI, grassTilesTexture, {
      frameWidth: 16,
      frameHeight: 16,
      columns: 11,
      rows: 7
    });
    
    // Add each frame to sprite entries
    grassFrames.forEach((frame, index) => {
      frame.source.scaleMode = 'nearest';
      spriteEntries.push({
        name: `grass_tile_${index}`,
        texture: frame,
        category: 'Grass Tiles'
      });
    });
  }

  // Grass Biome Things (trees, bushes, etc.) - extract frames from texture sheet
  const grassBiomeTexture = PIXIAssets.get<PIXI.TextureSource>('grass_biome_things');
  if (grassBiomeTexture) {
    grassBiomeTexture.source.scaleMode = 'nearest';
    
    // Extract frames (16x16 pixels, 9 columns x 5 rows)
    const biomeFrames = asTextureFrames(PIXI, grassBiomeTexture, {
      frameWidth: 16,
      frameHeight: 16,
      columns: 9,
      rows: 5
    });
    
    // Add each frame to sprite entries
    biomeFrames.forEach((frame, index) => {
      frame.source.scaleMode = 'nearest';
      spriteEntries.push({
        name: `grass_biome_thing_${index}`,
        texture: frame,
        category: 'Grass Biome Things'
      });
    });
  }

  console.log(`✅ Loaded ${spriteEntries.length} sprites from ${new Set(spriteEntries.map(s => s.category)).size} categories`);

  // Create UI layer for search
  const uiLayer = new UILayer({ targetWidth: scene.renderer.width, targetHeight: scene.renderer.height });
  scene.addChild(uiLayer);

  let searchQuery = '';
  let renderSpritesFn: () => void;
  
  const searchLabel = new UILabel({
    text: 'Search your sprite library.',
    fontSize: 18,
    color: 0xffffff,
    fontWeight: 'normal'
  });

  const searchInput = new UITextInput({
    placeholder: 'Search sprites by name...',
    width: 400,
    height: 40,
    fontSize: 14,
    backgroundColor: 0x2a2a2a,
    textColor: 0xffffff,
    placeholderColor: 0x666666,
    onChange: (value) => {
      searchQuery = value.toLowerCase();
      renderSpritesFn();
    }
  });

  const searchContainer = new FlexContainer({
    direction: FlexDirection.Row,
    align: FlexAlign.Center,
    gap: 15,
    width: scene.renderer.width
  });
  searchContainer.addChild(searchInput);
  searchContainer.addChild(searchLabel);
  searchInput.tabIndex = 0;
  
  // Layout the container
  searchContainer.layout(scene.renderer.width, scene.renderer.height);
  searchContainer.container.x = 20;
  searchContainer.container.y = 20;
  
  uiLayer.addChild(searchContainer.container);

  // Create preview window
  const previewSize = 300;
  const previewWindow = new Container();
  previewWindow.visible = false;
  
  // Preview box (background) - contains the entire preview area
  const previewBox = new Graphics();
  previewBox.rect(0, 0, previewSize, previewSize);
  previewBox.fill({ color: 0x1a1a2e, alpha: 0.85 });
  previewBox.stroke({ color: 0x00d4ff, width: 2 });
  previewWindow.addChild(previewBox);
  
  // Preview sprite container (for zoom/pan)
  const previewSpriteContainer = new Container();
  previewSpriteContainer.x = previewSize / 2;
  previewSpriteContainer.y = previewSize / 2;
  previewWindow.addChild(previewSpriteContainer);
  
  // Preview sprite
  let previewSprite: Sprite | null = null;
  
  // Preview scale label
  const previewScaleLabel = new BitmapText({
    text: 'scale: 1.000',
    style: {
      fontFamily: 'KenneyFutureNarrow',
      fontSize: 14
    }
  });
  previewScaleLabel.tint = 0xffff00;
  previewScaleLabel.x = 10;
  previewScaleLabel.y = 10;
  previewWindow.addChild(previewScaleLabel);
  
  // Preview state
  let currentHoveredEntry: SpriteEntry | null = null;
  let previewZoom = 1;
  let previewPanX = 0;
  let previewPanY = 0;
  
  // Add preview window to scene (after scroll container so it appears on top)
  // We'll add it after the scroll container is added
  
  // Update preview position based on card position (top-left or top-right)
  function updatePreviewPosition(cardX: number) {
    const viewportWidth = scene.renderer.width;
    const isLeft = cardX < viewportWidth / 2;
    
    if (isLeft) {
      // Card on left side, preview in top-right
      previewWindow.x = viewportWidth - previewSize - 20;
      previewWindow.y = 20;
    } else {
      // Card on right side, preview in top-left
      previewWindow.x = 20;
      previewWindow.y = 20;
    }
  }
  
  // Update preview sprite
  function updatePreviewSprite(entry: SpriteEntry | null) {
    if (previewSprite) {
      previewSpriteContainer.removeChild(previewSprite);
      previewSprite.destroy();
      previewSprite = null;
    }
    
    if (entry) {
      previewSprite = new Sprite(entry.texture);
      previewSprite.anchor.set(0.5);
      previewSpriteContainer.addChild(previewSprite);
      // Keep zoom level, but reset pan when switching sprites
      previewPanX = 0;
      previewPanY = 0;
      updatePreviewTransform();
    }
  }
  
  // Update preview transform (zoom and pan)
  function updatePreviewTransform() {
    if (previewSprite) {
      previewSprite.scale.set(previewZoom);
      previewSpriteContainer.x = previewSize / 2 + previewPanX;
      previewSpriteContainer.y = previewSize / 2 + previewPanY;
      
      // Update scale label
      previewScaleLabel.text = `scale: ${previewZoom.toFixed(3)}`;
    }
  }
  
  // Handle mouse wheel for zoom (on preview sprite container)
  previewSpriteContainer.eventMode = 'static';
  previewSpriteContainer.hitArea = new PIXI.Rectangle(-previewSize / 2, -previewSize / 2, previewSize, previewSize);
  previewSpriteContainer.on('wheel', (e: PIXI.FederatedWheelEvent) => {
    if (previewWindow.visible && currentHoveredEntry) {
      e.preventDefault();
      e.stopPropagation();
      const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
      previewZoom = Math.max(0.1, Math.min(10, previewZoom * zoomDelta));
      updatePreviewTransform();
    }
  });

  // Create scrollable container with scrollbar
  const scrollView = new UIScrollContainer({
    width: scene.renderer.width,
    height: scene.renderer.height - 80,
    backgroundColor: 0x1a1a2e,
    scrollbarWidth: 14,
    scrollbarTrackColor: 0x2d2d44,
    scrollbarThumbColor: 0x4a4a6a,
    scrollbarThumbHoverColor: 0x6a6a8a,
    padding: EdgeInsets.all(0)
  });
  scrollView.container.x = 0;
  scrollView.container.y = 80;
  scene.addChild(scrollView.container);
  
  // Add preview window after scroll container so it appears on top
  scene.addChild(previewWindow);

  // Create content container for sprites (wrapped in UIComponent)
  const spriteContentContainer = new SpriteCardsContainer(scene.renderer.width);
  scrollView.addChild(spriteContentContainer);
  const cardsContainer = spriteContentContainer.getCardsContainer();

  // Define renderSprites function
  renderSpritesFn = function() {
    // Clear existing sprites
    cardsContainer.removeChildren();

    // Filter sprites based on search
    const filteredEntries = searchQuery
      ? spriteEntries.filter(entry => 
          entry.name.toLowerCase().includes(searchQuery) ||
          entry.category.toLowerCase().includes(searchQuery)
        )
      : spriteEntries;

    if (filteredEntries.length === 0) {
      const noResults = new UILabel({
        text: `No sprites found matching "${searchQuery}"`,
        fontSize: 18,
        color: 0x999999
      });
      noResults.container.x = 20;
      noResults.container.y = 20;
      cardsContainer.addChild(noResults.container);
      scrollView.scrollToTop();
      return;
    }

    // Group by category
    const categories = Array.from(new Set(filteredEntries.map(s => s.category))).sort();
    let currentY = 20;
    const itemWidth = 180;
    const itemHeight = 100;
    const itemsPerRow = Math.floor(scene.renderer.width / (itemWidth + 20));
    const padding = 20;

    categories.forEach(category => {
      const categorySprites = filteredEntries.filter(s => s.category === category);
      
      // Category header
      const headerText = new UILabel({
        text: `${category} (${categorySprites.length})`,
        fontSize: 20,
        color: 0x00d4ff,
        fontWeight: 'bold'
      });
      headerText.container.x = padding;
      headerText.container.y = currentY;
      cardsContainer.addChild(headerText.container);
      currentY += 35;

      // Sprites in this category
      let x = padding;
      let row = 0;
      
      categorySprites.forEach((entry, index) => {
        // Create sprite card
        const card = new Container();
        card.x = x;
        card.y = currentY + row * (itemHeight + padding);

        // Background
        const bg = new Graphics();
        bg.rect(0, 0, itemWidth, itemHeight);
        bg.fill(0x2a2a2a);
        bg.stroke({ color: 0x444, width: 1 });
        card.addChild(bg);

        // Label with BitmapText (on top)
        const displayName = entry.name.length > 18 ? entry.name.substring(0, 18) + '...' : entry.name;
        const label = new BitmapText({
          text: displayName,
          style: {
            fontFamily: 'KenneyFutureNarrow',
            fontSize: 12
          }
        });
        label.tint = 0xcccccc;
        label.x = 5;
        label.y = 5;
        card.addChild(label);

        // Sprite (below label)
        const sprite = new Sprite(entry.texture);
        sprite.anchor.set(0.5);
        const scale = Math.min(
          (itemWidth - 20) / sprite.width,
          (itemHeight - 50) / sprite.height,
          1
        );
        sprite.scale.set(scale);
        sprite.x = itemWidth / 2;
        sprite.y = 30 + (itemHeight - 50) / 2;
        card.addChild(sprite);

        // Dimensions label at bottom
        const dimensionsText = new BitmapText({
          text: `${entry.texture.width} x ${entry.texture.height}`,
          style: {
            fontFamily: 'KenneyFutureNarrow',
            fontSize: 14
          }
        });
        dimensionsText.tint = 0x999999;
        dimensionsText.x = 5;
        dimensionsText.y = itemHeight - 18;
        card.addChild(dimensionsText);

        // Make card interactive for hover
        card.eventMode = 'static';
        card.cursor = 'pointer';
        
        // Store entry reference on card
        (card as any).spriteEntry = entry;
        
        // Hover handlers
        card.on('pointerenter', (e: PIXI.FederatedPointerEvent) => {
          currentHoveredEntry = entry;
          previewWindow.visible = true;
          updatePreviewSprite(entry);
          // Position based on card location (not mouse)
          // Get global position accounting for scroll container
          const cardGlobalPos = card.getGlobalPosition();
          updatePreviewPosition(cardGlobalPos.x);
        });
        
        card.on('pointermove', (e: PIXI.FederatedPointerEvent) => {
          if (currentHoveredEntry === entry) {
            // Calculate pan based on mouse position relative to card
            const localPos = e.getLocalPosition(card);
            const normalizedX = (localPos.x / itemWidth) * 2 - 1; // -1 to 1
            const normalizedY = (localPos.y / itemHeight) * 2 - 1; // -1 to 1
            
            // Pan based on normalized position and zoom
            if (previewSprite) {
              const maxPanX = (previewSprite.width * previewZoom - previewSize) / 2;
              const maxPanY = (previewSprite.height * previewZoom - previewSize) / 2;
              previewPanX = normalizedX * maxPanX; // Reversed x-axis direction
              previewPanY = normalizedY * maxPanY; // Reversed y-axis direction
              updatePreviewTransform();
            }
          }
        });
        
        card.on('pointerleave', () => {
          if (currentHoveredEntry === entry) {
            previewWindow.visible = false;
            currentHoveredEntry = null;
            updatePreviewSprite(null);
          }
        });
        
        // Handle wheel for zoom when hovering over card
        card.on('wheel', (e: PIXI.FederatedWheelEvent) => {
          if (currentHoveredEntry === entry && previewWindow.visible) {
            e.preventDefault();
            e.stopPropagation();
            const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
            previewZoom = Math.max(0.1, Math.min(10, previewZoom * zoomDelta));
            updatePreviewTransform();
          }
        });

        cardsContainer.addChild(card);

        // Move to next position
        x += itemWidth + padding;
        if ((index + 1) % itemsPerRow === 0) {
          x = padding;
          row++;
        }
      });

      // Move to next category
      const rows = Math.ceil(categorySprites.length / itemsPerRow);
      currentY += rows * (itemHeight + padding) + 30;
    });
    
    // Update scroll container bounds after adding all children
    spriteContentContainer.markLayoutDirty();
    scrollView.layout(scene.renderer.width, scene.renderer.height - 80);
    
    // Reset scroll position when filtering
    scrollView.scrollToTop();
  };

  // Initial render
  renderSpritesFn();

  scene.init();
  engine.start();

  console.log('✅ Sprite Library loaded');
  console.log(`💡 Scroll with mouse wheel to browse ${spriteEntries.length} sprites`);
}

