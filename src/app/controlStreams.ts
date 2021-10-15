import { fromEvent, merge, NotFoundError, Observable } from "rxjs";
import { map, filter, scan } from "rxjs/operators";

import { Coordinate } from "./coordinate";
import { StateGraph, stateTransitions } from "./stateGraph";
import { compose } from "./utils/funkyStuff";

// type Up = "w";
// type Down = "s";
// type Right = "d";
// type Left = "a";
// type None = null;

enum Movement {
    Up,
    UpLeft,
    UpRight,
    Down,
    DownLeft,
    DownRight,
    Left,
    Right,
    None
}


function keyToMovement(key: MovementKeys): Movement {
    // turn this stuff into a Map
    switch (key) {
        case "w":
            return Movement.Up;
        case "a":
            return Movement.Left;
        case "s":
            return Movement.Down;
        case "d":
            return Movement.Right;
        case "w+d":
            return Movement.UpRight;
        case "w+a":
            return Movement.UpLeft;
        case "s+a":
            return Movement.DownLeft;
        case "s+d":
            return Movement.DownRight;
        case "w+s":
            return Movement.None;
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


type Up = "w";
type Down = "s";
type Left = "a";
type Right = "d";
type UpLeft = "w+a";
type UpRight = "w+d";
type DownLeft = "s+a";
type DownRight = "s+d";
type UpDown = "w+s";
type None = "none";


type MovementKeys
    = Up
    | Down
    | Left
    | Right
    | UpLeft
    | UpRight
    | DownLeft
    | DownRight
    | UpDown
    | None


const movementStateMachine: StateGraph<MovementKeys, MovementEvents> = new Map([
    ["w+a", [
        { from: "w+a", to: "a", when: "keyup+w" }, 
        { from: "w+a", to: "w", when: "keyup+a" },
        { from: "a", to: "none", when: "keyup+a" }
    ]],
    ["w+s", [
        { from: "w+s", to: "s", when: "keyup+w" }, 
        { from: "w+s", to: "w", when: "keyup+s" },
    ]],
    ["w+d", [
        { from: "w+d", to: "d", when: "keyup+w" }, 
        { from: "w+d", to: "w", when: "keyup+d" },
    ]],
    ["s+d", [
        { from: "s+d", to: "d", when: "keyup+s" }, 
        { from: "s+d", to: "s", when: "keyup+d" },
    ]],
    ["s+a", [
        { from: "s+a", to: "a", when: "keyup+s" }, 
        { from: "s+a", to: "s", when: "keyup+a" },
    ]],
    ["w", [
        { from: "w", to: "w+s", when: "keydown+s" },
        { from: "w", to: "w+a", when: "keydown+a" },
        { from: "w", to: "w+s", when: "keydown+s" },
        { from: "a", to: "none", when: "keyup+a" }
    ]],
    ["a", [
        { from: "a", to: "w+a", when: "keydown+a" },
        { from: "a", to: "s+a", when: "keydown+s" },
        { from: "a", to: "none", when: "keyup+a" }
    ]],
    ["s", [
        { from: "s", to: "s+d", when: "keydown+d" },
        { from: "s", to: "s+a", when: "keydown+a" },
        { from: "s", to: "none", when: "keyup+s" }
    ]],
    ["d", [
        { from: "d", to: "s+d", when: "keydown+s" },
        { from: "d", to: "w+d", when: "keydown+w" },
        { from: "d", to: "none", when: "keyup+d" }
    ]],
    ["none", [
        { from: "none", to: "a", when: "keydown+a" },
        { from: "none", to: "w", when: "keydown+w" },
        { from: "none", to: "s", when: "keydown+s" },
        { from: "none", to: "d", when: "keydown+d" },
    ]]
]);

const movementTransitions = stateTransitions(movementStateMachine);

const movement$ =
    merge(movementKeyDown$, movementKeyUp$)
            .pipe(
                scan(movementTransitions, "none")
            );

// const movement$: Observable<Movement> = 
//     fromEvent<KeyboardEvent>(document, "keydown")
//         .pipe(
//             filter(isMovementKey),
//             map(compose(keyToMovement, (event) => event.key))
//         );


export { mousedown$, mouseup$, mouseDownAndUp$, mousePosition$, movement$, Movement };