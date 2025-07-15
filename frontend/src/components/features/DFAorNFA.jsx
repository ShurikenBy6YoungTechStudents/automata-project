import React, { useState } from "react";
import axios from "axios";
import { instance } from "@viz-js/viz";

const DFAorNFA = ({ transitions, start_state, end_states, states, symbols }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageData, setImageData] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [showImage, setShowImage] = useState(false);

  const handleCheck = async () => {
    setIsLoading(true);
    setError(null);

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

      const response = await axios.post("http://localhost:5000/api/check-fa-type", {
        transitions,
        symbols: symbolsToSend,
        start_state,
        end_states,
        states
      }, {
        timeout: 5000,
        headers: {
          "Content-Type": "application/json"
        }
      });

      console.log("Response received:", response.data);
      setResult(response.data);

    } catch (err) {
      console.error("Detailed error:", err);
      if (err.code === "ECONNREFUSED") {
        setError("Cannot connect to server. Please ensure the backend is running.");
      } else if (err.code === "ETIMEDOUT") {
        setError("Request timed out. Please try again.");
      } else {
        setError(`Failed to check FA type: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    setImageError(null);
    setImageData(null);

    try {
      const response = await axios.post("http://localhost:5000/api/generate-automaton-image", {
        transitions,
        symbols,
        start_state,
        end_states,
        states
      }, {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json"
        }
      });

      console.log("DOT response received:", response.data);

      if (response.data.success && response.data.dot) {
        const viz = await instance();
        const svgString = viz.renderString(response.data.dot, { format: "svg" });
        setImageData(svgString);
      } else {
        throw new Error("Failed to generate DOT notation");
      }

    } catch (err) {
      console.error("Detailed image generation error:", err);
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
  

  return (
    <div className="border rounded-lg p-4 shadow">
      <h3 className="font-semibold mb-2">Check DFA/NFA & Generate Image</h3>

      <div className="flex gap-2 mb-4">
        <button
          onClick={handleCheck}
          className="bg-[#1a365d] text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          disabled={isLoading}
        >
          {isLoading ? "Checking..." : "Check Type"}
        </button>

        <button
          onClick={handleGenerateImage}
          className="bg-[#76BC21] text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-green-300"
          disabled={isGeneratingImage}
        >
          {isGeneratingImage ? "Generating..." : "Generate Image"}
        </button>
      </div>

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

      {imageError && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg">
          <p className="text-red-600">{imageError}</p>
          <button
            onClick={() => setImageError(null)}
            className="text-sm text-red-500 hover:text-red-700 mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {imageData && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Automaton Diagram:</h4>
          <div
            className="border rounded bg-white p-2 overflow-auto max-h-96"
            dangerouslySetInnerHTML={{ __html: imageData }}
          />
        </div>
      )}
    </div>
  );
};

export default DFAorNFA;
