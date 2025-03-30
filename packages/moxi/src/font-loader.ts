import FontFaceObserver from 'fontfaceobserver';
import { BitmapFont } from 'pixi.js';

export const loadFonts = async () => {
  // note that this references the font-face specified in the HTML style section
  // <style>
  // @font-face {
  //   font-family: 'kenfuture-thin';
  //   src: url('./assets/fonts/kenvector_future_thin.ttf');
  // }
  // </style>

  // using fontfaceobserver allows us ensure the font is loaded before using configuration for bitmap fonts.
  const fontKenfutureThin = new FontFaceObserver('kenfuture-thin');


  return new Promise((resolve, reject) => {
    fontKenfutureThin.load().then(() => {
      // PIXI.BitmapFont.from will create a bitmap font from a font-face and TextStyle configuration
      // Using a Bitmapfont allows for better performance when rapidly changing rendered text.
      BitmapFont.install({
        name: 'kenfuture-thin',
        style: {
          fontFamily: 'kenfuture-thin'
        }
      });
      
      resolve({ });
    });
  });
}