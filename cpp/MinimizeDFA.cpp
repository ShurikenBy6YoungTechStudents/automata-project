#include <iostream>
#include <vector>
#include <map>
#include <set>
#include <queue>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include "./libraries/json.hpp"

using namespace std;
using json = nlohmann::json;

struct DFA {
    set<string> states;
    set<char> alphabet;
    map<pair<string, char>, string> transitions;
    string start_state;
    set<string> accept_states;
};

DFA minimizeDFA(const DFA &dfa) {
    // Step 1: Remove unreachable states
    unordered_set<string> reachable;
    queue<string> q;
    q.push(dfa.start_state);
    reachable.insert(dfa.start_state);

    while (!q.empty()) {
        string current = q.front(); q.pop();
        for (char c : dfa.alphabet) {
            auto it = dfa.transitions.find({current, c});
            if (it != dfa.transitions.end()) {
                string next_state = it->second;
                if (reachable.find(next_state) == reachable.end()) {
                    reachable.insert(next_state);
                    q.push(next_state);
                }
            }
        }
    }

    // Step 2: Create optimized data structures
    vector<string> states_vec(reachable.begin(), reachable.end());
    int n = states_vec.size();

    // Create state-to-index mapping for O(1) lookups
    unordered_map<string, int> state_to_idx;
    for (int i = 0; i < n; i++) {
        state_to_idx[states_vec[i]] = i;
    }

    // Create distinguishability table
    vector<vector<bool>> distinguishable(n, vector<bool>(n, false));

    // Queue for newly distinguishable pairs to propagate changes efficiently
    queue<pair<int, int>> newly_distinguishable;

    // Mark pairs where one is accepting and other is not
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            bool i_accept = dfa.accept_states.count(states_vec[i]);
            bool j_accept = dfa.accept_states.count(states_vec[j]);
            if (i_accept != j_accept) {
                distinguishable[i][j] = true;
                newly_distinguishable.push({i, j});
            }
        }
    }

    // Optimized table-filling algorithm using queue-based propagation
    while (!newly_distinguishable.empty()) {
        auto [p, q] = newly_distinguishable.front();
        newly_distinguishable.pop();

        // For each pair (r, s) that might become distinguishable due to (p, q)
        for (int r = 0; r < n; r++) {
            for (int s = r + 1; s < n; s++) {
                if (!distinguishable[r][s]) {
                    // Check if states r and s transition to p and q (or q and p) on any symbol
                    for (char c : dfa.alphabet) {
                        auto it_r = dfa.transitions.find({states_vec[r], c});
                        auto it_s = dfa.transitions.find({states_vec[s], c});

                        // If one has a transition and the other doesn't, they're distinguishable
                        if ((it_r != dfa.transitions.end()) != (it_s != dfa.transitions.end())) {
                            distinguishable[r][s] = true;
                            newly_distinguishable.push({r, s});
                            break;
                        }

                        // If both have transitions, check if they go to distinguishable states
                        if (it_r != dfa.transitions.end() && it_s != dfa.transitions.end()) {
                            string next_r = it_r->second;
                            string next_s = it_s->second;

                            // Use hash map for O(1) lookup instead of linear search
                            auto idx_r_it = state_to_idx.find(next_r);
                            auto idx_s_it = state_to_idx.find(next_s);

                            if (idx_r_it != state_to_idx.end() && idx_s_it != state_to_idx.end()) {
                                int idx_r = idx_r_it->second;
                                int idx_s = idx_s_it->second;

                                if (idx_r != idx_s) {
                                    int min_idx = min(idx_r, idx_s);
                                    int max_idx = max(idx_r, idx_s);
                                    if (distinguishable[min_idx][max_idx]) {
                                        distinguishable[r][s] = true;
                                        newly_distinguishable.push({r, s});
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Step 3: Create equivalence classes using Union-Find for better efficiency
    vector<int> parent(n);
    for (int i = 0; i < n; i++) {
        parent[i] = i;
    }

    function<int(int)> find = [&](int x) {
        if (parent[x] != x) {
            parent[x] = find(parent[x]);
        }
        return parent[x];
    };

    auto unite = [&](int x, int y) {
        x = find(x);
        y = find(y);
        if (x != y) {
            parent[y] = x;
        }
    };

    // Union equivalent states
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (!distinguishable[i][j]) {
                unite(i, j);
            }
        }
    }

    // Map each root to a class ID
    unordered_map<int, int> root_to_class;
    int class_count = 0;
    vector<int> class_id(n);

    for (int i = 0; i < n; i++) {
        int root = find(i);
        if (root_to_class.find(root) == root_to_class.end()) {
            root_to_class[root] = class_count++;
        }
        class_id[i] = root_to_class[root];
    }

    // Step 4: Build minimized DFA with optimized lookups
    DFA new_dfa;
    new_dfa.alphabet = dfa.alphabet;

    // Create state names for equivalence classes using representative states
    unordered_map<int, string> class_to_state;
    unordered_map<int, string> class_representatives;

    // First, find a representative for each class (prefer start state, then lexicographically smallest)
    for (int i = 0; i < n; i++) {
        int cls = class_id[i];
        if (class_representatives.find(cls) == class_representatives.end()) {
            class_representatives[cls] = states_vec[i];
        } else {
            // Prefer start state as representative
            if (states_vec[i] == dfa.start_state) {
                class_representatives[cls] = states_vec[i];
            }
            // Otherwise prefer lexicographically smaller state
            else if (states_vec[i] < class_representatives[cls] && class_representatives[cls] != dfa.start_state) {
                class_representatives[cls] = states_vec[i];
            }
        }
    }

    // Create meaningful state names based on representatives
    for (int i = 0; i < class_count; i++) {
        // Use the representative state name as the new state name
        string rep = class_representatives[i];
        class_to_state[i] = rep;
        new_dfa.states.insert(rep);
    }

    // Set start state - it should remain the same since we use representative names
    new_dfa.start_state = dfa.start_state;

    // Set accept states
    for (const string& accept_state : dfa.accept_states) {
        auto idx_it = state_to_idx.find(accept_state);
        if (idx_it != state_to_idx.end()) {
            new_dfa.accept_states.insert(class_to_state[class_id[idx_it->second]]);
        }
    }

    // Set transitions using representatives and hash map lookups
    for (int i = 0; i < class_count; i++) {
        string rep_state = class_representatives[i];

        for (char c : dfa.alphabet) {
            auto it = dfa.transitions.find({rep_state, c});
            if (it != dfa.transitions.end()) {
                string next_state = it->second;
                auto next_idx_it = state_to_idx.find(next_state);
                if (next_idx_it != state_to_idx.end()) {
                    int next_class = class_id[next_idx_it->second];
                    new_dfa.transitions[{class_to_state[i], c}] = class_to_state[next_class];
                }
            }
        }
    }

    return new_dfa;
}

json dfaToJson(const DFA &dfa) {
    json j;
    j["success"] = true;

    j["states"] = json::array();
    for (const auto &s : dfa.states) {
        j["states"].push_back(s);
    }

    j["symbols"] = json::array();
    for (const auto &a : dfa.alphabet) {
        j["symbols"].push_back(string(1, a));
    }

    j["start_state"] = dfa.start_state;

    j["end_states"] = json::array();
    for (const auto &a : dfa.accept_states) {
        j["end_states"].push_back(a);
    }

    // Format transitions as expected by frontend
    j["transitions"] = json::object();
    for (const auto &state : dfa.states) {
        j["transitions"][state] = json::object();
        for (const auto &symbol : dfa.alphabet) {
            auto it = dfa.transitions.find({state, symbol});
            if (it != dfa.transitions.end()) {
                j["transitions"][state][string(1, symbol)] = json::array({it->second});
            } else {
                j["transitions"][state][string(1, symbol)] = json::array();
            }
        }
        // Add empty epsilon transitions
        j["transitions"][state]["ɛ"] = json::array();
    }

    return j;
}

int main() {
    try {
        json input;
        cin >> input;

        if (!input.contains("transitions") || !input.contains("start_state") || !input.contains("end_states") || !input.contains("symbols")) {
            throw runtime_error("JSON must contain 'transitions', 'start_state', 'end_states', and 'symbols'");
        }

        auto transitions = input["transitions"].get<json>();
        string start_state = input["start_state"];
        auto end_states = input["end_states"].get<vector<string>>();
        auto symbols = input["symbols"].get<vector<string>>();

        DFA dfa;
        dfa.start_state = start_state;
        for (const auto &s : end_states) {
            dfa.accept_states.insert(s);
        }

        // Parse symbols (skip epsilon)
        for (const auto &sym : symbols) {
            if (sym != "ɛ" && sym.length() == 1) {
                dfa.alphabet.insert(sym[0]);
            }
        }

        // Parse transitions
        for (const auto &state_trans : transitions.items()) {
            string from_state = state_trans.key();
            dfa.states.insert(from_state);

            for (const auto &symbol_trans : state_trans.value().items()) {
                string symbol = symbol_trans.key();
                if (symbol != "ɛ" && symbol.length() == 1) {
                    auto target_states = symbol_trans.value();
                    if (target_states.is_array() && target_states.size() == 1) {
                        string to_state = target_states[0];
                        dfa.transitions[{from_state, symbol[0]}] = to_state;
                        dfa.states.insert(to_state);
                    }
                }
            }
        }

        DFA new_dfa = minimizeDFA(dfa);
        json output = dfaToJson(new_dfa);
        cout << output.dump(2) << endl;
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
