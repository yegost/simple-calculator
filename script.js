const calculator = (() => {
    const mainDisplay = document.getElementById('display-current');
    const secondaryDisplay = document.getElementById('display-equation');
    const buttons = document.getElementById('buttons');  

        //Operator classification    
    const PRIMARY_OPERATORS = new Set(["*", "/"]);
    const SIGN_MODIFIERS = new Set(["+", "-"]);

        //Where variables are stored
    const state = { 
        equation: '',
        current: '', 
        previous: '', 
        operator: null, 
        modifier: null,
        justEvaluated: false,
        
    };

        //Updates the main display
    function updateMainDisplay() {
        if (state.justEvaluated) {
            secondaryDisplay.value = state.equation;
            mainDisplay.value = state.current;
        } else if (state.operator) {
            const modPart = state.modifier ? `${state.modifier}` : "";
            mainDisplay.value = `${state.previous} ${state.operator}${modPart} ${state.current}`;
            secondaryDisplay.value = "";
        } else {
            mainDisplay.value = state.current !== '' ? state.current : '0';
            secondaryDisplay.value = "";
        }

        const length = mainDisplay.value.length;
        const fontSize = mainDisplay.style.fontSize;
        if (length > 12) mainDisplay.style.fontSize = "24px";
        else if (length > 8) mainDisplay.style.fontSize = "32px";
        else mainDisplay.style.fontSize = "48px";
    }

        //Adds numbers as strings to the state and handles dots
    function inputDigit(digit) {
        if (state.justEvaluated) clear();
        if (digit === "." && state.current.includes(".")) return;
        if (digit === "." && state.current === "") {
            state.current = "0.";
            updateMainDisplay();
            return;
        }

        state.current += digit;
        updateMainDisplay();
    }

        //Attaches the operator to state
    function inputOperator(operator) {
        if (state.justEvaluated) {
            console.log(state)
            state.justEvaluated = false;
            console.log(state)
        }
        if (state.current === '' && state.previous === '') {
            state.previous = "0";
            state.operator = operator;
            state.modifier = null;
            updateMainDisplay();
            return;
        }
        if (state.current.endsWith(".")) {
            state.current = state.current.slice(0, -1);
        }
        if (SIGN_MODIFIERS.has(operator) && PRIMARY_OPERATORS.has(state.operator)) {
            state.modifier = operator;
            updateMainDisplay();
            return;
        }
        if (state.operator && state.previous !== '' && state.current !== '') {
            equals();
            state.justEvaluated = false;
        }
        if (state.operator && state.current === '') {
            state.operator = operator;
            updateMainDisplay();
            return;
        }
        state.previous = state.current;
        state.current = '';
        state.operator = operator;
        updateMainDisplay();
    }

        //Handles calculations
    function equals() {
        if (state.operator === null || state.previous === '' || state.current === '') return;
        const p = parseFloat(state.previous)
        const c = state.modifier === "-" ? -parseFloat(state.current) : parseFloat(state.current)
        let result;

        switch (state.operator) {
            case "+": result = p + c; break;
            case "-": result = p - c; break;
            case "*": result = p * c; break;
            case "/": result = p / c; break;
        }

        state.equation = `${state.previous} ${state.operator}${state.modifier ? state.modifier : ""} ${state.current}`;
        state.current = String(result);
        state.previous = "";
        state.operator = null;
        state.modifier = null;
        state.justEvaluated = true;
        
        updateMainDisplay();
    }

        //Resets the state
    function clear() {
        state.equation = "";
        state.current = "";
        state.previous = "";
        state.operator = null;
        state.modifier = null;
        state.justEvaluated = false;

        updateMainDisplay();
    }

        //Removes last char
    function backspace() {
        state.current = state.current.slice(0, -1);

        updateMainDisplay();
    }

        //Listens for buttons and manages them
    buttons.addEventListener('click', (event) => {
        const digitBtn = event.target.closest("[data-value]");
        const operatorBtn = event.target.closest("[data-operator]");
        const actionBtn = event.target.closest("[data-action]")
        
        if (digitBtn) inputDigit(digitBtn.dataset.value);
        if (operatorBtn) inputOperator(operatorBtn.dataset.operator);
        if (actionBtn) {
            switch (actionBtn.dataset.action) {
                case 'equals': equals(); break;
                case 'clear': clear(); break;
                case 'backspace': backspace(); break;
            }
        }

    })  

    updateMainDisplay();
})();