import React, { useState } from 'react';
import axios from 'axios';

const Features = ({ transitions, symbols, start_state, end_states, states }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const checkDFAorNFA = async () => {
        setIsLoading(true);
        setError(null);
        
        // Log the data being sent
        console.log("Sending data:", {
            transitions,
            symbols,
            start_state,
            end_states,
            states
        });

        try {
            const response = await axios.post("http://localhost:5000/api/check-fa-type", {
                transitions,
                symbols,
                start_state,
                end_states,
                states
            }, {
                // Add timeout and headers
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("Response received:", response.data);
            setResult(response.data);
            
        } catch (err) {
            console.error("Detailed error:", err);
            
            if (err.code === 'ECONNREFUSED') {
                setError('Cannot connect to server. Please ensure the backend is running.');
            } else if (err.code === 'ETIMEDOUT') {
                setError('Request timed out. Please try again.');
            } else {
                setError(`Failed to check FA type: ${err.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-7">
            <h2 className="text-black text-xl md:text-2xl lg:text-3xl font-bold">Features</h2>
            <div className="p-2 my-2 grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 shadow">
                    <h3 className="font-semibold mb-2">Check DFA/NFA</h3>
                    <button 
                        onClick={checkDFAorNFA}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Checking...' : 'Check Type'}
                    </button>
                    {result && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                            <p className="font-medium">Type: {result.type}</p>
                        </div>
                    )}
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 rounded-lg">
                            <p className="text-red-600">{error}</p>
                            <button 
                                onClick={() => setError(null)}
                                className="text-sm text-red-500 hover:text-red-700 mt-2"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Features;