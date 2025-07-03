#include <iostream>
#include <fstream>
#include <string>
#include "./libraries/json.hpp"

using json = nlohmann::json;

bool isDFA(const json& transitions, const std::vector<std::string>& symbols) {
    for (const auto& [state, stateTransitions] : transitions.items()) {
        for (const auto& symbol : symbols) {
            // Check if transition exists
            if (!stateTransitions.contains(symbol)) {
                return false;
            }
            // Check if it has exactly one target state
            if (!stateTransitions[symbol].is_array() || 
                stateTransitions[symbol].size() != 1) {
                return false;
            }
        }
    }
    return true;
}

int main(int argc, char* argv[]) {
    try {
        if (argc != 2) {
            throw std::runtime_error("Input file path required");
        }

        // Read input JSON file
        std::ifstream input_file(argv[1]);
        json input;
        input_file >> input;

        // Extract data
        auto transitions = input["transitions"].get<json>();
        auto symbols = input["symbols"].get<std::vector<std::string>>();

        // Check if it's DFA or NFA
        bool isDfa = isDFA(transitions, symbols);

        // Create response
        json response = {
            {"success", true},
            {"type", isDfa ? "DFA" : "NFA"}
        };

        // Output result
        std::cout << response.dump(2) << std::endl;
        return 0;
    }
    catch (const std::exception& e) {
        json error = {
            {"success", false},
            {"error", e.what()}
        };
        std::cout << error.dump(2) << std::endl;
        return 1;
    }
}