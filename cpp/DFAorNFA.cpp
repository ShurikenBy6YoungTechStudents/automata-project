#include <iostream>
#include <string>
#include "./libraries/json.hpp"

using json = nlohmann::json;
using namespace std;

bool isDFA(const json& transitions, const std::vector<std::string>& symbols) {
    for (const auto& [state, stateTransitions] : transitions.items()) {
        for (const auto& symbol : symbols) {
            if (!stateTransitions.contains(symbol)) {
                return false;
            }
            if (!stateTransitions[symbol].is_array() || 
                stateTransitions[symbol].size() != 1) {
                return false;
            }
        }
    }
    return true;
}

int main() {
    try {
        json input;
        cout << "Debugging input (This is only for showing that it working properly or not)" <<endl;
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