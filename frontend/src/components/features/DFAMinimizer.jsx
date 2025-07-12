import React, { useState } from "react";
import axios from "axios";

const DFAMinimizer = ({ transitions, start_state, end_states, states, symbols }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const handleMinimize = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setImageData(null);
    setImageError(null);

    try {
      // Check if there are any epsilon transitions
      let hasEpsilonTransitions = false;
      for (const state in transitions) {
        if (transitions[state]['ɛ'] && transitions[state]['ɛ'].length > 0) {
          hasEpsilonTransitions = true;
          break;
        }
      }

      // Only include epsilon in symbols if there are actual epsilon transitions
      const symbolsToSend = hasEpsilonTransitions ? 
        (symbols.includes('ɛ') ? symbols : [...symbols, 'ɛ']) : 
        symbols.filter(s => s !== 'ɛ');

      const response = await axios.post("http://localhost:5000/api/minimize-dfa", {
        transitions,
        symbols: symbolsToSend,
        start_state,
        end_states,
        states
      }, {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json"
        }
      });

      console.log("Minimization response received:", response.data);
      setResult(response.data);

      // After successful minimization, generate the image
      if (response.data.success) {
        await generateImage(response.data);
      }

    } catch (err) {
      console.error("Detailed error:", err);
      if (err.code === "ECONNREFUSED") {
        setError("Cannot connect to server. Please ensure the backend is running.");
      } else if (err.code === "ETIMEDOUT") {
        setError("Request timed out. Please try again.");
      } else if (err.response && err.response.status === 400) {
        setError(err.response.data.error || "Invalid input for DFA minimization.");
      } else {
        setError(`Failed to minimize DFA: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateImage = async (minimizedDFA) => {
    setIsGeneratingImage(true);
    setImageError(null);

    try {
      const response = await axios.post("http://localhost:5000/api/generate-automaton-image", {
        transitions: minimizedDFA.transitions,
        symbols: minimizedDFA.symbols,
        start_state: minimizedDFA.start_state,
        end_states: minimizedDFA.end_states,
        states: minimizedDFA.states
      }, {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.data.success && response.data.dot) {
        const viz = await import("@viz-js/viz").then(mod => mod.instance());
        const svgString = viz.renderString(response.data.dot, { format: "svg" });
        setImageData(svgString);
      } else {
        throw new Error("Failed to generate DOT notation");
      }
    } catch (err) {
      console.error("Image generation error:", err);
      if (err.code === "ECONNREFUSED") {
        setImageError("Cannot connect to server. Please ensure the backend is running.");
      } else if (err.code === "ETIMEDOUT") {
        setImageError("Request timed out. Please try again.");
      } else {
        setImageError(`Failed to generate image: ${err.message}`);
      }
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const renderTransitionTable = (automaton) => {
    if (!automaton || !automaton.states || !automaton.symbols || !automaton.transitions) {
      return null;
    }

    return (
      <div className="mt-4">
        <h4 className="font-medium mb-2">Minimized DFA Transition Table:</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr>
                <th className="border p-2 bg-gray-50">State</th>
                {automaton.symbols.map(sym => (
                  <th key={sym} className="border p-2 bg-gray-50">{sym}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {automaton.states.map(state => (
                <tr key={state}>
                  <td className={`border p-2 font-medium ${
                    state === automaton.start_state ? 'bg-green-100' : ''
                  } ${
                    automaton.end_states.includes(state) ? 'bg-blue-100' : ''
                  }`}>
                    {state}
                    {state === automaton.start_state && ' (start)'}
                    {automaton.end_states.includes(state) && ' (final)'}
                  </td>
                  {automaton.symbols.map(symbol => (
                    <td key={`${state}-${symbol}`} className="border p-2">
                      {automaton.transitions[state] && automaton.transitions[state][symbol] 
                        ? automaton.transitions[state][symbol].join(', ') 
                        : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="border rounded-lg p-4 shadow">
      <h3 className="font-semibold mb-2">DFA Minimization</h3>
      <p className="text-sm text-gray-600 mb-4">
        Minimize the DFA by removing unreachable states and merging equivalent states.
      </p>

      <button
        onClick={handleMinimize}
        className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-purple-300"
        disabled={isLoading || isGeneratingImage}
      >
        {isLoading ? "Minimizing..." : isGeneratingImage ? "Generating Image..." : "Minimize DFA"}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">Error:</p>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {imageError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">Image Generation Error:</p>
          <p className="text-red-600">{imageError}</p>
        </div>
      )}

      {result && result.success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="font-medium text-green-800">DFA Minimization Successful!</p>
          <div className="mt-2 text-sm text-green-700">
            <p><strong>Original states:</strong> {states.length}</p>
            <p><strong>Minimized states:</strong> {result.states.length}</p>
            <p><strong>Reduction:</strong> {states.length - result.states.length} states removed</p>
          </div>
          
          {renderTransitionTable(result)}
          
          {imageData && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Minimized DFA Diagram:</h4>
              <div
                className="border rounded bg-white p-2 overflow-auto max-h-96"
                dangerouslySetInnerHTML={{ __html: imageData }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DFAMinimizer;

