import { fromEvent, merge, NotFoundError, Observable } from "rxjs";
import { map, filter, scan } from "rxjs/operators";

import { Coordinate } from "./coordinate";
import { StateGraph, stateTransitions } from "./stateGraph";
import { compose } from "./utils/funkyStuff";


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


enum MovementEvent {
    KeyupW,
    KeyupA,
    KeyupS,
    KeyupD,
    KeydownW,
    KeydownA,
    KeydownS,
    KeydownD
}


const movementStateMachine: StateGraph<Movement, MovementEvent> = new Map([
    [Movement.UpLeft, [
        { from: Movement.UpLeft, to: Movement.Left, when: MovementEvent.KeyupW }, 
        { from: Movement.UpLeft, to: Movement.Up, when: MovementEvent.KeyupW },
    ]],
    [Movement.None, [
        { from: Movement.None, to: Movement.Down, when: MovementEvent.KeydownS }, 
        { from: Movement.None, to: Movement.Up, when: MovementEvent.KeydownW },
        { from: Movement.None, to: Movement.Right, when: MovementEvent.KeydownD }, 
        { from: Movement.None, to: Movement.Left, when: MovementEvent.KeydownA },
    ]],
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
        { from: Movement.Up, to: Movement.None, when: MovementEvent.KeyupW },
        { from: Movement.Up, to: Movement.UpLeft, when: MovementEvent.KeydownA },
        { from: Movement.Up, to: Movement.UpRight, when: MovementEvent.KeydownD },
    ]],
    [Movement.Left, [
        { from: Movement.Left, to: Movement.None, when: MovementEvent.KeyupA },
        { from: Movement.Left, to: Movement.UpLeft, when: MovementEvent.KeydownW },
        { from: Movement.Left, to: Movement.DownLeft, when: MovementEvent.KeydownS }
    ]],
    [Movement.Down, [
        { from: Movement.Down, to: Movement.None, when: MovementEvent.KeyupS },
        { from: Movement.Down, to: Movement.DownRight, when: MovementEvent.KeydownD },
        { from: Movement.Down, to: Movement.DownLeft, when: MovementEvent.KeydownA }
    ]],
    [Movement.Right, [
        { from: Movement.Right, to: Movement.None, when: MovementEvent.KeyupD },
        { from: Movement.Right, to: Movement.UpRight, when: MovementEvent.KeydownW },
        { from: Movement.Right, to: Movement.DownRight, when: MovementEvent.KeydownS }
    ]],
]);


type KeyEventType = "keydown" | "keyup";
type MovementKey = "w" | "a" | "s" | "d";
const MovementKeys = new Set(["w", "a", "s", "d"]);

const KeyEventToMovemenEventMap = new Map<KeyEventType, Map<MovementKey, MovementEvent>>([
    ["keydown", new Map([
        ["w", MovementEvent.KeydownW],
        ["a", MovementEvent.KeydownA],
        ["s", MovementEvent.KeydownS],
        ["d", MovementEvent.KeydownD],
    ])],
    ["keyup", new Map([
        ["w", MovementEvent.KeyupW],
        ["a", MovementEvent.KeyupA],
        ["s", MovementEvent.KeyupS],
        ["d", MovementEvent.KeyupD],
    ])] 
]);

function toMovementEvent(event: KeyboardEvent): MovementEvent | null {
    if ((event.type === "keydown" || event.type === "keyup") && (MovementKeys.has(event.key)) {
        return KeyEventToMovemenEventMap.get(event.type)?.get(event.key) ?? MovementEvent.;
    }
    return null;
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