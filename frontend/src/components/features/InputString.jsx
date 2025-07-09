import React, { useState } from "react";
import axios from "axios";
import { instance } from "@viz-js/viz";

const InputString = ({ transitions, start_state, end_states, states, symbols }) => {
  const [inputStr, setInputStr] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [pathVisualization, setPathVisualization] = useState(null);

  // Input validation function
  const validateInput = (input) => {
    const errors = [];

    // Filter out epsilon from symbols for input validation (epsilon is for transitions only)
    const inputSymbols = symbols.filter(symbol => symbol !== 'ɛ');

    // Check if input contains only valid symbols (excluding epsilon)
    for (let char of input) {
      if (!inputSymbols.includes(char)) {
        errors.push(`Invalid symbol '${char}'. Valid input symbols are: ${inputSymbols.join(', ')}`);
      }
    }

    return errors;
  };

  // Generate path visualization DOT
  const generatePathDOT = (path, inputString) => {
    let dot = 'digraph PathVisualization {\n';
    dot += '  rankdir=LR;\n';
    dot += '  node [shape = circle];\n\n';

    // Add invisible start node
    dot += '  start [shape=point, style=invis];\n';
    dot += `  start -> "${path[0]}" [label="start"];\n\n`;

    // Define final states
    if (end_states && end_states.length > 0) {
      for (const state of end_states) {
        dot += `  "${state}" [shape = doublecircle];\n`;
      }
    }

    // Add path transitions with input symbols
    for (let i = 0; i < path.length - 1; i++) {
      const fromState = path[i];
      const toState = path[i + 1];
      const symbol = inputString[i] || '';

      dot += `  "${fromState}" -> "${toState}" [label="${symbol}", color="red", penwidth=2];\n`;
    }

    dot += '}\n';
    return dot;
  };

  const handleTestString = async () => {
    if (!inputStr) return;

    // Validate input first
    const inputErrors = validateInput(inputStr);
    setValidationErrors(inputErrors);

    if (inputErrors.length > 0) {
      setError("Input contains invalid symbols");
      return;
    }

    setIsTesting(true);
    setResult(null);
    setError(null);
    setPathVisualization(null);

    try {
      const response = await axios.post("http://localhost:5000/api/test-input-string", {
        transitions,
        start_state,
        end_states,
        states,
        symbols,
        input: inputStr
      }, {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json"
        }
      });

      console.log("String test response:", response.data);

      if (response.data.success) {
        const { accepted, path, final_state, error: validationError } = response.data;

        if (validationError) {
          setError(validationError);
        } else {
          setResult({
            accepted,
            path,
            final_state,
            message: accepted ? "String Accepted ✅" : "String Rejected ❌"
          });

          // Generate path visualization
          if (path && path.length > 0) {
            try {
              const pathDOT = generatePathDOT(path, inputStr);
              const viz = await instance();
              const svgString = viz.renderString(pathDOT, { format: "svg" });
              setPathVisualization(svgString);
            } catch (vizError) {
              console.error("Error generating path visualization:", vizError);
            }
          }
        }
      } else {
        throw new Error(response.data.error || "Unknown error");
      }

    } catch (err) {
      console.error("Error testing string:", err);
      if (err.code === "ECONNREFUSED") {
        setError("Cannot connect to server. Please ensure the backend is running.");
      } else if (err.code === "ETIMEDOUT") {
        setError("Request timed out. Please try again.");
      } else {
        setError(`Error testing string: ${err.message}`);
      }
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 shadow mt-6">
      <h3 className="font-semibold mb-2">Test Input String</h3>

      {symbols && symbols.length > 0 && (
        <div className="mb-3 p-2 bg-blue-50 rounded">
          <p className="text-sm text-blue-700">
            <strong>Valid input symbols:</strong> {symbols.filter(s => s !== 'ɛ').join(', ')}
          </p>
          <p className="text-sm text-blue-600">
            <strong>Note:</strong> ɛ (epsilon) transitions are handled automatically by the system
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2 mb-4">
        <input
          type="text"
          placeholder={`Enter string to test (valid symbols: ${symbols ? symbols.filter(s => s !== 'ɛ').join(', ') : 'loading...'})`}
          value={inputStr}
          onChange={(e) => setInputStr(e.target.value)}
          className={`border rounded px-3 py-2 w-full ${validationErrors.length > 0 ? 'border-red-500' : ''}`}
        />

        {validationErrors.length > 0 && (
          <div className="text-red-600 text-sm">
            {validationErrors.map((error, index) => (
              <p key={index}>• {error}</p>
            ))}
          </div>
        )}

        <button
          onClick={handleTestString}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-purple-300"
          disabled={isTesting || !inputStr || validationErrors.length > 0}
        >
          {isTesting ? "Testing..." : "Test Input String"}
        </button>
      </div>

      {result && (
        <div className={`p-3 rounded-lg ${result.accepted ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className="font-medium">{result.message}</p>
          {result.path && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                <strong>Path:</strong> {result.path.join(' → ')}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Final State:</strong> {result.final_state}
              </p>
            </div>
          )}
        </div>
      )}

      {pathVisualization && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Execution Path:</h4>
          <div
            className="border rounded bg-white p-2 overflow-auto max-h-96"
            dangerouslySetInnerHTML={{ __html: pathVisualization }}
          />
          <p className="text-sm text-gray-600 mt-2">
            Red arrows show the path taken through the automaton for input: "{inputStr}"
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setValidationErrors([]);
            }}
            className="text-sm text-red-500 hover:text-red-700 mt-2"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default InputString;
