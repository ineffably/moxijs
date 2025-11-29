/**
 * UI Basics Tab
 * Demonstrates the UI system with FlexBox layouts and colored boxes
 */
import { EdgeInsets, FlexContainer, FlexDirection, FlexJustify, FlexAlign, UIBox, UIComponent } from '@moxijs/core';

export function createBasicsTab(): UIComponent {
  // Create a flex container for the main layout
  const mainContainer = new FlexContainer({
    direction: FlexDirection.Column,
    justify: FlexJustify.Center,
    align: FlexAlign.Center,
    gap: 20,
    padding: EdgeInsets.all(40),
    width: 1280,
    height: 672
  });

  // Add title (simulated with a box for now)
  const titleBox = new UIBox({
    backgroundColor: 0x4a90e2,
    width: 400,
    height: 60,
    borderRadius: 8
  });

  mainContainer.addChild(titleBox);

  // Create a row of colored boxes
  const rowContainer = new FlexContainer({
    direction: FlexDirection.Row,
    justify: FlexJustify.Center,
    gap: 15,
    padding: EdgeInsets.symmetric(20, 30)
  });

  // Add colored boxes
  const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xf38181];
  colors.forEach(color => {
    const box = new UIBox({
      backgroundColor: color,
      width: 80,
      height: 80,
      borderRadius: 12
    });
    rowContainer.addChild(box);
  });

  mainContainer.addChild(rowContainer);

  // Create another row with different sizes
  const secondRow = new FlexContainer({
    direction: FlexDirection.Row,
    justify: FlexJustify.SpaceBetween,
    gap: 10,
    width: 500
  });

  const box1 = new UIBox({
    backgroundColor: 0xa8dadc,
    width: 100,
    height: 60,
    borderRadius: 4
  });

  const box2 = new UIBox({
    backgroundColor: 0xf1faee,
    width: 150,
    height: 60,
    borderRadius: 4
  });

  const box3 = new UIBox({
    backgroundColor: 0xe63946,
    width: 120,
    height: 60,
    borderRadius: 4
  });

  secondRow.addChild(box1);
  secondRow.addChild(box2);
  secondRow.addChild(box3);

  mainContainer.addChild(secondRow);

  return mainContainer;
}
