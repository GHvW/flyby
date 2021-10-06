
// firing on mousedown
// idle on mouseup and start
export type IDLE = "idle";
export type FIRING = "firing";


type PlaneState = FIRING | IDLE;


const stateTransitions = (states: StateGraph) => (state: PlaneState, event: PlaneStateMouseEvents) => {
    return states[state]
        ?.find(transition => transition.when === event)
        ?.to 
        ?? state;
}

type MouseUp = "mouseup";
type MousteDown = "mousedown";

type PlaneStateMouseEvents = MouseUp | MousteDown;

type PlaneStateTransition = {
    from: PlaneState;
    to: PlaneState;
    when: PlaneStateMouseEvents;
}

type StateGraph = { idle: PlaneStateTransition[], firing: PlaneStateTransition[] };

const states: StateGraph = {
    idle: [{ from: "idle", to: "firing", when: "mousedown" }],
    firing: [{ from: "firing", to: "idle", when: "mouseup" }],
};


// (state, event) => state
const firingTransition = stateTransitions(states);

export { states, firingTransition };