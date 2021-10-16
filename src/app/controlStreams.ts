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

// type KeyupW = "keyup+w";
// type KeyupA = "keyup+a";
// type KeyupS = "keyup+s";
// type KeyupD = "keyup+d";

// type KeydownW = "keydown+w";
// type KeydownA = "keydown+a";
// type KeydownS = "keydown+s";
// type KeydownD = "keydown+d";

// type MovementEvent
//     = KeyupW
//     | KeyupA
//     | KeyupS
//     | KeyupD
//     | KeydownW
//     | KeydownA
//     | KeydownS
//     | KeydownD

enum MovementEvent {
    KeyupW,
    KeyupA,
    KeyupS,
    KeyupD,
    KeydownW,
    KeydownA,
    KeydownS,
    KeydwonD
}


// type Up = "w";
// type Down = "s";
// type Left = "a";
// type Right = "d";
// type UpLeft = "w+a";
// type UpRight = "w+d";
// type DownLeft = "s+a";
// type DownRight = "s+d";
// type UpDown = "w+s";
// type None = "none";


// type MovementKey
//     = Up
//     | Down
//     | Left
//     | Right
//     | UpLeft
//     | UpRight
//     | DownLeft
//     | DownRight
//     | UpDown
//     | None


const movementStateMachine: StateGraph<Movement, MovementEvent> = new Map([
    [Movement.UpLeft, [
        { from: Movement.UpLeft, to: Movement.Left, when: MovementEvent.KeyupW }, 
        { from: Movement.UpLeft, to: Movement.Up, when: MovementEvent.KeyupW },
    ]],
    // [Movement.None, [
    //     { from: "w+s", to: "s", when: "keyup+w" }, 
    //     { from: "w+s", to: "w", when: "keyup+s" },
    // ]],
    [Movement.UpRight, [
        { from: Movement.UpRight, to: Movement.Right, when: MovementEvent.KeyupW }, 
        { from: Movement.UpRight, to: Movement.Up, when: MovementEvent.KeyupD },
    ]],
    [Movement.DownRight, [
        { from: Movement.DownRight, to: Movement.Down, when: MovementEvent.KeyupD }, 
        { from: Movement.DownRight, to: Movement.Right, when: MovementEvent.KeyupS },
    ]],
    [Movement.DownLeft, [
        { from: Movement.DownLeft, to: Movement.Left, when: MovementEvent.KeyupS }, 
        { from: Movement.DownLeft, to: Movement.Down, when: MovementEvent.KeyupA },
    ]],
    [Movement.Up, [
        { from: Movement.Up, to: "w+s", when: "keydown+s" },
        { from: Movement.Up, to: "w+a", when: "keydown+a" },
        { from: Movement.Up, to: "w+s", when: "keydown+s" },
        { from: Movement.Up, to: "none", when: "keyup+a" }
    ]],
    // ["a", [
    //     { from: "a", to: "w+a", when: "keydown+a" },
    //     { from: "a", to: "s+a", when: "keydown+s" },
    //     { from: "a", to: "none", when: "keyup+a" }
    // ]],
    // ["s", [
    //     { from: "s", to: "s+d", when: "keydown+d" },
    //     { from: "s", to: "s+a", when: "keydown+a" },
    //     { from: "s", to: "none", when: "keyup+s" }
    // ]],
    // ["d", [
    //     { from: "d", to: "s+d", when: "keydown+s" },
    //     { from: "d", to: "w+d", when: "keydown+w" },
    //     { from: "d", to: "none", when: "keyup+d" }
    // ]],
    // ["none", [
    //     { from: "none", to: "a", when: "keydown+a" },
    //     { from: "none", to: "w", when: "keydown+w" },
    //     { from: "none", to: "s", when: "keydown+s" }, 
    //     { from: "none", to: "d", when: "keydown+d" },
    // ]]
]);

function toMovementEvent(event: KeyboardEvent): MovementEvent {
    return `${event.type}+${event.key}`;
}

const movementTransitions = stateTransitions(movementStateMachine);

const movement$ =
    merge(movementKeyDown$.pipe(map()), movementKeyUp$)
            .pipe(
                filter(isMovementKey),
                scan(movementTransitions, "none")
            );

// const movement$: Observable<Movement> = 
//     fromEvent<KeyboardEvent>(document, "keydown")
//         .pipe(
//             filter(isMovementKey),
//             map(compose(keyToMovement, (event) => event.key))
//         );


export { mousedown$, mouseup$, mouseDownAndUp$, mousePosition$, movement$, Movement };