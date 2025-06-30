import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MultipleSelection from "./MultipleSeletion";
import SingleSelection from "./SingleSelection";

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

    // Update transitions whenever states or symbols change
    useEffect(() => {
        const newTransitions = {};
        states.forEach((state) => {
            newTransitions[state] = {};
            symbols.forEach((symbol) => {
                newTransitions[state][symbol] = [];
            });
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


    const handleStartStateChange = (e) => {
        setStartState(e.target.value);
    };

    const handleFinalStatesChange = (selectedStates) => {
        setFinalStates(selectedStates);
    };

    const handleTransitionChange = (state, symbol, value) => {
        const arr = value.split(",").map(s => s.trim()).filter(Boolean);
        setTransitions(prev => ({
            ...prev,
            [state]: {
                ...prev[state],
                [symbol]: arr
            }
        }));
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

            <div className="mb-4">
                <label className="block mb-1 font-medium">FA Name</label>
                <input
                    value={faName}
                    onChange={(e) => setFaName(e.target.value)}
                    type="text"
                    placeholder="Automata name"
                    className="w-full p-2 border rounded"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                        placeholder="0,1"
                        value={symbolsText}
                        onChange={handleSymbolsChange}
                        type="text"
                        className="w-full p-2 border rounded"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block mb-1 font-medium">Start State</label>
                    <select
                        value={startState}
                        onChange={handleStartStateChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Select</option>
                        {states.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
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
                                            value={transitions[state]?.[symbol]?.join(",") || ""}
                                            onChange={(e) =>
                                                handleTransitionChange(state, symbol, e.target.value)
                                            }
                                            className="w-full p-1 border rounded"
                                            placeholder="e.g. q1,q2"
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between">
                <button
                    onClick={() => navigate('/')}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                    Back
                </button>

                <button
                    onClick={handleSave}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Save
                </button>
            </div>
        </div>
    );
}
