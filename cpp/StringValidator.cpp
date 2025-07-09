#include <iostream>
#include <string>
#include <vector>
#include <set>
#include <queue>
#include "./libraries/json.hpp"

using json = nlohmann::json;
using namespace std;

struct ValidationResult {
    bool accepted;
    vector<string> path;
    string currentState;
    int position;
    string error;
};

// Function to compute epsilon closure of a set of states
set<string> epsilonClosure(const set<string>& states, const json& transitions) {
    set<string> closure = states;
    queue<string> toProcess;

    // Add all initial states to the queue
    for (const string& state : states) {
        toProcess.push(state);
    }

    while (!toProcess.empty()) {
        string currentState = toProcess.front();
        toProcess.pop();

        // Check if current state has epsilon transitions
        if (transitions.contains(currentState) &&
            transitions[currentState].contains("ɛ")) {

            auto epsilonTransitions = transitions[currentState]["ɛ"];
            if (epsilonTransitions.is_array()) {
                for (const auto& nextState : epsilonTransitions) {
                    string nextStateStr = nextState.get<string>();

                    // If this state is not already in closure, add it
                    if (closure.find(nextStateStr) == closure.end()) {
                        closure.insert(nextStateStr);
                        toProcess.push(nextStateStr);
                    }
                }
            }
        }
    }

    return closure;
}

ValidationResult validateString(const json& transitions, const string& startState,
                              const set<string>& endStates, const string& inputString) {
    ValidationResult result;
    result.accepted = false;
    result.position = 0;

    try {
        // Start with epsilon closure of the start state
        set<string> currentStates = {startState};
        currentStates = epsilonClosure(currentStates, transitions);

        // Add all states in initial epsilon closure to path
        result.path.push_back(startState);
        for (const string& state : currentStates) {
            if (state != startState) {
                result.path.push_back(state + " (ɛ)");
            }
        }

        // Process each input symbol
        for (char c : inputString) {
            string symbol(1, c);
            set<string> nextStates;

            // For each current state, find all possible next states
            for (const string& currentState : currentStates) {
                if (transitions.contains(currentState) &&
                    transitions[currentState].contains(symbol)) {

                    auto stateNextStates = transitions[currentState][symbol];
                    if (stateNextStates.is_array()) {
                        for (const auto& nextState : stateNextStates) {
                            nextStates.insert(nextState.get<string>());
                        }
                    }
                }
            }

            // If no transitions found for this symbol, reject
            if (nextStates.empty()) {
                result.error = "No valid transition for symbol '" + symbol + "' from current states";
                return result;
            }

            // Add epsilon closure of next states
            nextStates = epsilonClosure(nextStates, transitions);

            // Update current states and add to path
            currentStates = nextStates;
            if (!currentStates.empty()) {
                // For path tracking, show the first state reached (simplified)
                string firstState = *currentStates.begin();
                result.path.push_back(firstState);
                result.currentState = firstState;
            }

            result.position++;
        }

        // Check if any current state is accepting
        for (const string& state : currentStates) {
            if (endStates.find(state) != endStates.end()) {
                result.accepted = true;
                result.currentState = state;
                break;
            }
        }

    } catch (const exception& e) {
        result.error = "Error during validation: " + string(e.what());
        result.accepted = false;
    }

    return result;
}

int main() {
    try {
        json input;
        cin >> input;
        
        // Validate required fields
        if (!input.contains("transitions") || !input.contains("start_state") || 
            !input.contains("end_states") || !input.contains("input")) {
            throw runtime_error("Missing required fields: transitions, start_state, end_states, input");
        }
        
        auto transitions = input["transitions"];
        string startState = input["start_state"].get<string>();
        auto endStatesArray = input["end_states"].get<vector<string>>();
        string inputString = input["input"].get<string>();
        
        // Convert end states to set for faster lookup
        set<string> endStates(endStatesArray.begin(), endStatesArray.end());
        
        // Validate the input string
        ValidationResult result = validateString(transitions, startState, endStates, inputString);
        
        // Prepare response
        json response = {
            {"success", true},
            {"accepted", result.accepted},
            {"path", result.path},
            {"final_state", result.currentState},
            {"input_length", inputString.length()},
            {"path_length", result.path.size()}
        };
        
        if (!result.error.empty()) {
            response["error"] = result.error;
            response["success"] = false;
        }
        
        cout << response.dump(2) << endl;
        return 0;
        
    } catch (const exception& e) {
        json error = {
            {"success", false},
            {"error", e.what()},
            {"accepted", false}
        };
        cout << error.dump(2) << endl;
        return 1;
    }
}
