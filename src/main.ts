
import { take, scan } from 'rxjs/operators';
import { firingTransition, IDLE, FIRING } from "./app/planeState";
import { gameLoop$, GameTime } from './app/gameLoop';
import { planeState$, PlaneState } from './app/planeState';
import './style.css'

 // TODO - actually error handle these
const canvas: HTMLCanvasElement = document.querySelector('#canvas')!;
const canvasCtx: CanvasRenderingContext2D = canvas.getContext('2d')!;

// ship 5
const ship = new Image();
ship.src = "./assets/Ships/ship_0005.png";

ship.addEventListener("load", () => {
  canvasCtx.drawImage(ship, 150, 150, 75, 75);
  

  gameLoop$
    .pipe(
      take(20))
    .subscribe((it: GameTime) => {
      console.log(`the thing ${it.currentTime}, ${it.deltaTime}`);
  });

  planeState$
    .pipe(
      take(20))
    .subscribe((it: PlaneState) => console.log("updown: ", it));
});

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <h1>Hello Vite!</h1>
  <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
`
