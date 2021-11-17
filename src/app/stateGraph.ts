
// B needs to be "comparable"
interface Transition<A, B> {
    from: A;
    to: A;
    when: B;
}

interface StateTransitions<A, B> {
    from: A;
    transitions: Array<{ to: A, when: B }>
}

type StateGraph<A, B> = Map<A, StateTransitions<A, B>>;


function stateTransitions<A, B>(states: StateGraph<A, B>): (state: A, event: B) => A {
    return (state, event) => {
        return states.get(state)
            ?.transitions
            ?.find(transition => transition.when === event)
            ?.to
            ?? state;
    }
}


export { Transition, StateGraph, stateTransitions };