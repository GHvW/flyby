import { fromEvent, merge, Observable } from "rxjs";
import { map, mapTo } from "rxjs/operators";

import { Coordinate } from "./coordinate";

const mousePosition$: Observable<Coordinate> =
    fromEvent<MouseEvent>(document, "mousemove")
        .pipe(
            map((event: MouseEvent) => {
                return {
                    x: event.clientX,
                    y: event.clientY
                };
            }));
        // .subscribe(event => console.log(`the event:`, event));


const mousedown$ = fromEvent<MouseEvent>(document, "mousedown");
const mouseup$ = fromEvent<MouseEvent>(document, "mouseup");

const mouseDownAndUp$ = merge(mousedown$, mouseup$);

export { mousedown$, mouseup$, mouseDownAndUp$, mousePosition$ }