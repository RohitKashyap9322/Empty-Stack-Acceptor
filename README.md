# Empty Stack Acceptor

A browser-based Theory of Computation validator for an Empty Stack Acceptor.

## Features
- Step-by-step pushdown automaton simulation.
- Current stack and remaining input display.
- Execution trace of every push/pop operation.
- Accepts only when the complete input is consumed and the simulation stack is empty at the final character boundary.
- Built-in a^n b^n and balanced-parentheses examples.

## Run
Open index.html in any modern browser. No build tools or server are required.

## Acceptance rule
A missing transition rejects immediately. At the final character boundary, the bottom marker Z is removed by an epsilon transition. The string is accepted only when the resulting simulation stack is empty.