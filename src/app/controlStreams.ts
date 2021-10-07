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

const movement$: Observable<Movement> = 
    fromEvent<KeyboardEvent>(document, "keydown")
        .pipe(
            filter(event => event.key === "w" || event.key === "a" || event.key === "s" || event.key === "d"),
            map(compose(keyToMovement, (event) => event.key))
        );

export { mousedown$, mouseup$, mouseDownAndUp$, mousePosition$, movement$ };