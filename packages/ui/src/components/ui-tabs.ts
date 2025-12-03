import * as PIXI from 'pixi.js';
import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
import { UILabel } from './ui-label';
import { UIPanel } from './ui-panel';
import { LayoutEngine } from '../services';

export interface TabItem {
  key: string;
  label: string;
  content: UIComponent;
  disabled?: boolean;
}

export interface UITabsProps {
  items: TabItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (activeKey: string) => void;
  type?: 'line' | 'card';
  tabPosition?: 'top' | 'bottom';
  width?: number;
  height?: number;
  tabBarBackgroundColor?: number;
  tabBarHeight?: number;
  activeTabColor?: number;
  inactiveTabColor?: number;
  textColor?: number;
  activeTextColor?: number;
  hashPrefix?: string; // e.g., "ui-showcase" creates URLs like #ui-showcase/basics
}

export class UITabs extends UIComponent {
  private items: TabItem[];
  private activeKey: string;
  private onChange?: (activeKey: string) => void;
  private type: 'line' | 'card';
  private tabPosition: 'top' | 'bottom';
  private width: number;
  private height: number;
  private tabBarBackgroundColor: number;
  private tabBarHeight: number;
  private activeTabColor: number;
  private inactiveTabColor: number;
  private textColor: number;
  private activeTextColor: number;
  private hashPrefix?: string;

  // Services (composition)

  private tabBar: PIXI.Container;
  private contentArea: PIXI.Container;
  private tabButtons: Map<string, { container: PIXI.Container; label: UILabel; bg: PIXI.Graphics }> = new Map();
  private activeIndicator?: PIXI.Graphics;
  private hashChangeHandler?: () => void;

  constructor(props: UITabsProps, boxModel?: Partial<BoxModel>) {
    super(boxModel);


    this.items = props.items || [];
    this.onChange = props.onChange;
    this.type = props.type || 'line';
    this.tabPosition = props.tabPosition || 'top';
    this.tabBarBackgroundColor = props.tabBarBackgroundColor ?? 0x2d2d44;
    this.tabBarHeight = props.tabBarHeight ?? 48;
    this.activeTabColor = props.activeTabColor ?? 0x1890ff;
    this.inactiveTabColor = props.inactiveTabColor ?? 0x3d3d54;
    this.textColor = props.textColor ?? 0xaaaaaa;
    this.activeTextColor = props.activeTextColor ?? 0xffffff;
    this.hashPrefix = props.hashPrefix;

    // Determine active key - check URL hash first if hashPrefix is provided
    let initialKey = props.activeKey || props.defaultActiveKey || (this.items.length > 0 ? this.items[0].key : '');
    if (this.hashPrefix && !props.activeKey) {
      const hashKey = this.getKeyFromHash();
      if (hashKey && this.items.find(item => item.key === hashKey)) {
        initialKey = hashKey;
      }
    }
    this.activeKey = initialKey;

    this.width = props.width ?? 800;
    this.height = props.height ?? 600;

    this.tabBar = new PIXI.Container();
    this.contentArea = new PIXI.Container();

    this.container.addChild(this.tabBar);
    this.container.addChild(this.contentArea);

    this.buildTabs();
    this.showActiveTab();

    // Set up hash change listener if hashPrefix is provided
    if (this.hashPrefix) {
      this.setupHashListener();
      // Update hash to match initial active key
      this.updateHash(this.activeKey);
    }
  }

  private getKeyFromHash(): string | null {
    if (!this.hashPrefix || typeof window === 'undefined') return null;
    const hash = window.location.hash.slice(1); // Remove #
    const prefix = `${this.hashPrefix}/`;
    if (hash.startsWith(prefix)) {
      return hash.slice(prefix.length);
    }
    return null;
  }

  private updateHash(key: string): void {
    if (!this.hashPrefix || typeof window === 'undefined') return;
    const newHash = `#${this.hashPrefix}/${key}`;
    if (window.location.hash !== newHash) {
      window.location.hash = newHash;
    }
  }

  private setupHashListener(): void {
    if (typeof window === 'undefined') return;
    this.hashChangeHandler = () => {
      const hashKey = this.getKeyFromHash();
      if (hashKey && hashKey !== this.activeKey) {
        this.setActiveKey(hashKey, false); // false = don't update hash (already changed)
      }
    };
    window.addEventListener('hashchange', this.hashChangeHandler);
  }

  public destroy(): void {
    if (this.hashChangeHandler) {
      window.removeEventListener('hashchange', this.hashChangeHandler);
    }
  }

  private buildTabs(): void {
    // Clear existing tabs
    this.tabBar.removeChildren();
    this.tabButtons.clear();

    // Create tab bar background
    const tabBarBg = new PIXI.Graphics();
    tabBarBg.rect(0, 0, this.width, this.tabBarHeight);
    tabBarBg.fill({ color: this.tabBarBackgroundColor });
    this.tabBar.addChild(tabBarBg);

    // Add bottom border line for line type
    if (this.type === 'line') {
      const borderLine = new PIXI.Graphics();
      borderLine.rect(0, this.tabBarHeight - 2, this.width, 2);
      borderLine.fill({ color: 0x3d3d54, alpha: 0.5 });
      this.tabBar.addChild(borderLine);
    }

    // Position tab bar
    if (this.tabPosition === 'bottom') {
      this.tabBar.y = this.height - this.tabBarHeight;
      this.contentArea.y = 0;
    } else {
      this.tabBar.y = 0;
      this.contentArea.y = this.tabBarHeight;
    }

    // Create tabs
    let xOffset = 8; // Start with some left padding
    const tabPadding = 24;
    const tabGap = 8;

    for (const item of this.items) {
      if (item.disabled) continue;

      const tabContainer = new PIXI.Container();
      tabContainer.x = xOffset;

      // Tab label
      const isActive = this.activeKey === item.key;
      const label = new UILabel({
        text: item.label,
        fontSize: 15,
        fontWeight: isActive ? 'bold' : 'normal',
        color: isActive ? this.activeTextColor : this.textColor
      });

      // Measure label to determine tab width
      label.measure();
      label.layout(this.width, this.tabBarHeight);
      const labelBounds = label.container.getLocalBounds();
      const tabWidth = labelBounds.width + (tabPadding * 2);

      // Tab background
      let bg: PIXI.Graphics;
      if (this.type === 'card') {
        bg = new PIXI.Graphics();
        bg.roundRect(0, 0, tabWidth, this.tabBarHeight - 2, 6);
        bg.fill({ color: isActive ? this.activeTabColor : this.inactiveTabColor });
        // Add border for card type
        bg.roundRect(0, 0, tabWidth, this.tabBarHeight - 2, 6);
        bg.stroke({ color: isActive ? this.activeTabColor : 0x4d4d64, width: 2 });
        tabContainer.addChild(bg);
      } else {
        // For line type, NO background or border - just transparent hit area
        bg = new PIXI.Graphics();
        bg.rect(0, 0, tabWidth, this.tabBarHeight);
        bg.fill({ color: 0x000000, alpha: 0 });
        tabContainer.addChild(bg);
      }

      // Position label centered in tab
      label.container.x = tabPadding;
      label.container.y = (this.tabBarHeight - labelBounds.height) / 2;
      tabContainer.addChild(label.container);

      // Make tab interactive
      tabContainer.eventMode = 'static';
      tabContainer.cursor = 'pointer';

      const tabKey = item.key;
      tabContainer.on('pointerdown', () => {
        this.setActiveKey(tabKey);
      });

      // Hover effect
      tabContainer.on('pointerover', () => {
        if (this.activeKey !== tabKey) {
          if (this.type === 'card') {
            bg.clear();
            bg.roundRect(0, 0, tabWidth, this.tabBarHeight - 2, 6);
            bg.fill({ color: this.activeTabColor, alpha: 0.5 });
            bg.roundRect(0, 0, tabWidth, this.tabBarHeight - 2, 6);
            bg.stroke({ color: this.activeTabColor, width: 2 });
          } else {
            // For line type, just change text color on hover
            label.setColor(this.activeTextColor);
          }
        }
      });

      tabContainer.on('pointerout', () => {
        if (this.activeKey !== tabKey) {
          if (this.type === 'card') {
            bg.clear();
            bg.roundRect(0, 0, tabWidth, this.tabBarHeight - 2, 6);
            bg.fill({ color: this.inactiveTabColor });
            bg.roundRect(0, 0, tabWidth, this.tabBarHeight - 2, 6);
            bg.stroke({ color: 0x4d4d64, width: 2 });
          } else {
            // Restore muted text color
            label.setColor(this.textColor);
          }
        }
      });

      this.tabBar.addChild(tabContainer);
      this.tabButtons.set(item.key, { container: tabContainer, label, bg });

      xOffset += tabWidth + tabGap;
    }

    // Create active indicator for line type
    if (this.type === 'line') {
      this.activeIndicator = new PIXI.Graphics();
      this.tabBar.addChild(this.activeIndicator);
      this.updateActiveIndicator();
    }
  }

  private updateActiveIndicator(): void {
    if (!this.activeIndicator || this.type !== 'line') return;

    this.activeIndicator.clear();

    const activeTab = this.tabButtons.get(this.activeKey);
    if (!activeTab) return;

    const tabX = activeTab.container.x;
    const tabBounds = activeTab.bg.getLocalBounds();
    const tabWidth = tabBounds.width;
    const indicatorHeight = 3;
    const indicatorY = this.tabBarHeight - indicatorHeight;

    // Draw indicator at the very bottom, spanning most of the tab width
    this.activeIndicator.roundRect(tabX + 8, indicatorY, tabWidth - 16, indicatorHeight, 1.5);
    this.activeIndicator.fill({ color: this.activeTabColor });
  }

  private showActiveTab(): void {
    // Clear content area
    this.contentArea.removeChildren();

    // Find active item
    const activeItem = this.items.find(item => item.key === this.activeKey);
    if (!activeItem) return;

    // Add content
    const contentHeight = this.height - this.tabBarHeight;
    activeItem.content.layout(this.width, contentHeight);
    this.contentArea.addChild(activeItem.content.container);

    // Update tab styles
    this.tabButtons.forEach((tab, key) => {
      const isActive = key === this.activeKey;
      const tabBounds = tab.bg.getLocalBounds();

      if (this.type === 'card') {
        tab.bg.clear();
        tab.bg.roundRect(0, 0, tabBounds.width, this.tabBarHeight - 2, 6);
        tab.bg.fill({ color: isActive ? this.activeTabColor : this.inactiveTabColor });
        tab.bg.roundRect(0, 0, tabBounds.width, this.tabBarHeight - 2, 6);
        tab.bg.stroke({ color: isActive ? this.activeTabColor : 0x4d4d64, width: 2 });
      } else {
        // For line type, keep transparent background
        tab.bg.clear();
        tab.bg.rect(0, 0, tabBounds.width, this.tabBarHeight);
        tab.bg.fill({ color: 0x000000, alpha: 0 });
      }

      tab.label.setColor(isActive ? this.activeTextColor : this.textColor);
      tab.label.container.alpha = 1;
    });

    // Update active indicator
    if (this.type === 'line') {
      this.updateActiveIndicator();
    }
  }

  public setActiveKey(key: string, updateHash: boolean = true): void {
    if (this.activeKey === key) return;

    const item = this.items.find(item => item.key === key);
    if (!item || item.disabled) return;

    this.activeKey = key;
    this.showActiveTab();

    // Update URL hash if enabled
    if (updateHash && this.hashPrefix) {
      this.updateHash(key);
    }

    if (this.onChange) {
      this.onChange(key);
    }
  }

  public getActiveKey(): string {
    return this.activeKey;
  }

  public setItems(items: TabItem[]): void {
    this.items = items;

    // If active key no longer exists, switch to first tab
    if (!this.items.find(item => item.key === this.activeKey)) {
      this.activeKey = this.items.length > 0 ? this.items[0].key : '';
    }

    this.buildTabs();
    this.showActiveTab();
  }

  measure(): MeasuredSize {
    const contentSize: MeasuredSize = {
      width: this.width,
      height: this.height
    };
    
    return this.layoutEngine.measure(this.boxModel, contentSize);
  }

  layout(width: number, height: number): void {
    this.width = width;
    this.height = height;
    
    const measured = this.measure();
    
    // Use LayoutEngine to calculate layout
    this.computedLayout = this.layoutEngine.layout(
      this.boxModel,
      measured,
      { width, height }
    );

    // Rebuild tabs with new dimensions
    this.buildTabs();
    this.showActiveTab();
  }

  render(): void {
    // Rendering is handled by child components
  }
}
