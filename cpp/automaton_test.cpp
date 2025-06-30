#include "json.hpp"
#include <fstream>
#include <iostream>

using json = nlohmann::json;

std::string generateDOT(const json& automaton) {
    std::string dot = "digraph FA {\n";
    dot += "    rankdir=LR;\n";
    dot += "    node [shape = circle];\n";

    std::string startState = automaton["startState"];
    auto finalStates = automaton["finalStates"];

    // Invisible start arrow
    dot += "    start [shape=point];\n";
    dot += "    start -> " + startState + ";\n";

    // Mark final states
    for (const auto& state : finalStates) {
        dot += "    " + state + " [shape=doublecircle];\n";
    }

    // Transitions
    auto transitions = automaton["transitions"];
    for (auto& state : transitions.items()) {
        for (auto& symbol : state.value().items()) {
            for (auto& nextState : symbol.value()) {
                dot += "    " + state.key() + " -> " + nextState.get<std::string>() +
                       " [label=\"" + symbol.key() + "\"];\n";
            }
        }
    }

    dot += "}\n";
    return dot;
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << "Missing JSON input file.\n";
        return 1;
    }

    std::ifstream file(argv[1]);
    json j;
    file >> j;
    file.close();

    std::string dot = generateDOT(j["automaton"]);
    std::cout << dot;

    return 0;
}
