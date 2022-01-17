
// firing on mousedown

import { Observable, merge } from "rxjs";
import { scan, mapTo } from "rxjs/operators";
import { mousedown$, mouseup$ } from "./controlStreams";
import { StateGraph, stateTransitions, Transition } from "./stateGraph";

// idle on mouseup and start
export type IDLE = "idle";
export type FIRING = "firing";


type PlaneState = FIRING | IDLE;


type MouseUp = "mouseup";
type MouseDown = "mousedown";


type PlaneStateMouseEvents = MouseUp | MouseDown;


const states: StateGraph<PlaneState, PlaneStateMouseEvents> = new Map([
    ["idle", { 
        from: "idle", transitions: [
            { to: "firing", when: "mousedown" }
        ]
    }],
    ["firing", { 
        from: "firing", transitions: [
            { to: "idle", when: "mouseup" }
        ]
    }],
]);

// (state, event) => state
const firingTransition = stateTransitions(states);


const planeState$: Observable<PlaneState> =
    merge(
        mousedown$.pipe(mapTo<PlaneStateMouseEvents>("mousedown")), 
        mouseup$.pipe(mapTo<PlaneStateMouseEvents>("mouseup")))
    .pipe(
        scan(firingTransition, "idle")
    );


export { states, firingTransition, planeState$, PlaneState };