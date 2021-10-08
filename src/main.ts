
import { take, scan } from 'rxjs/operators';
import { firingTransition, IDLE, FIRING } from "./app/planeState";
import { gameLoop$, GameTime } from './app/gameLoop';
import { planeState$, PlaneState } from './app/planeState';
import './style.css'
import { loadSprites } from './app/load';
import { Sprite } from './app/sprite';

 // TODO - actually error handle these
const canvas: HTMLCanvasElement = document.querySelector('#canvas')!; // yikes!
const canvasCtx: CanvasRenderingContext2D = canvas.getContext('2d')!; // yikes!

// ship 5
// const ship = new Image();
// ship.src = "./assets/Ships/ship_0005.png";
loadSprites(["./assets/Ships/ship_0005.png"])
  .then(sprites => {

    sprites
      .map((sprite: Sprite) => { 
        return {
          ...sprite, 
          coordinates: { x: sprite.coordinates.x + 150, y: sprite.coordinates.y + 150 }
        }
      })
      .forEach((sprite: Sprite) => {
        console.log("a sprite! ", sprite);
        canvasCtx.drawImage(sprite.texture.img, sprite.coordinates.x, sprite.coordinates.y, 75, 75);
      });
  
    gameLoop$
      .pipe(
        take(20))
      .subscribe((it: GameTime) => {
        // console.log(`the thing ${it.currentTime}, ${it.deltaTime}`);
        sprites.forEach(sprite => {
          canvasCtx.drawImage(sprite.texture.img, sprite.coordinates.x + 150, sprite.coordinates.y + 150, 75, 75);
        });
    });
  
    planeState$
      .pipe(
        take(20))
      .subscribe((it: PlaneState) => console.log("updown: ", it));
  })


const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <h1>Hello Vite!</h1>
  <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
`
