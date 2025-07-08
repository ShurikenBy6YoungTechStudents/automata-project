/**
 * Generates DOT notation for finite automaton visualization
 * @param {Object} automatonData - The automaton data
 * @param {Object} automatonData.transitions - State transitions
 * @param {string} automatonData.start_state - Start state
 * @param {Array} automatonData.end_states - Final states
 * @param {Array} automatonData.states - All states
 * @param {Array} automatonData.symbols - Input symbols
 * @returns {string} DOT notation string
 */
export function generateAutomatonDOT({ transitions, start_state, end_states, states, symbols }) {
    console.log('Generating DOT for:', { transitions, start_state, end_states, states, symbols });

    let dot = 'digraph FiniteAutomaton {\n';
    dot += '  rankdir=LR;\n';
    dot += '  size="8,5";\n';
    dot += '  node [shape = circle];\n\n';

    // Add invisible start node for arrow pointing to start state
    dot += '  start [shape=point, style=invis];\n';
    dot += `  start -> "${start_state}" [label="start"];\n\n`;

    // Define final states with double circles
    if (end_states && end_states.length > 0) {
        for (const state of end_states) {
            dot += `  "${state}" [shape = doublecircle];\n`;
        }
    }

    // Define regular states
    if (states && states.length > 0) {
        for (const state of states) {
            if (!end_states || !end_states.includes(state)) {
                dot += `  "${state}" [shape = circle];\n`;
            }
        }
    }
    dot += '\n';

    // Add transitions
    const transitionMap = new Map();

    for (const [fromState, stateTransitions] of Object.entries(transitions)) {
        for (const [symbol, toStates] of Object.entries(stateTransitions)) {
            if (toStates && toStates.length > 0) {
                for (const toState of toStates) {
                    const key = `${fromState}->${toState}`;
                    if (!transitionMap.has(key)) {
                        transitionMap.set(key, []);
                    }
                    transitionMap.get(key).push(symbol);
                }
            }
        }
    }

    // Generate transition edges with combined labels
    for (const [transition, symbols] of transitionMap.entries()) {
        const [fromState, toState] = transition.split('->');
        const label = symbols.join(', ');

        // Handle self-loops differently for better visualization
        if (fromState === toState) {
            dot += `  "${fromState}" -> "${toState}" [label="${label}"];\n`;
        } else {
            dot += `  "${fromState}" -> "${toState}" [label="${label}"];\n`;
        }
    }

    dot += '}\n';
    console.log('Generated DOT:', dot);
    return dot;
}
