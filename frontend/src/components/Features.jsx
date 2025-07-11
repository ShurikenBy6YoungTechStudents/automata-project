import React from "react";
import DFAorNFA from "./features/DFAorNFA";
import InputString from "./features/InputString";
import DFAMinimizer from "./features/DFAMinimizer";

const Features = ({ transitions, start_state, end_states, states, symbols }) => {
  return (
    <div className="mt-7">
      <h2 className="text-black text-xl md:text-2xl lg:text-3xl font-bold">Features</h2>
      <div className="p-2 my-2 grid md:grid-cols-1 gap-4">
        <DFAorNFA
          transitions={transitions}
          start_state={start_state}
          end_states={end_states}
          states={states}
          symbols={symbols}
        />
      </div>
      <div className="p-2 my-2 grid md:grid-cols-1 gap-4">
        <InputString
          transitions={transitions}
          start_state={start_state}
          end_states={end_states}
          states={states}
          symbols={symbols}
        />
      </div>

      <div className="p-2 my-2 grid md:grid-cols-1 gap-4">
        <DFAMinimizer
          transitions={transitions}
          start_state={start_state}
          end_states={end_states}
          states={states}
          symbols={symbols}
        />
      </div>

      <div className="p-2 my-2 grid md:grid-cols-2 gap-4">
        {/* Your other feature buttons here */}
      </div>
    </div>
  );
};

export default Features;
