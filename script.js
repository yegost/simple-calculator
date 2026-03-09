const calculator = (() => {
    const mainDisplay = document.getElementById('display-current');
    const secondaryDisplay = document.getElementById('display-equation');
    const buttons = document.getElementById('buttons');  
    const panel = document.getElementById("history-panel");
    const closeBtn = document.getElementById("history-close");

        //Operator classification    
    const PRIMARY_OPERATORS = new Set(['*', '/']);
    const SIGN_MODIFIERS = new Set(['+', '-']);

        //Where variables are stored
    const state = { 
        equation: '',
        current: '', 
        previous: '', 
        operator: null, 
        modifier: null,
        justEvaluated: false,
        percentDisplay: null
    };

        //Updates the main display
    function updateMainDisplay() {
        const currentPart = state.percentDisplay ? state.percentDisplay : state.current;
        if (state.justEvaluated) {
            secondaryDisplay.value = state.equation;
            mainDisplay.value = state.current;
        } else if (state.operator) {
            const modPart = state.modifier ? `${state.modifier}` : '';

            mainDisplay.value = `${state.previous}${state.operator}${modPart}${currentPart}`;
            secondaryDisplay.value = '';
        } else {
            mainDisplay.value = currentPart !== '' ? currentPart : '0';
            secondaryDisplay.value = '';
        }

        const length = mainDisplay.value.length;
        if (length > 12) mainDisplay.style.fontSize = '24px';
        else if (length > 8) mainDisplay.style.fontSize = '32px';
        else mainDisplay.style.fontSize = '48px';
    }

        //Adds numbers as strings to the state and handles dots
    function inputDigit(digit) {
        if (state.justEvaluated) clear();
        state.percentDisplay = null;
        if (digit === '.' && state.current.includes('.')) return;
        if (digit === '.' && state.current === '') {
            state.current = '0.';
            updateMainDisplay();
            return;
        }

        state.current += digit;
        updateMainDisplay();
    }

        //Attaches the operator to state
    function inputOperator(operator) {
        if (state.justEvaluated) {
            state.justEvaluated = false;
        }
        if (state.current === '' && state.previous === '') {
            state.previous = '0';
            state.operator = operator;
            state.modifier = null;
            updateMainDisplay();
            return;
        }
        if (state.current.endsWith('.')) {
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
        const c = state.modifier === '-' ? -parseFloat(state.current) : parseFloat(state.current)
        const currentLabel = state.percentDisplay ? state.percentDisplay : state.current;
        let result;

        switch (state.operator) {
            case '+': result = p + c; break;
            case '-': result = p - c; break;
            case '*': result = p * c; break;
            case '/': result = p / c; break;
        }

        state.equation = `${state.previous} ${state.operator}${state.modifier ? state.modifier : ''} ${currentLabel}`;
        state.current = String(result);
        state.previous = '';
        state.operator = null;
        state.modifier = null;
        state.justEvaluated = true;
        state.percentDisplay = null;
        
        updateMainDisplay();
    }

        //Resets the state
    function clear() {
        state.equation = '';
        state.current = '';
        state.previous = '';
        state.operator = null;
        state.modifier = null;
        state.justEvaluated = false;
        state.percentDisplay = null;

        updateMainDisplay();
    }

        //Removes last char
    function backspace() {
        state.current = state.current.slice(0, -1);

        updateMainDisplay();
    }

    function inputPercent() {
        if (state.current === '') return;

        state.percentDisplay = state.current + '%';

        let result;
        const c = parseFloat(state.current);
        const p = parseFloat(state.previous);

        if (state.previous !== '' && (state.operator === '+' || state.operator === '-')) {
            result = (c / 100) * p; 
        } else {
            result = c / 100;
        }
        
        state.current = String(result);
        updateMainDisplay();
    }
    
    function showHistory() {
        panel.classList.add("open");
    }

        //Listens for buttons and manages them
    buttons.addEventListener('click', (event) => {
        event.target.blur();

        const digitBtn = event.target.closest('[data-value]');
        const operatorBtn = event.target.closest('[data-operator]');
        const actionBtn = event.target.closest('[data-action]')
        
        if (digitBtn) inputDigit(digitBtn.dataset.value);
        if (operatorBtn) inputOperator(operatorBtn.dataset.operator);
        if (actionBtn) {
            switch (actionBtn.dataset.action) {
                case 'equals': equals(); break;
                case 'clear': clear(); break;
                case 'backspace': backspace(); break;
                case 'percent': inputPercent(); break;
                case 'history': showHistory(); break;
            }
        }
    });

        //Keyboard mapping
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') equals();
        if (event.key === 'Backspace') backspace();
        if (event.key === 'Delete') clear();
        if (event.key === 'h') showHistory();
        if (event.key === '%') inputPercent();
        if (event.key === '+') inputOperator('+');
        if (event.key === '-') inputOperator('-');
        if (event.key === '*') inputOperator('*');
        if (event.key === '/') {
            event.preventDefault();
            inputOperator('/');
        }
        if (event.key === '.') inputDigit('.');
        if ('0123456789'.includes(event.key)) inputDigit(event.key);
    });

    closeBtn.addEventListener("click", () => {
        panel.classList.remove("open");
    });

    updateMainDisplay();
})();