
# 🧠 Automata Simulator (DFA & NFA)

A C++-based Automata simulation tool designed to handle both **Deterministic Finite Automata (DFA)** and **Non-Deterministic Finite Automata (NFA)**. This project was developed as part of a university coursework — built and debugged entirely solo with performance, clarity, and modularity in mind.

---

## 🚀 Features

- ✅ DFA simulation
- ✅ NFA simulation with state branching
- ✅ JSON-based input/output using `nlohmann/json`
- ✅ Input string validation
- ✅ Clean transition logic
- ✅ Bug tracking & internal consistency checking
- ✅ Command-line interaction or file-driven execution

---

## 🛠 Technologies Used

- **C++17**
- [`nlohmann/json`](https://github.com/nlohmann/json) for JSON structure handling
- **Standard Template Library (STL)**
- **Git** for version control

---

## 📁 Project Structure

```

/automata-project
│
├── main.cpp            # Entry point of the simulator
├── dfa.cpp / dfa.hpp   # DFA logic
├── nfa.cpp / nfa.hpp   # NFA logic
├── json\_loader.cpp     # Load and parse JSON input
├── test\_cases/         # Sample DFA/NFA input files
└── README.md           # You're reading it!

````

---

## ⚙️ How to Run

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/automata-project.git
   cd automata-project

2. **Build the project:**

   ```bash
   g++ -std=c++17 -o automata main.cpp
   ```

3. **Run the program:**

   ```bash
   ./automata
   ```

4. **Input:**

   Provide DFA/NFA configuration in JSON format via input file or command-line prompt.

---

## 📦 Example JSON Input

```json
{
  "type": "dfa",
  "states": ["q0", "q1"],
  "alphabet": ["0", "1"],
  "start_state": "q0",
  "accept_states": ["q1"],
  "transitions": {
    "q0": { "0": "q1", "1": "q0" },
    "q1": { "0": "q0", "1": "q1" }
  }
}
```

---

## ✨ What We've Learned

* How to simulate theoretical automata in real C++ code
* Applied object-oriented programming in designing state machines
* Explored `nlohmann/json` library to treat JSON as a native structure
* Strengthened debugging, solo problem-solving, and backend integration

---

---

> ⚡ *Feel free to fork, explore, or contribute if you find this project interesting!*
---

```
Let me know if you want me to:
- Add a DFA/NFA diagram (I can generate one).
- Help write a `LICENSE` or `CONTRIBUTING.md`.
- Include sample output (input strings + acceptance/rejection).

This README already reflects your effort and skill — adding it makes your work shine.
```
