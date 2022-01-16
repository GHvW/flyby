import { BehaviorSubject, Observable } from 'rxjs';
import { take, scan, withLatestFrom } from 'rxjs/operators';
// import { firingTransition, IDLE, FIRING } from "./app/planeState";
import { gameLoop$, GameTime } from './app/gameLoop';
import { planeState$, PlaneState } from './app/planeState';
import './style.css'
import { loadSprites } from './app/load';
import { Sprite } from './app/sprite';
import { render } from './app/render';
import { MoveKeyCombo, Movement, movement$, MovementEvent, movementStateGraph } from './app/controlStreams';
import { GameWorld } from './app/world';

 // TODO - actually error handle these
const canvas: HTMLCanvasElement = document.querySelector('#canvas')!; // yikes!
const canvasCtx: CanvasRenderingContext2D = canvas.getContext('2d')!; // yikes!


// ship 5
// const ship = new Image();
// ship.src = "./assets/Ships/ship_0005.png";
loadSprites(["./assets/Ships/ship_0005.png"])
  .then(sprites => {

    const state$: BehaviorSubject<GameWorld> = 
      new BehaviorSubject({
        sprites
      });

    gameLoop$
      .pipe(
        // take(20))
        withLatestFrom(movement$, state$))
      .subscribe(([gameTime, movement, state]: [GameTime, Movement, GameWorld]) => {

        // generator map might be nice here
        // console.log("movement: ", movement);
        const newSprites: Sprite[] = state.sprites.map(sprite => { 
          let coords = sprite.coordinates;
          let newCoords = coords;
          // console.log("new coords: ", newCoords);

          if (movement === Movement.Down) {
            newCoords = { x: coords.x, y: coords.y + 1 };
          }
          else if (movement === Movement.DownLeft) {
             newCoords = { x: coords.x - 1, y: coords.y + 1 };           
          }
          else if (movement === Movement.DownRight) {
             newCoords = { x: coords.x + 1, y: coords.y + 1 };           
          }
          else if (movement === Movement.Left) {
             newCoords = { x: coords.x - 1, y: coords.y  };           
          }
          else if (movement === Movement.UpLeft) {
             newCoords = { x: coords.x - 1, y: coords.y - 1 };           
          }
          else if (movement === Movement.UpRight) {
             newCoords = { x: coords.x + 1, y: coords.y - 1 };           
          }
          else if (movement === Movement.Up) {
             newCoords = { x: coords.x, y: coords.y - 1 };           
          }
          else if (movement === Movement.Right) {
             newCoords = { x: coords.x + 1, y: coords.y };           
          }

          return { ...sprite, coordinates: newCoords };
        });


        render(newSprites, canvasCtx);

        state$.next({ ...state, sprites: newSprites });
    });

    movement$
      .subscribe((it) => {
        if (it === Movement.Down)
          console.log("down");
        else if (it === Movement.DownLeft)
          console.log("down+left diagonal");
        else if (it === Movement.DownRight)
          console.log("down+right diagonal");
        else if (it === Movement.Left)
          console.log("left");
        else if (it === Movement.UpLeft)
          console.log("up+left diagonal");
        else if (it === Movement.UpRight)
          console.log("up+right diagonal");
        else if (it === Movement.Up)
          console.log("up");
        else if (it === Movement.Right)
          console.log("right");
        else
          console.log("none");
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
