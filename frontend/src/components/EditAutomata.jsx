import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import axios from 'axios';

// Import the same components used in NewAutomata
import MultipleSelection from './MultipleSeletion';
import SingleSelection from './SingleSelection';
import Features from './Features';

export default function EditAutomata() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // State variables (same as NewAutomata)
    const [loading, setLoading] = useState(true);
    const [faName, setFaName] = useState("");
    const [states, setStates] = useState([]);
    const [symbols, setSymbols] = useState([]);
    const [startState, setStartState] = useState("");
    const [finalStates, setFinalStates] = useState([]);
    const [transitions, setTransitions] = useState({});

    useEffect(() => {
        const fetchAutomaton = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/api/automaton/${id}`);
                if (response.data.success) {
                    const automaton = response.data.automaton;
                    setFaName(automaton.name);
                    setStates(automaton.states);
                    setSymbols(automaton.symbols);
                    setStartState(automaton.start_state);
                    setFinalStates(automaton.end_states);
                    setTransitions(automaton.transitions);
                } else {
                    alert("Failed to load automaton");
                    navigate("/");
                }
            } catch (err) {
                console.error("Error fetching automaton:", err);
                alert("Failed to load automaton");
                navigate("/");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchAutomaton();
        }
    }, [id, navigate]);

    const handleUpdate = async () => {
        if (!faName.trim()) {
            alert("Please enter a name for the automaton");
            return;
        }

        // Validate transitions completeness
        const isTransitionsComplete = states.every(state => 
            symbols.every(symbol => 
                Array.isArray(transitions[state]?.[symbol])
            ) && Array.isArray(transitions[state]?.['ɛ'])
        );
        
        if (!isTransitionsComplete) {
            alert("Please complete all transition entries");
            return;
        }

        const payload = {
            name: faName,
            states,
            symbols,
            startState,
            finalStates,
            transitions
        };

        try {
            const response = await axios.put(`http://localhost:5000/api/automaton/${id}`, payload);
            if (response.data.success) {
                alert("Automaton updated successfully!");
                navigate("/");
            } else {
                alert("Failed to update automaton: " + response.data.error);
            }
        } catch (err) {
            console.error("Error updating automaton:", err);
            alert("Failed to update automaton. Please try again.");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this automaton? This action cannot be undone.")) {
            return;
        }

        try {
            const response = await axios.delete(`http://localhost:5000/api/automaton/${id}`);
            if (response.data.success) {
                alert("Automaton deleted successfully!");
                navigate("/");
            } else {
                alert("Failed to delete automaton: " + response.data.error);
            }
        } catch (err) {
            console.error("Error deleting automaton:", err);
            alert("Failed to delete automaton. Please try again.");
        }
    };

    // Event handlers for updating states and symbols
    const handleStatesChange = (e) => {
        const value = e.target.value;
        const arr = value.split(",").map(s => s.trim()).filter(Boolean);
        setStates(arr);
    };

    const handleSymbolsChange = (e) => {
        const value = e.target.value;
        const arr = value.split(",").map(s => s.trim()).filter(Boolean);
        setSymbols(arr);
    };

    const handleStartStateChange = (selected) => {
        setStartState(selected);
    };

    const handleFinalStatesChange = (selected) => {
        setFinalStates(selected);
    };

    // Update transitions when states or symbols change
    useEffect(() => {
        if (states.length > 0 && symbols.length > 0) {
            const newTransitions = {};
            states.forEach((state) => {
                newTransitions[state] = {};
                symbols.forEach((symbol) => {
                    newTransitions[state][symbol] = transitions[state]?.[symbol] || [];
                });
                newTransitions[state]['ɛ'] = transitions[state]?.['ɛ'] || [];
            });
            setTransitions(newTransitions);
        }
    }, [states, symbols]);

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="text-center">Loading automaton...</div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4 text-center">Edit Automata</h1>
            
            <div className="flex justify-between items-end gap-10">
                <button
                    onClick={() => navigate('/')}
                    className="bg-[#1a365d] text-white px-4 py-2 rounded hover:bg-blue-600 w-32 flex items-center justify-center gap-2 hover:scale-105 transition ease-in-out"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
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

                <div className="flex gap-2">
                    <button
                        onClick={handleUpdate}
                        className="bg-[#1a365d] text-white px-4 py-2 rounded hover:bg-blue-600 w-32 flex items-center justify-center gap-2 hover:scale-105 transition ease-in-out"
                    >
                        <Save className="w-4 h-4" />
                        <span>Update</span>
                    </button>
                    
                    <button
                        onClick={handleDelete}
                        className="bg-[#FF4438] text-white px-4 py-2 rounded hover:bg-red-600 w-32 flex items-center justify-center gap-2 hover:scale-105 transition ease-in-out"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-4">
                <div>
                    <label className="block mb-1 font-medium">States (comma-separated)</label>
                    <input
                        placeholder="q0,q1,q2"
                        value={states.join(',')}
                        onChange={handleStatesChange}
                        type="text"
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium">Symbols (comma-separated)</label>
                    <input
                        placeholder="0,1 (ɛ will be added automatically)"
                        value={symbols.join(',')}
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
            </div>

            <Features
                transitions={transitions}
                symbols={symbols}
                start_state={startState}
                end_states={finalStates}
                states={states}
                fa={{
                    name: faName,
                    states: states,
                    symbols: symbols,
                    start_state: startState,
                    end_states: finalStates,
                    transitions: transitions,
                }}
            />
        </div>
    );
}


