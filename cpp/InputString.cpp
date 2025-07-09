#include <iostream>
#include <fstream>
#include <unordered_set>
#include "./libraries/json.hpp"

using json = nlohmann::json;
using namespace std;

bool testDFA(const json& transitions, const string& start_state,
             const unordered_set<string>& end_states,
             const string& input) {
    string current = start_state;

    for (char c : input) {
        string symbol(1, c);
        if (transitions.contains(current) && transitions[current].contains(symbol)) {
            current = transitions[current][symbol][0];
        } else {
            return false;
        }
    }
    return end_states.count(current) > 0;
}

int main() {
    ifstream transFile("transitions.json");
    json transitions;
    transFile >> transitions;

    ifstream inputFile("input.txt");
    json inputData;
    inputFile >> inputData;

    string start_state = inputData["start_state"];
    unordered_set<string> end_states(inputData["end_states"].begin(), inputData["end_states"].end());
    string input_string = inputData["input_string"];

    bool result = testDFA(transitions, start_state, end_states, input_string);

    if (result) {
        cout << "Accepted" << endl;
    } else {
        cout << "Rejected" << endl;
    }

    return 0;
}