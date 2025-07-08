import React, { useState } from "react";
import { instance } from "@viz-js/viz";

const VizTest = () => {
  const [svgData, setSvgData] = useState(null);
  const [error, setError] = useState(null);

  const testDOT = `digraph FiniteAutomaton {
  rankdir=LR;
  size="8,5";
  node [shape = circle];

  start [shape=point, style=invis];
  start -> "q0" [label="start"];

  "q1" [shape = doublecircle];
  "q0" [shape = circle];

  "q0" -> "q1" [label="0"];
  "q0" -> "q0" [label="1"];
  "q1" -> "q0" [label="0"];
  "q1" -> "q1" [label="1"];
}`;

  const testViz = async () => {
    try {
      setError(null);
      console.log("Testing DOT:", testDOT);
      
      const viz = await instance();
      console.log("Viz instance created");
      
      const svg = viz.renderString(testDOT, { format: "svg" });
      console.log("SVG generated successfully");
      
      setSvgData(svg);
    } catch (err) {
      console.error("Viz error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="border rounded-lg p-4 shadow">
      <h3 className="font-semibold mb-2">Test Viz.js with Generated DOT</h3>
      <button
        onClick={testViz}
        className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
      >
        Test DOT Rendering
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg">
          <p className="text-red-600">Error: {error}</p>
        </div>
      )}
      
      {svgData && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Generated SVG:</h4>
          <div 
            className="border rounded bg-white p-2"
            dangerouslySetInnerHTML={{ __html: svgData }}
          />
        </div>
      )}
      
      <div className="mt-4 p-3 bg-gray-100 rounded-lg">
        <h4 className="font-medium mb-2">DOT Source:</h4>
        <pre className="text-sm whitespace-pre-wrap">{testDOT}</pre>
      </div>
    </div>
  );
};

export default VizTest;
