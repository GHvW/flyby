import { fromEvent, merge, NotFoundError, Observable } from "rxjs";
import { map, filter, scan } from "rxjs/operators";

import { Coordinate } from "./coordinate";
import { StateGraph, stateTransitions } from "./stateGraph";
import { compose } from "./utils/funkyStuff";


enum MovementEvent {
    KeyupUp,
    KeyupLeft,
    KeyupDown,
    KeyupRight,
    KeydownUp,
    KeydownLeft,
    KeydownDown,
    KeydownRight,
    None
}


enum MoveKeyCombo {
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


// substet of MoveKeyCombo
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


function isMovementKey(keys: Set<string>): (k: KeyboardEvent) => boolean {
    return (k) => keys.has(k.key);
}


const movementForNow = new Set(["w", "a", "s", "d"]);

// type MovementKey = "w" | "a" | "s" | "d";

const movementDownEventMap = new Map<string, MovementEvent>([
    ["w", MovementEvent.KeydownUp],
    ["a", MovementEvent.KeydownLeft],
    ["s", MovementEvent.KeydownDown],
    ["d", MovementEvent.KeydownRight],
]);

const movementUpEventMap = new Map<string, MovementEvent>([
    ["w", MovementEvent.KeyupUp],
    ["a", MovementEvent.KeyupLeft],
    ["s", MovementEvent.KeyupDown],
    ["d", MovementEvent.KeyupRight],
]);


const keySetOf = <A, B>(map: Map<A, B>) => new Set(map.keys());


const movementKeyDown$: Observable<MovementEvent> = 
    fromEvent<KeyboardEvent>(document, "keydown")
        .pipe(
            filter(isMovementKey(movementForNow)),
            map(x => movementDownEventMap.get(x.key) || MovementEvent.None));


const movementKeyUp$: Observable<MovementEvent> = 
    fromEvent<KeyboardEvent>(document, "keyup")
        .pipe(
            filter(isMovementKey(movementForNow)),
            map(x => movementDownEventMap.get(x.key) || MovementEvent.None));


const movementStateGraph: StateGraph<MoveKeyCombo, MovementEvent> = new Map([
    [MoveKeyCombo.None, {
        from: MoveKeyCombo.None, transitions: [
            { to: MoveKeyCombo.Down, when: MovementEvent.KeydownDown },
            { to: MoveKeyCombo.Up, when: MovementEvent.KeydownUp },
            { to: MoveKeyCombo.Right, when: MovementEvent.KeydownRight },
            { to: MoveKeyCombo.Left, when: MovementEvent.KeydownLeft }
        ]
    }],
    [MoveKeyCombo.UpLeft, {
        from: MoveKeyCombo.UpLeft, transitions: [
            { to: MoveKeyCombo.Left, when: MovementEvent.KeyupUp },
            { to: MoveKeyCombo.Up, when: MovementEvent.KeyupLeft },
            { to: MoveKeyCombo.UpLeftRight, when: MovementEvent.KeydownRight },
            { to: MoveKeyCombo.UpLeftDown, when: MovementEvent.KeydownDown }
        ]
    }],
    [MoveKeyCombo.UpRight, {
        from: MoveKeyCombo.UpRight, transitions: [
            { to: MoveKeyCombo.Right, when: MovementEvent.KeyupUp },
            { to: MoveKeyCombo.Up, when: MovementEvent.KeyupRight },
            { to: MoveKeyCombo.UpRightDown, when: MovementEvent.KeydownDown },
            { to: MoveKeyCombo.UpLeftRight, when: MovementEvent.KeydownLeft }
        ]
    }],
    [MoveKeyCombo.DownRight, {
        from: MoveKeyCombo.DownRight, transitions: [
            { to: MoveKeyCombo.Down, when: MovementEvent.KeyupRight },
            { to: MoveKeyCombo.Right, when: MovementEvent.KeyupDown },
            { to: MoveKeyCombo.DownLeftRight, when: MovementEvent.KeydownLeft },
            { to: MoveKeyCombo.UpRightDown, when: MovementEvent.KeydownUp },
        ]
    }],
    [MoveKeyCombo.DownLeft, {
        from: MoveKeyCombo.DownLeft, transitions: [
            { to: MoveKeyCombo.Left, when: MovementEvent.KeyupDown },
            { to: MoveKeyCombo.Down, when: MovementEvent.KeyupLeft },
            { to: MoveKeyCombo.UpLeftDown, when: MovementEvent.KeydownUp },
            { to: MoveKeyCombo.DownLeftRight, when: MovementEvent.KeydownRight },
        ]
    }],
    [MoveKeyCombo.Up, {
        from: MoveKeyCombo.Up, transitions: [
            { to: MoveKeyCombo.None, when: MovementEvent.KeyupUp },
            { to: MoveKeyCombo.UpLeft, when: MovementEvent.KeydownLeft },
            { to: MoveKeyCombo.UpRight, when: MovementEvent.KeydownRight },
            { to: MoveKeyCombo.UpDown, when: MovementEvent.KeydownDown },
        ]
    }],
    [MoveKeyCombo.Left, {
        from: MoveKeyCombo.Left, transitions: [
            { to: MoveKeyCombo.None, when: MovementEvent.KeyupLeft },
            { to: MoveKeyCombo.UpLeft, when: MovementEvent.KeydownUp },
            { to: MoveKeyCombo.DownLeft, when: MovementEvent.KeydownDown },
            { to: MoveKeyCombo.LeftRight, when: MovementEvent.KeydownRight },
        ]
    }],
    [MoveKeyCombo.Down, {
        from: MoveKeyCombo.Down, transitions: [
            { to: MoveKeyCombo.None, when: MovementEvent.KeyupDown },
            { to: MoveKeyCombo.DownRight, when: MovementEvent.KeydownRight },
            { to: MoveKeyCombo.DownLeft, when: MovementEvent.KeydownLeft },
            { to: MoveKeyCombo.UpDown, when: MovementEvent.KeydownUp },
        ]
    }],
    [MoveKeyCombo.Right, {
        from: MoveKeyCombo.Right, transitions: [
            { to: MoveKeyCombo.None, when: MovementEvent.KeyupRight },
            { to: MoveKeyCombo.UpRight, when: MovementEvent.KeydownUp },
            { to: MoveKeyCombo.DownRight, when: MovementEvent.KeydownDown },
            { to: MoveKeyCombo.LeftRight, when: MovementEvent.KeydownLeft },
        ]
    }],
    [MoveKeyCombo.UpLeftRight, {
        from: MoveKeyCombo.UpLeftRight, transitions: [
            { to: MoveKeyCombo.LeftRight, when: MovementEvent.KeyupUp }, 
            { to: MoveKeyCombo.UpRight, when: MovementEvent.KeyupLeft },
            { to: MoveKeyCombo.UpLeft, when: MovementEvent.KeydownRight },
            { to: MoveKeyCombo.UpLeftRightDown, when: MovementEvent.KeydownDown },
        ]
    }],
    [MoveKeyCombo.UpLeftRightDown, {
        from: MoveKeyCombo.UpLeftRightDown, transitions: [
            { to: MoveKeyCombo.DownLeftRight, when: MovementEvent.KeyupUp }, 
            { to: MoveKeyCombo.UpRightDown, when: MovementEvent.KeyupLeft },
            { to: MoveKeyCombo.UpLeftDown, when: MovementEvent.KeyupRight },
            { to: MoveKeyCombo.UpLeftRight, when: MovementEvent.KeyupDown },
        ]
    }],
    [MoveKeyCombo.UpDown, {
        from: MoveKeyCombo.UpDown, transitions: [
            { to: MoveKeyCombo.Down , when: MovementEvent.KeyupUp }, 
            { to: MoveKeyCombo.Up, when: MovementEvent.KeyupDown },
            { to: MoveKeyCombo.UpLeftDown, when: MovementEvent.KeydownLeft },
            { to: MoveKeyCombo.UpRightDown, when: MovementEvent.KeydownRight },
        ]
    }],
    // [MoveKeyCombo.LeftRight, [
    //     // { from: MoveKeyCombo.UpLeft, to: MoveKeyCombo.Left, when: MovementEvent.KeyupUp }, 
    //     // { from: MoveKeyCombo.UpLeft, to: MoveKeyCombo.Up, when: MovementEvent.KeyupLeft },
    //     // { from: MoveKeyCombo.UpLeft, to: MoveKeyCombo.UpLeftRight, when: MovementEvent.KeydownD },
    //     // { from: MoveKeyCombo.UpLeft, to: MoveKeyCombo.UpLeftDown, when: MovementEvent.KeydownS },
    // ]],
    // [MoveKeyCombo.UpLeftDown, [
    //     // { from: MoveKeyCombo.UpLeft, to: MoveKeyCombo.Left, when: MovementEvent.KeyupUp }, 
    //     // { from: MoveKeyCombo.UpLeft, to: MoveKeyCombo.Up, when: MovementEvent.KeyupLeft },
    //     // { from: MoveKeyCombo.UpLeft, to: MoveKeyCombo.UpLeftRight, when: MovementEvent.KeydownD },
    //     // { from: MoveKeyCombo.UpLeft, to: MoveKeyCombo.UpLeftDown, when: MovementEvent.KeydownS },
    // ]],
    // [MoveKeyCombo.UpRightDown, [
    //     // { from: MoveKeyCombo.UpLeft, to: MoveKeyCombo.Left, when: MovementEvent.KeyupUp }, 
    //     // { from: MoveKeyCombo.UpLeft, to: MoveKeyCombo.Up, when: MovementEvent.KeyupLeft },
    //     // { from: MoveKeyCombo.UpLeft, to: MoveKeyCombo.UpLeftRight, when: MovementEvent.KeydownD },
    //     // { from: MoveKeyCombo.UpLeft, to: MoveKeyCombo.UpLeftDown, when: MovementEvent.KeydownS },
    // ]],
    // [MoveKeyCombo.DownLeftRight, [
    //     // { from: MoveKeyCombo.UpLeft, to: MoveKeyCombo.Left, when: MovementEvent.KeyupUp }, 
    //     // { from: MoveKeyCombo.UpLeft, to: MoveKeyCombo.Up, when: MovementEvent.KeyupLeft },
    //     // { from: MoveKeyCombo.UpLeft, to: MoveKeyCombo.UpLeftRight, when: MovementEvent.KeydownD },
    //     // { from: MoveKeyCombo.UpLeft, to: MoveKeyCombo.UpLeftDown, when: MovementEvent.KeydownS },
    // ]],
]);


function comboToMove(combo: MoveKeyCombo): Movement {
    switch (combo) {
        case MoveKeyCombo.Up:
            return Movement.Up;
        case MoveKeyCombo.UpRight:
            return Movement.UpRight;
        case MoveKeyCombo.UpLeft:
            return Movement.UpLeft;
        case MoveKeyCombo.UpLeftRight:
            return Movement.Up;
        case MoveKeyCombo.UpLeftRightDown:
            return Movement.None;
        case MoveKeyCombo.UpLeftDown:
            return Movement.Left;
        case MoveKeyCombo.UpRightDown:
            return Movement.Right;
        case MoveKeyCombo.DownLeftRight:
            return Movement.Down;
        case MoveKeyCombo.Down:
            return Movement.Down;
        case MoveKeyCombo.DownLeft:
            return Movement.DownLeft;
        case MoveKeyCombo.DownRight:
            return Movement.DownRight;
        case MoveKeyCombo.Left:
            return Movement.Left;
        case MoveKeyCombo.Right:
            return Movement.Right;
    }
    return Movement.None;
}


const movementMachine: (mkc: MoveKeyCombo, me: MovementEvent) => MoveKeyCombo = stateTransitions(movementStateGraph);


// NOTE ************ might need to window last movekeycombo with next one to know what to do ***************
const movement$ =
    merge(movementKeyDown$, movementKeyUp$) // KeyEvents
        .pipe(
            scan(movementMachine, MoveKeyCombo.None), // state machine over movementcombinations
            // bufferCount(2, 1) get buffers of [combo, combo] that slide [1, 2] -> [2, 3] -> [3, 4]
            map(comboToMove) // map to actual on screen movement direction
        );


export { mousedown$, mouseup$, mouseDownAndUp$, mousePosition$, movement$, Movement };