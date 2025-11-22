import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
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
    hashPrefix?: string;
}
export declare class UITabs extends UIComponent {
    private items;
    private activeKey;
    private onChange?;
    private type;
    private tabPosition;
    private width;
    private height;
    private tabBarBackgroundColor;
    private tabBarHeight;
    private activeTabColor;
    private inactiveTabColor;
    private textColor;
    private activeTextColor;
    private hashPrefix?;
    private tabBar;
    private contentArea;
    private tabButtons;
    private activeIndicator?;
    private hashChangeHandler?;
    constructor(props: UITabsProps, boxModel?: Partial<BoxModel>);
    private getKeyFromHash;
    private updateHash;
    private setupHashListener;
    destroy(): void;
    private buildTabs;
    private updateActiveIndicator;
    private showActiveTab;
    setActiveKey(key: string, updateHash?: boolean): void;
    getActiveKey(): string;
    setItems(items: TabItem[]): void;
    measure(): MeasuredSize;
    layout(width: number, height: number): void;
    render(): void;
}
