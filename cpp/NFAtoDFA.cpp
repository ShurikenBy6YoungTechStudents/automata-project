#include <iostream>
#include <string>
#include <vector>
#include <set>
#include <map>
#include <queue>
#include <algorithm>
#include "./libraries/json.hpp"

using json = nlohmann::json;
using namespace std;

// Structure to represent a DFA state (which is a set of NFA states)
struct DFAState {
    set<string> nfaStates;
    string name;
    bool isAccepting;
    
    bool operator<(const DFAState& other) const {
        return nfaStates < other.nfaStates;
    }
    
    bool operator==(const DFAState& other) const {
        return nfaStates == other.nfaStates;
    }
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
            (transitions[currentState].contains("ɛ") || transitions[currentState].contains("ε"))) {

            auto epsilonTransitions = transitions[currentState].contains("ɛ") ?
                                    transitions[currentState]["ɛ"] :
                                    transitions[currentState]["ε"];
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

// Function to get the set of states reachable from a set of states on a given symbol
set<string> move(const set<string>& states, const string& symbol, const json& transitions) {
    set<string> result;
    
    for (const string& state : states) {
        if (transitions.contains(state) && transitions[state].contains(symbol)) {
            auto nextStates = transitions[state][symbol];
            if (nextStates.is_array()) {
                for (const auto& nextState : nextStates) {
                    result.insert(nextState.get<string>());
                }
            }
        }
    }
    
    return result;
}

// Function to generate a name for a DFA state from its NFA states
string generateStateName(const set<string>& nfaStates, map<set<string>, int>& stateCounter) {
    if (nfaStates.empty()) {
        return "∅";
    }

    // Check if we already have a name for this state set
    if (stateCounter.find(nfaStates) == stateCounter.end()) {
        stateCounter[nfaStates] = stateCounter.size();
    }

    return "q" + to_string(stateCounter[nfaStates]);
}

// Main NFA to DFA conversion function using subset construction
json convertNFAtoDFA(const json& nfaData) {
    try {
        // Extract NFA components
        auto nfaTransitions = nfaData["transitions"];
        string nfaStartState = nfaData["start_state"].get<string>();
        auto nfaEndStates = nfaData["end_states"].get<vector<string>>();
        auto symbols = nfaData["symbols"].get<vector<string>>();
        
        set<string> nfaEndStatesSet(nfaEndStates.begin(), nfaEndStates.end());
        
        // Remove epsilon from symbols for DFA (epsilon transitions are handled internally)
        vector<string> dfaSymbols;
        for (const string& symbol : symbols) {
            if (symbol != "ɛ" && symbol != "ε") {  // Handle both epsilon representations
                dfaSymbols.push_back(symbol);
            }
        }
        
        // Data structures for DFA construction
        map<set<string>, DFAState> dfaStates;
        queue<set<string>> unprocessedStates;
        json dfaTransitions = json::object();
        map<set<string>, int> stateCounter; // For generating simple state names
        
        // Start with epsilon closure of NFA start state
        set<string> startStateSet = {nfaStartState};
        set<string> startClosure = epsilonClosure(startStateSet, nfaTransitions);
        
        // Create initial DFA state
        DFAState startDFAState;
        startDFAState.nfaStates = startClosure;
        startDFAState.name = generateStateName(startClosure, stateCounter);
        startDFAState.isAccepting = false;
        
        // Check if start state is accepting
        for (const string& state : startClosure) {
            if (nfaEndStatesSet.count(state)) {
                startDFAState.isAccepting = true;
                break;
            }
        }
        
        dfaStates[startClosure] = startDFAState;
        unprocessedStates.push(startClosure);
        
        // Process all states using subset construction
        while (!unprocessedStates.empty()) {
            set<string> currentStateSet = unprocessedStates.front();
            unprocessedStates.pop();
            
            string currentStateName = dfaStates[currentStateSet].name;
            dfaTransitions[currentStateName] = json::object();
            
            // For each symbol in the alphabet
            for (const string& symbol : dfaSymbols) {
                // Compute move(currentStateSet, symbol)
                set<string> moveResult = move(currentStateSet, symbol, nfaTransitions);
                
                // Compute epsilon closure of the move result
                set<string> newStateSet = epsilonClosure(moveResult, nfaTransitions);
                
                if (!newStateSet.empty()) {
                    // Check if this state set already exists
                    if (dfaStates.find(newStateSet) == dfaStates.end()) {
                        // Create new DFA state
                        DFAState newDFAState;
                        newDFAState.nfaStates = newStateSet;
                        newDFAState.name = generateStateName(newStateSet, stateCounter);
                        newDFAState.isAccepting = false;
                        
                        // Check if new state is accepting
                        for (const string& state : newStateSet) {
                            if (nfaEndStatesSet.count(state)) {
                                newDFAState.isAccepting = true;
                                break;
                            }
                        }
                        
                        dfaStates[newStateSet] = newDFAState;
                        unprocessedStates.push(newStateSet);
                    }
                    
                    // Add transition
                    string targetStateName = dfaStates[newStateSet].name;
                    dfaTransitions[currentStateName][symbol] = json::array({targetStateName});
                }
            }
        }
        
        // Collect DFA states and end states
        vector<string> dfaStatesList;
        vector<string> dfaEndStatesList;
        
        for (const auto& pair : dfaStates) {
            dfaStatesList.push_back(pair.second.name);
            if (pair.second.isAccepting) {
                dfaEndStatesList.push_back(pair.second.name);
            }
        }
        
        // Create result JSON
        json result = {
            {"success", true},
            {"dfa", {
                {"states", dfaStatesList},
                {"symbols", dfaSymbols},
                {"transitions", dfaTransitions},
                {"start_state", dfaStates[startClosure].name},
                {"end_states", dfaEndStatesList}
            }},
            {"conversion_info", {
                {"original_nfa_states", nfaData["states"].size()},
                {"resulting_dfa_states", dfaStatesList.size()},
                {"epsilon_transitions_removed", symbols.size() > dfaSymbols.size()}
            }}
        };
        
        return result;
        
    } catch (const exception& e) {
        return json{
            {"success", false},
            {"error", string("Conversion error: ") + e.what()}
        };
    }
}

int main() {
    try {
        json input;
        cin >> input;
        
        // Validate required fields
        if (!input.contains("transitions") || !input.contains("start_state") || 
            !input.contains("end_states") || !input.contains("symbols")) {
            throw runtime_error("Missing required fields: transitions, start_state, end_states, symbols");
        }
        
        json result = convertNFAtoDFA(input);
        cout << result.dump(2) << endl;
        return result["success"].get<bool>() ? 0 : 1;
        
    } catch (const exception& e) {
        json error = {
            {"success", false},
            {"error", e.what()}
        };
        cout << error.dump(2) << endl;
        return 1;
    }
}
