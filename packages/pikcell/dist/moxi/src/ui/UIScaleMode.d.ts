/**
 * UI Scaling modes for UILayer
 */
export declare enum UIScaleMode {
    /**
     * No scaling - 1:1 pixel mapping, no offset calculations
     */
    None = "none",
    /**
     * Scale UI proportionally to fill the available space
     */
    ScaleUI = "scaleUI",
    /**
     * Scale while maintaining aspect ratio (may letterbox/pillarbox)
     */
    LockRatio = "lockRatio"
}
