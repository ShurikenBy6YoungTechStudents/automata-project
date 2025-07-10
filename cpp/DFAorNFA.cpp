#include <iostream>
#include <string>
#include "./libraries/json.hpp"

using json = nlohmann::json;
using namespace std;

bool isDFA(const json& transitions, const std::vector<std::string>& symbols) {
    // First, check if there are any non-empty epsilon transitions
    for (const auto& [state, stateTransitions] : transitions.items()) {
        if (stateTransitions.contains("ɛ") &&
            stateTransitions["ɛ"].is_array() &&
            stateTransitions["ɛ"].size() > 0) {
            return false; // Has epsilon transitions, so it's NFA
        }
    }

    // Check for non-epsilon symbols - each state must have exactly one transition for each symbol
    for (const auto& [state, stateTransitions] : transitions.items()) {
        for (const auto& symbol : symbols) {
            // Skip epsilon symbol for DFA check - empty epsilon transitions are allowed in DFA
            if (symbol == "ɛ") continue;

            if (!stateTransitions.contains(symbol)) {
                return false; // Missing transition
            }
            if (!stateTransitions[symbol].is_array()) {
                return false; // Invalid format
            }
            if (stateTransitions[symbol].size() != 1) {
                return false; // Multiple transitions or no transitions
            }
        }
    }
    return true;
}

int main() {
    try {
        json input;
        cin >> input;

        if (!input.contains("transitions") || !input.contains("symbols")) {
            throw runtime_error("JSON must contain 'transitions' and 'symbols'");
        }

        auto transitions = input["transitions"].get<json>();
        auto symbols = input["symbols"].get<vector<string>>();

        bool isDfa = isDFA(transitions, symbols);

        json response = {
            {"success", true},
            {"type", isDfa ? "DFA" : "NFA"}
        };

        cout << response.dump(2) << endl;
        return 0;
    }
    catch (const exception& e) {
        json error = {
            {"success", false},
            {"error", e.what()}
        };
        cout << error.dump(2) << endl;
        return 1;
    }
}