import { fromEvent, merge, Observable } from "rxjs";
import { map, filter, scan } from "rxjs/operators";

import { Coordinate } from "./coordinate";
import { StateGraph, stateTransitions } from "./stateGraph";


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

const movementKeyDown$ = fromEvent<KeyboardEvent>(document, "keydown");
const movementKeyUp$ = fromEvent<KeyboardEvent>(document, "keyup");


const movementStateMachine: StateGraph<MovementCombination, MovementEvent> = new Map([
    [MovementCombination.UpLeft, [
        { from: MovementCombination.UpLeft, to: MovementCombination.Left, when: MovementEvent.KeyupW }, 
        { from: MovementCombination.UpLeft, to: MovementCombination.Up, when: MovementEvent.KeyupA },
        { from: MovementCombination.UpLeft, to: MovementCombination.UpLeftRight, when: MovementEvent.KeydownD },
        { from: MovementCombination.UpLeft, to: MovementCombination.UpLeftDown, when: MovementEvent.KeydownS },
    ]],
    [MovementCombination.None, [
        { from: MovementCombination.None, to: MovementCombination.Down, when: MovementEvent.KeydownS }, 
        { from: MovementCombination.None, to: MovementCombination.Up, when: MovementEvent.KeydownW },
        { from: MovementCombination.None, to: MovementCombination.Right, when: MovementEvent.KeydownD }, 
        { from: MovementCombination.None, to: MovementCombination.Left, when: MovementEvent.KeydownA },
    ]],
    [MovementCombination.UpRight, [
        { from: MovementCombination.UpRight, to: MovementCombination.Right, when: MovementEvent.KeyupW }, 
        { from: MovementCombination.UpRight, to: MovementCombination.Up, when: MovementEvent.KeyupD },
        { from: MovementCombination.UpRight, to: MovementCombination.UpLeftRight, when: MovementEvent.KeydownA },
        { from: MovementCombination.UpRight, to: MovementCombination.UpRightDown, when: MovementEvent.KeydownS },
    ]],
    [MovementCombination.DownRight, [
        { from: MovementCombination.DownRight, to: MovementCombination.Down, when: MovementEvent.KeyupD }, 
        { from: MovementCombination.DownRight, to: MovementCombination.Right, when: MovementEvent.KeyupS },
        { from: MovementCombination.DownRight, to: MovementCombination.DownLeftRight, when: MovementEvent.KeydownA },
        { from: MovementCombination.DownRight, to: MovementCombination.UpRightDown, when: MovementEvent.KeydownW },
    ]],
    [MovementCombination.DownLeft, [
        { from: MovementCombination.DownLeft, to: MovementCombination.Left, when: MovementEvent.KeyupS }, 
        { from: MovementCombination.DownLeft, to: MovementCombination.Down, when: MovementEvent.KeyupA },
        { from: MovementCombination.DownLeft, to: MovementCombination.DownLeftRight, when: MovementEvent.KeydownD },
        { from: MovementCombination.DownLeft, to: MovementCombination.UpLeftDown, when: MovementEvent.KeydownW },
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
    const key = event.key;
    const type = event.type;
    switch (type) {
        case "keydown": 
            switch (key) {
                case "w": 
                    return MovementEvent.KeydownW;
                case "a": 
                    return MovementEvent.KeydownA
                case "s": 
                    return MovementEvent.KeydownS;
                case "d": 
                    return MovementEvent.KeydownD;
                default:
                    return MovementEvent.None;
            }
        case "keyup": 
            switch (key) {
                case "w": 
                    return MovementEvent.KeyupW;
                case "a": 
                    return MovementEvent.KeyupA;
                case "s": 
                    return MovementEvent.KeyupS;
                case "d": 
                    return MovementEvent.KeyupD;
                default:
                    return MovementEvent.None;
            }
        default:
            return MovementEvent.None;
    }
}

const movementTransition = stateTransitions(movementStateMachine);

const movement$ =
    merge(movementKeyDown$, movementKeyUp$)
            .pipe(
                map(toMovementEvent),
                scan(movementTransition, MovementCombination.None),
                map(comboToMove)
            );


export { mousedown$, mouseup$, mouseDownAndUp$, mousePosition$, movement$, Movement };