import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MultipleSelection from "./MultipleSeletion";
import SingleSelection from "./SingleSelection";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import Features from "./Features";

export default function NewAutomata() {
    const navigate = useNavigate();
    const [symbolsText, setSymbolsText] = useState("");
    const [symbols, setSymbols] = useState([]);
    const [statesText, setStatesText] = useState("");
    const [states, setStates] = useState([]);
    const [faName, setFaName] = useState("");
    const [startState, setStartState] = useState("");
    const [finalStates, setFinalStates] = useState([]);
    const [transitions, setTransitions] = useState({});
    const fa = {
        name: faName,
        states: states,
        symbols: symbols,
        start_state: startState,
        end_states: finalStates,
        transitions: transitions,
    };

    // Update transitions whenever states or symbols change
    useEffect(() => {
        const newTransitions = {};
        states.forEach((state) => {
            newTransitions[state] = {};
            symbols.forEach((symbol) => {
                newTransitions[state][symbol] = [];
            });
            // Always include epsilon transitions (empty by default)
            newTransitions[state]['ɛ'] = [];
        });
        setTransitions(newTransitions);
    }, [states, symbols]);
    
    const handleStatesChange = (e) => {
        const value = e.target.value;
        setStatesText(value);

        const arr = value.split(",").map(s => s.trim()).filter(Boolean);
        setStates(arr);
    };

    const handleSymbolsChange = (e) => {
        const value = e.target.value;
        setSymbolsText(value);

        const arr = value.split(",").map(s => s.trim()).filter(Boolean);
        setSymbols(arr);
    };


    const handleStartStateChange = (selectedStates) => {
        setStartState(selectedStates);
    };

    const handleFinalStatesChange = (selectedStates) => {
        setFinalStates(selectedStates);
    };


        const handleSave = () => {
        const payload = {
            automaton: {
                states,
                symbols,
                transitions,
                startState,
                finalStates
            }
        };

        axios.post("http://localhost:5000/api/save-automaton", payload)
            .then(res => {
                console.log("Saved:", res.data);
                navigate("/");
            })
            .catch(err => {
                console.error(err);
            });
    };
        return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4 text-center">Create New Automata</h1>
            <div className="flex justify-between items-end gap-10">
                <button
                    onClick={() => navigate('/')}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 w-32 flex items-center justify-center gap-2"
                >
                    <div className="flex items-center justify-content-evenly">
                        <ChevronLeftIcon className="mr-2 w-5 h-6 sm:w-5 text-white" />
                        <span className="ml-2">Back</span>
                    </div>
                </button>

                <div className="mb-0 w-full">
                    <label className="block mb-1 font-medium">FA Name</label>
                    <input
                    value={faName}
                    onChange={(e) => setFaName(e.target.value)}
                    type="text"
                    placeholder="Automata name"
                    className="w-full p-2 border rounded"
                    />
                </div>

                <button
                    onClick={handleSave}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-32"
                >
                    <div className="flex justify-around items-center">
                        <span>Save</span>
                    </div>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-4">
                <div>
                    <label className="block mb-1 font-medium">States (comma-separated)</label>
                    <input
                        placeholder="q0,q1,q2"
                        value={statesText}
                        onChange={handleStatesChange}
                        type="text"
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium">Symbols (comma-separated)</label>
                    <input
                        placeholder="0,1 (ɛ will be added automatically)"
                        value={symbolsText}
                        onChange={handleSymbolsChange}
                        type="text"
                        className="w-full p-2 border rounded"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                        Note: Epsilon (ɛ) transitions are automatically included for NFA support
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block mb-1 font-medium">Start State</label>
                    <SingleSelection 
                        options={states}
                        handleStartStateChange={handleStartStateChange}
                        initialState={startState}
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium">Final State</label>
                    <MultipleSelection
                        options={states}
                        handleEndStatesChange={handleFinalStatesChange}
                        initialSelect={finalStates}
                    />

                </div>
            </div>

            <div className="overflow-x-auto mb-4">
                <table className="min-w-full border">
                    <thead>
                        <tr>
                            <th className="border p-2">State</th>
                            {symbols.map(sym => (
                                <th key={sym} className="border p-2">{sym}</th>
                            ))}
                            <th className="border p-2">ɛ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {states.map(state => (
                            <tr key={state}>
                                <td className="border p-2">{state}</td>
                                {symbols.map(symbol => (
                                    <td key={`${state}-${symbol}`} className="border p-2">
                                        <MultipleSelection
                                            options={states}
                                            initialSelect={transitions[state]?.[symbol] || []}
                                            handleEndStatesChange={(selected) => {
                                                // Update transitions directly with array
                                                setTransitions((prev) => ({
                                                    ...prev,
                                                    [state]: {
                                                        ...prev[state],
                                                        [symbol]: selected,
                                                    },
                                                }));
                                            }}
                                        />
                                    </td>
                                ))}
                                <td key={`${state}-ɛ`} className="border p-2">
                                    <MultipleSelection
                                        options={states}
                                        initialSelect={transitions[state]?.['ɛ'] || []}
                                        handleEndStatesChange={(selected) => {
                                            // Update transitions directly with array
                                            setTransitions((prev) => ({
                                                ...prev,
                                                [state]: {
                                                    ...prev[state],
                                                    'ɛ': selected,
                                                },
                                            }));
                                        }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Debug display
                <div className="mt-4 p-2 bg-gray-100 rounded">
                    <pre className="text-sm">
                        {JSON.stringify(transitions, null, 2)}
                    </pre>
                </div> */}
            </div>
            <Features
                transitions={transitions}
                symbols={symbols}
                start_state={startState}
                end_states={finalStates}
                states={states}
                fa={fa}
            />
        </div>
    );
}
