import { fromEvent, merge, NotFoundError, Observable } from "rxjs";
import { map, filter } from "rxjs/operators";

import { Coordinate } from "./coordinate";
import { compose } from "./utils/funkyStuff";

// type Up = "w";
// type Down = "s";
// type Right = "d";
// type Left = "a";
// type None = null;

enum Movement {
    Up,
    Down,
    Left,
    Right,
    None
}

// type Movement = Up | Down | Right | Left | None;

function keyToMovement(key: string): Movement {
    switch (key) {
        case "w":
            return Movement.Up;
        case "a":
            return Movement.Left;
        case "s":
            return Movement.Down;
        case "d":
            return Movement.Right;
        default:
            return Movement.None;
    }
}


function isMovementKey(keyEvent: KeyboardEvent): boolean {
    return keyEvent.key === "w" || 
        keyEvent.key === "a" || 
        keyEvent.key === "s" || 
        keyEvent.key === "d";
}

const mousePosition$: Observable<Coordinate> =
    fromEvent<MouseEvent>(document, "mousemove")
        .pipe(
            map((event: MouseEvent) => {
                return {
                    x: event.clientX,
                    y: event.clientY
                };
            }));

const mousedown$ = fromEvent<MouseEvent>(document, "mousedown");
const mouseup$ = fromEvent<MouseEvent>(document, "mouseup");

const mouseDownAndUp$ = merge(mousedown$, mouseup$);

const movementKeyDown$ = fromEvent<KeyboardEvent>(document, "keydown").pipe(filter(isMovementKey));
const movementKeyUp$ = fromEvent<KeyboardEvent>(document, "keyup").pipe(filter(isMovementKey));

type KeyupW = "keyup+w";
type KeyupA = "keyup+a";
type KeyupS = "keyup+s";
type KeyupD = "keyup+d";

type KeydownW = "keydown+w";
type KeydownA = "keydown+a";
type KeydownS = "keydown+s";
type KeydownD = "keydown+d";

type MovementEvents 
    = KeyupW
    | KeyupA
    | KeyupS
    | KeyupD
    | KeydownW
    | KeydownA
    | KeydownS
    | KeydownD


const movementStateMachine: StateGraph<, MovementEvents> = new Map([
    ["w+a", []],
    ["w+s", []],
    ["w+d", []],
]);

const movement$ =
    merge(movementKeyDown$, movementKeyUp$)
            .pipe(
                scan()
            );

// const movement$: Observable<Movement> = 
//     fromEvent<KeyboardEvent>(document, "keydown")
//         .pipe(
//             filter(isMovementKey),
//             map(compose(keyToMovement, (event) => event.key))
//         );


export { mousedown$, mouseup$, mouseDownAndUp$, mousePosition$, movement$, Movement };