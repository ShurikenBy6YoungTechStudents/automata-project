#ifndef AUTOMATA_H
#define AUTOMATA_H

#include <string>
#include <vector>
#include <map>
#include <set>
#include "json.hpp"

using json = nlohmann::json;

class FiniteAutomaton {
private:
    std::vector<std::string> states;
    std::vector<std::string> symbols;
    std::map<std::string, std::map<std::string, std::vector<std::string>>> transitions;
    std::string startState;
    std::vector<std::string> finalStates;

public:
    // Constructor
    FiniteAutomaton(
        const std::vector<std::string>& states,
        const std::vector<std::string>& symbols,
        const std::map<std::string, std::map<std::string, std::vector<std::string>>>& transitions,
        const std::string& startState,
        const std::vector<std::string>& finalStates
    ) : states(states), symbols(symbols), transitions(transitions),
        startState(startState), finalStates(finalStates) {}

    // Check if automaton is DFA or NFA
    std::string getType() const {
        for (const auto& state : states) {
            for (const auto& symbol : symbols) {
                // Check if transition exists and has exactly one target state
                if (transitions.count(state) == 0 || 
                    transitions.at(state).count(symbol) == 0 ||
                    transitions.at(state).at(symbol).size() != 1) {
                    return "NFA";
                }
            }
        }
        return "DFA";
    }

    // Check if string is accepted
    bool acceptsString(const std::string& input) const {
        std::set<std::string> currentStates = {startState};
        
        for (char c : input) {
            std::string symbol(1, c);
            std::set<std::string> nextStates;
            
            for (const auto& state : currentStates) {
                if (transitions.count(state) && transitions.at(state).count(symbol)) {
                    const auto& targets = transitions.at(state).at(symbol);
                    nextStates.insert(targets.begin(), targets.end());
                }
            }
            
            currentStates = nextStates;
        }
        
        // Check if any current state is accepting
        for (const auto& state : currentStates) {
            if (std::find(finalStates.begin(), finalStates.end(), state) != finalStates.end()) {
                return true;
            }
        }
        return false;
    }

    // Convert transitions to JSON format
    json getTransitionsAsJson() const {
        return json{
            {"states", states},
            {"symbols", symbols},
            {"transitions", transitions},
            {"start_state", startState},
            {"final_states", finalStates}
        };
    }
};

#endif // AUTOMATA_H