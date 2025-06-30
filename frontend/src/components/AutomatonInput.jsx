import React, { useState } from 'react';
import axios from 'axios';

export default function AutomatonInput() {
    const [states, setStates] = useState(['q0', 'q1', 'q2']);
    const [symbols, setSymbols] = useState(['0', '1']);
    const [transitions, setTransitions] = useState({
        q0: { '0': [], '1': [] },
        q1: { '0': [], '1': [] },
        q2: { '0': [], '1': [] }
    });
    const [startState, setStartState] = useState('q0');
    const [finalStates, setFinalStates] = useState([]);
    const [testString, setTestString] = useState('');

    const handleTestDeterministic = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/test-deterministic', {
                states,
                transitions
            });
            alert(response.data.isDeterministic ? 'DFA' : 'NFA');
        } catch (error) {
            console.error('Error:', error);
            alert('Error testing automaton');
        }
    };

    const handleTestString = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/test-string', {
                input: testString,
                automaton: {
                    states,
                    symbols,
                    transitions,
                    startState,
                    finalStates
                }
            });
            alert(response.data.isAccepted ? 'Accepted' : 'Rejected');
        } catch (error) {
            console.error('Error:', error);
            alert('Error testing string');
        }
    };

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Automata Theory Tool</h1>
            
            {/* States Display */}
            <div className="mb-4">
                <h2 className="text-lg font-semibold">States: {states.join(', ')}</h2>
            </div>

            {/* Transition Table */}
            <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Transition Table</h2>
                <table className="w-full border-collapse border">
                    <thead>
                        <tr>
                            <th className="border p-2">State</th>
                            {symbols.map(symbol => (
                                <th key={symbol} className="border p-2">{symbol}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {states.map(state => (
                            <tr key={state}>
                                <td className="border p-2">{state}</td>
                                {symbols.map(symbol => (
                                    <td key={`${state}-${symbol}`} className="border p-2">
                                        <input
                                            type="text"
                                            className="w-full p-1 border rounded"
                                            value={transitions[state][symbol].join(',')}
                                            onChange={(e) => {
                                                const newTransitions = {...transitions};
                                                newTransitions[state][symbol] = e.target.value.split(',').map(s => s.trim());
                                                setTransitions(newTransitions);
                                            }}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded">
                    <h3 className="font-bold mb-2">Test if DFA/NFA</h3>
                    <button 
                        onClick={handleTestDeterministic}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Test
                    </button>
                </div>

                <div className="p-4 border rounded">
                    <h3 className="font-bold mb-2">Test String</h3>
                    <input 
                        type="text"
                        value={testString}
                        onChange={(e) => setTestString(e.target.value)}
                        className="w-full p-2 border rounded mb-2"
                        placeholder="Enter string to test"
                    />
                    <button 
                        onClick={handleTestString}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Test
                    </button>
                </div>
            </div>
        </div>
    );
}