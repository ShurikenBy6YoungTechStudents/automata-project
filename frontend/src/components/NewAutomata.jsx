import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MultipleSelection from "./MultipleSeletion";
import SingleSelection from "./SingleSelection";
import { ArrowLeft, Save } from "lucide-react";
import Features from "./Features";
import Navbar from "./Navbar";

const NewAutomata = () => {
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

    const handleBack = () => {
        navigate(-1);
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


    const handleSave = async () => {
        // Add validation
        if (!faName.trim()) {
            alert("Please enter a name for the automaton");
            return;
        }
        
        if (states.length === 0) {
            alert("Please add at least one state");
            return;
        }
        
        if (symbols.length === 0) {
            alert("Please add at least one symbol");
            return;
        }
        
        if (!startState) {
            alert("Please select a start state");
            return;
        }
        
        if (finalStates.length === 0) {
            alert("Please select at least one final state");
            return;
        }

        const payload = {
            name: faName, // Changed from automaton object to individual fields
            states,
            symbols,
            startState,
            finalStates,
            transitions
        };

        try {
            const response = await axios.post("http://localhost:5000/api/save-automaton", payload);
            if (response.data.success) {
                console.log("Saved:", response.data);
                alert("Automaton saved successfully!");
                navigate("/");
            } else {
                alert("Failed to save automaton: " + response.data.error);
            }
        } catch (err) {
            console.error("Error saving automaton:", err);
            alert("Failed to save automaton. Please try again.");
        }
    };
        return (
                <div className="max-w-6xl mx-auto p-6">
                    <h1 className="text-2xl font-bold mb-4 text-center">Create New Automata</h1>
                    <div className="flex justify-between items-end gap-10 mb-6">
                        <button
                            onClick={handleBack}
                            className="bg-blue-950/95 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-950 transition-colors min-w-[120px] justify-center"
                        >
                            <ArrowLeft size={16} />
                            <span>Back</span>
                        </button>

                        <div className="flex-1 mx-4">
                            <label className="block mb-1 font-medium text-gray-700">FA Name</label>
                            <input
                                value={faName}
                                onChange={(e) => setFaName(e.target.value)}
                                type="text"
                                placeholder="Enter automata name"
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            className="bg-[#1a365d] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#153e75] transition-colors min-w-[120px] justify-center"
                        >
                            <Save size={16} />
                            <span>Save</span>
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
                                Note: Epsilon (ɛ) column is available for NFA transitions. System automatically detects DFA/NFA type.
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

export default NewAutomata;
