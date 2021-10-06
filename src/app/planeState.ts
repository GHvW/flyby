
// firing on mousedown

import { Observable, merge } from "rxjs";
import { map, scan, mapTo } from "rxjs/operators";
import { mousedown$, mouseup$ } from "./controlStreams";

// idle on mouseup and start
export type IDLE = "idle";
export type FIRING = "firing";


type PlaneState = FIRING | IDLE;


type MouseUp = "mouseup";
type MouseDown = "mousedown";


type PlaneStateMouseEvents = MouseUp | MouseDown;


type PlaneStateTransition = {
    from: PlaneState;
    to: PlaneState;
    when: PlaneStateMouseEvents;
}


type StateGraph = { 
    idle: PlaneStateTransition[], 
    firing: PlaneStateTransition[] 
};


function stateTransitions(states: StateGraph): (state: PlaneState, event: PlaneStateMouseEvents) => PlaneState {
    return (state, event) => {
        return states[state]
            ?.find(transition => transition.when === event)
            ?.to 
            ?? state;
    }
}


const states: StateGraph = {
    idle: [{ from: "idle", to: "firing", when: "mousedown" }],
    firing: [{ from: "firing", to: "idle", when: "mouseup" }],
};


// (state, event) => state
const firingTransition = stateTransitions(states);


const planeState$: Observable<PlaneState> =
    merge(
        mousedown$.pipe(mapTo<PlaneStateMouseEvents>("mousedown")), 
        mouseup$.pipe(mapTo<PlaneStateMouseEvents>("mouseup")))
        .pipe(
            scan(firingTransition, "idle")
        );


export { states, firingTransition, planeState$ };