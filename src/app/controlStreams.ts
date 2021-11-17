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

enum MovementEvent {
    KeyupW,
    KeyupA,
    KeyupS,
    KeyupD,
    KeydownW,
    KeydownA,
    KeydownS,
    KeydownD,
    None
}


enum MovementCombination {
    Up,
    UpLeft,
    UpRight,
    UpLeftRight,
    UpLeftRightDown,
    UpLeftDown,
    UpRightDown,
    UpDown,
    Down,
    DownLeft,
    DownRight,
    DownLeftRight,
    Left,
    Right,
    LeftRight,
    None
}


// substet of MovementCombination
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
        {
            from: Movement.UpLeft, transitions: [
                { to: Movement.Left, when: MovementEvent.KeyupW },
                { to: Movement.Up, when: MovementEvent.KeyupW }
            ]
        },
    ]],
    [Movement.None, [
        {
            from: Movement.None, transitions: [
                { to: Movement.Down, when: MovementEvent.KeydownS },
                { to: Movement.Up, when: MovementEvent.KeydownW },
                { to: Movement.Right, when: MovementEvent.KeydownD },
                { to: Movement.Left, when: MovementEvent.KeydownA }
            ]
        },
    ]],
    [Movement.UpRight, [
        {
            from: Movement.UpRight, transitions: [
                { to: Movement.Right, when: MovementEvent.KeyupW },
                { to: Movement.Up, when: MovementEvent.KeyupD }
            ]
        },
    ]],
    [Movement.DownRight, [
        { from: Movement.DownRight, to: Movement.Down, when: MovementEvent.KeyupD },
        { from: Movement.DownRight, to: Movement.Right, when: MovementEvent.KeyupS },
    ]],
    [Movement.DownLeft, [
        { from: Movement.DownLeft, to: Movement.Left, when: MovementEvent.KeyupS },
        { from: Movement.DownLeft, to: Movement.Down, when: MovementEvent.KeyupA },
    ]],
    [MovementCombination.Up, [
        { from: MovementCombination.Up, to: MovementCombination.None, when: MovementEvent.KeyupW },
        { from: MovementCombination.Up, to: MovementCombination.UpLeft, when: MovementEvent.KeydownA },
        { from: MovementCombination.Up, to: MovementCombination.UpRight, when: MovementEvent.KeydownD },
        { from: MovementCombination.Up, to: MovementCombination.UpDown, when: MovementEvent.KeydownS },
    ]],
    [MovementCombination.Left, [
        { from: MovementCombination.Left, to: MovementCombination.None, when: MovementEvent.KeyupA },
        { from: MovementCombination.Left, to: MovementCombination.UpLeft, when: MovementEvent.KeydownW },
        { from: MovementCombination.Left, to: MovementCombination.DownLeft, when: MovementEvent.KeydownS },
        { from: MovementCombination.Left, to: MovementCombination.LeftRight, when: MovementEvent.KeydownD },
    ]],
    [MovementCombination.Down, [
        { from: MovementCombination.Down, to: MovementCombination.None, when: MovementEvent.KeyupS },
        { from: MovementCombination.Down, to: MovementCombination.DownRight, when: MovementEvent.KeydownD },
        { from: MovementCombination.Down, to: MovementCombination.DownLeft, when: MovementEvent.KeydownA },
        { from: MovementCombination.Down, to: MovementCombination.UpDown, when: MovementEvent.KeydownW },
    ]],
    [MovementCombination.Right, [
        { from: MovementCombination.Right, to: MovementCombination.None, when: MovementEvent.KeyupD },
        { from: MovementCombination.Right, to: MovementCombination.UpRight, when: MovementEvent.KeydownW },
        { from: MovementCombination.Right, to: MovementCombination.DownRight, when: MovementEvent.KeydownS },
        { from: MovementCombination.Right, to: MovementCombination.LeftRight, when: MovementEvent.KeydownA },
    ]],
    [MovementCombination.UpLeftRight, [
        // { from: MovementCombination.UpLeft, to: MovementCombination.Left, when: MovementEvent.KeyupW }, 
        // { from: MovementCombination.UpLeft, to: MovementCombination.Up, when: MovementEvent.KeyupA },
        // { from: MovementCombination.UpLeft, to: MovementCombination.UpLeftRight, when: MovementEvent.KeydownD },
        // { from: MovementCombination.UpLeft, to: MovementCombination.UpLeftDown, when: MovementEvent.KeydownS },
    ]],
    [MovementCombination.UpLeftRightDown, [
        // { from: MovementCombination.UpLeft, to: MovementCombination.Left, when: MovementEvent.KeyupW }, 
        // { from: MovementCombination.UpLeft, to: MovementCombination.Up, when: MovementEvent.KeyupA },
        // { from: MovementCombination.UpLeft, to: MovementCombination.UpLeftRight, when: MovementEvent.KeydownD },
        // { from: MovementCombination.UpLeft, to: MovementCombination.UpLeftDown, when: MovementEvent.KeydownS },
    ]],
    [MovementCombination.UpDown, [
        // { from: MovementCombination.UpLeft, to: MovementCombination.Left, when: MovementEvent.KeyupW }, 
        // { from: MovementCombination.UpLeft, to: MovementCombination.Up, when: MovementEvent.KeyupA },
        // { from: MovementCombination.UpLeft, to: MovementCombination.UpLeftRight, when: MovementEvent.KeydownD },
        // { from: MovementCombination.UpLeft, to: MovementCombination.UpLeftDown, when: MovementEvent.KeydownS },
    ]],
    [MovementCombination.LeftRight, [
        // { from: MovementCombination.UpLeft, to: MovementCombination.Left, when: MovementEvent.KeyupW }, 
        // { from: MovementCombination.UpLeft, to: MovementCombination.Up, when: MovementEvent.KeyupA },
        // { from: MovementCombination.UpLeft, to: MovementCombination.UpLeftRight, when: MovementEvent.KeydownD },
        // { from: MovementCombination.UpLeft, to: MovementCombination.UpLeftDown, when: MovementEvent.KeydownS },
    ]],
    [MovementCombination.UpLeftDown, [
        // { from: MovementCombination.UpLeft, to: MovementCombination.Left, when: MovementEvent.KeyupW }, 
        // { from: MovementCombination.UpLeft, to: MovementCombination.Up, when: MovementEvent.KeyupA },
        // { from: MovementCombination.UpLeft, to: MovementCombination.UpLeftRight, when: MovementEvent.KeydownD },
        // { from: MovementCombination.UpLeft, to: MovementCombination.UpLeftDown, when: MovementEvent.KeydownS },
    ]],
    [MovementCombination.UpRightDown, [
        // { from: MovementCombination.UpLeft, to: MovementCombination.Left, when: MovementEvent.KeyupW }, 
        // { from: MovementCombination.UpLeft, to: MovementCombination.Up, when: MovementEvent.KeyupA },
        // { from: MovementCombination.UpLeft, to: MovementCombination.UpLeftRight, when: MovementEvent.KeydownD },
        // { from: MovementCombination.UpLeft, to: MovementCombination.UpLeftDown, when: MovementEvent.KeydownS },
    ]],
    [MovementCombination.DownLeftRight, [
        // { from: MovementCombination.UpLeft, to: MovementCombination.Left, when: MovementEvent.KeyupW }, 
        // { from: MovementCombination.UpLeft, to: MovementCombination.Up, when: MovementEvent.KeyupA },
        // { from: MovementCombination.UpLeft, to: MovementCombination.UpLeftRight, when: MovementEvent.KeydownD },
        // { from: MovementCombination.UpLeft, to: MovementCombination.UpLeftDown, when: MovementEvent.KeydownS },
    ]],
]);

type KeyEventType = "keydown" | "keyup";
type MovementKey = "w" | "a" | "s" | "d";

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

function comboToMove(combo: MovementCombination): Movement {
    switch (combo) {
        case MovementCombination.Up:
            return Movement.Up;
        case MovementCombination.UpRight:
            return Movement.UpRight;
        case MovementCombination.UpLeft:
            return Movement.UpLeft;
        case MovementCombination.UpLeftRight:
            return Movement.Up;
        case MovementCombination.UpLeftRightDown:
            return Movement.None;
        case MovementCombination.UpLeftDown:
            return Movement.Left;
        case MovementCombination.UpRightDown:
            return Movement.Right;
        case MovementCombination.DownLeftRight:
            return Movement.Down;
        case MovementCombination.Down:
            return Movement.Down;
        case MovementCombination.DownLeft:
            return Movement.DownLeft;
        case MovementCombination.DownRight:
            return Movement.DownRight;
        case MovementCombination.Left:
            return Movement.Left;
        case MovementCombination.Right:
            return Movement.Right;
    }
    return Movement.None;
}


function toMovementEvent(event: KeyboardEvent): MovementEvent {
    return KeyEventToMovemenEventMap.get(event.type).get(event.key) ?? MovementEvent.;
}

const movementTransition = stateTransitions(movementStateMachine);

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