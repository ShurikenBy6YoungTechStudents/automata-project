import React, { useState, useEffect } from "react";
import axios from "axios";

const NFAtoDFA = ({ transitions, start_state, end_states, states, symbols }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isDFAWarning, setIsDFAWarning] = useState(false);

  // Function to check if the automaton is a DFA
  const checkIfDFA = () => {
    // If no transitions, return false
    if (!transitions || Object.keys(transitions).length === 0) {
      return false;
    }

    // Check for epsilon transitions
    for (const state in transitions) {
      if (transitions[state]['ɛ'] && transitions[state]['ɛ'].length > 0) {
        return false; // Has epsilon transitions, so it's an NFA
      }
    }

    // Check for non-deterministic transitions (multiple destinations for a symbol)
    for (const state in transitions) {
      for (const symbol of symbols) {
        if (symbol === 'ɛ') continue; // Skip epsilon

        if (transitions[state][symbol] &&
            Array.isArray(transitions[state][symbol]) &&
            transitions[state][symbol].length > 1) {
          return false; // Multiple transitions for a symbol, so it's an NFA
        }
      }
    }

    // If we got here, it's likely a DFA
    return true;
  };

  // Check if input is a DFA whenever transitions or symbols change
  useEffect(() => {
    if (transitions && symbols) {
      const isDFA = checkIfDFA();
      setIsDFAWarning(isDFA);

      // Clear previous results when DFA is detected
      if (isDFA) {
        setResult(null);
        setImageData(null);
        setError(null);
        setImageError(null);
      }
    }
  }, [transitions, symbols]);



  const handleConvert = async () => {
    // Prevent conversion if input is already a DFA
    if (isDFAWarning) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setImageData(null);
    setImageError(null);

    try {
      const response = await axios.post("http://localhost:5000/api/convert-nfa-to-dfa", {
        transitions,
        symbols,
        start_state,
        end_states,
        states
      }, {
        timeout: 15000,
        headers: {
          "Content-Type": "application/json"
        }
      });

      console.log("NFA to DFA conversion response received:", response.data);
      setResult(response.data);

      // After successful conversion, generate the image for the resulting DFA
      if (response.data.success && response.data.dfa) {
        await generateDFAImage(response.data.dfa);
      }

    } catch (err) {
      console.error("Error converting NFA to DFA:", err);
      if (err.response) {
        setError(`Server error: ${err.response.data.error || err.response.statusText}`);
      } else if (err.request) {
        setError("Network error: Unable to reach the server");
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateDFAImage = async (dfaData) => {
    setIsGeneratingImage(true);
    setImageError(null);
    setImageData(null);

    try {
      const response = await axios.post("http://localhost:5000/api/generate-automaton-image", {
        transitions: dfaData.transitions,
        symbols: dfaData.symbols,
        start_state: dfaData.start_state,
        end_states: dfaData.end_states,
        states: dfaData.states
      }, {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json"
        }
      });

      console.log("DOT response received:", response.data);

      if (response.data.success && response.data.dot) {
        // Import Viz.js dynamically
        const { instance } = await import("@viz-js/viz");
        const viz = await instance();
        const svgString = viz.renderString(response.data.dot, { format: "svg" });
        setImageData(svgString);
      } else {
        throw new Error("Failed to generate DOT notation");
      }
    } catch (err) {
      console.error("Error generating DFA image:", err);
      setImageError(`Failed to generate DFA visualization: ${err.message}`);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const renderTransitions = (transitionsObj) => {
    if (!transitionsObj) return "None";
    
    return Object.entries(transitionsObj).map(([fromState, stateTransitions]) => (
      <div key={fromState} className="mb-2">
        <strong>{fromState}:</strong>
        <div className="ml-4">
          {Object.entries(stateTransitions).map(([symbol, toStates]) => (
            <div key={`${fromState}-${symbol}`}>
              {symbol} → {Array.isArray(toStates) ? toStates.join(", ") : toStates}
            </div>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">NFA to DFA Converter</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Input NFA:</h3>
        <div className="bg-gray-50 p-4 rounded border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>States:</strong> {states?.join(", ") || "None"}</p>
              <p><strong>Symbols:</strong> {symbols?.join(", ") || "None"}</p>
              <p><strong>Start State:</strong> {start_state || "None"}</p>
              <p><strong>End States:</strong> {end_states?.join(", ") || "None"}</p>
            </div>
            <div>
              <p><strong>Transitions:</strong></p>
              <div className="text-sm max-h-32 overflow-y-auto">
                {renderTransitions(transitions)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isDFAWarning && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <strong>Error:</strong> Can't convert to DFA. The automaton given above is already a DFA.
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleConvert}
        disabled={isLoading || !transitions || !start_state || !end_states || isDFAWarning}
        className="bg-[#1a365d] hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded mb-4"
      >
        {isLoading ? "Converting..." : "Convert NFA to DFA"}
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!isDFAWarning && result && result.success && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Conversion Result:</h3>

          {/* Conversion Info */}
          {result.conversion_info && (
            <div className="bg-blue-50 p-4 rounded border mb-4">
              <h4 className="font-semibold mb-2">Conversion Statistics:</h4>
              <p>Original NFA States: {result.conversion_info.original_nfa_states}</p>
              <p>Resulting DFA States: {result.conversion_info.resulting_dfa_states}</p>
              <p>Epsilon Transitions Removed: {result.conversion_info.epsilon_transitions_removed ? "Yes" : "No"}</p>
            </div>
          )}

          {/* Resulting DFA */}
          {result.dfa && (
            <div className="bg-green-50 p-4 rounded border mb-4">
              <h4 className="font-semibold mb-2">Resulting DFA:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>States:</strong> {result.dfa.states?.join(", ") || "None"}</p>
                  <p><strong>Symbols:</strong> {result.dfa.symbols?.join(", ") || "None"}</p>
                  <p><strong>Start State:</strong> {result.dfa.start_state || "None"}</p>
                  <p><strong>End States:</strong> {result.dfa.end_states?.join(", ") || "None"}</p>
                </div>
                <div>
                  <p><strong>Transitions:</strong></p>
                  <div className="text-sm max-h-32 overflow-y-auto">
                    {renderTransitions(result.dfa.transitions)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DFA Visualization */}
          <div className="mt-4">
            <h4 className="font-semibold mb-2">DFA Visualization:</h4>
            {isGeneratingImage && (
              <div className="text-blue-600">Generating DFA visualization...</div>
            )}
            {imageError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {imageError}
              </div>
            )}
            {imageData && (
              <div className="border rounded p-4 bg-white overflow-auto max-h-96">
                <div dangerouslySetInnerHTML={{ __html: imageData }} />
              </div>
            )}
          </div>
        </div>
      )}

      {!isDFAWarning && result && !result.success && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
          <strong>Conversion Failed:</strong> {result.error}
        </div>
      )}
    </div>
  );
};

export default NFAtoDFA;
