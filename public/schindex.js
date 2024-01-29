const root = ReactDOM.createRoot(document.getElementById("root"));

class Decimal extends React.Component {
	render() {
		return (
			<div
				onClick={this.props.onKeypress}
				className="decimal key"
				id="decimal"
			>
				.
			</div>
		);
	}
}

class Clear extends React.Component {
	render() {
		return (
			<div
				onClick={this.props.onKeypress}
				className="clear key"
				id="clear"
			>
				AC
			</div>
		);
	}
}

class Equals extends React.Component {
	render() {
		return (
			<div
				onClick={this.props.onKeypress}
				className="equals key"
				id="equals"
			>
				=
			</div>
		);
	}
}

class Keys extends React.Component {
	render() {
		const numbers = createNumbers(this.props.onKeypress);
		const operators = createOperators(this.props.onKeypress);
		const clear = <Clear onKeypress={this.props.onKeypress} />;
		const equals = <Equals onKeypress={this.props.onKeypress} />;
		const decimal = <Decimal onKeypress={this.props.onKeypress} />;
		const keysContainer = createKeysContainer(
			numbers,
			operators,
			clear,
			equals,
			decimal
		);

		return keysContainer;
	}
}

class Display extends React.Component {
	render() {
		return (
			<div id="display-area">
				<div id="expression">{this.props.expression}</div>
				<div id="display">{this.props.display}</div>
			</div>
		);
	}
}

class Calculator extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			expression: "",
			display: "0",
		};
		this.handleKeypress = this.handleKeypress.bind(this);
		this.handleOperators = this.handleOperators.bind(this);
		this.handleEquals = this.handleEquals.bind(this);
	}

	// * AUSGELAGERTES GLEICHZEICHEN HANDLING
	handleEquals() {
		let expr = this.state.expression;
		const divideByZero = /(\/0)/g;
		const trailingZeros = /\.*0+$/g;
		const operatorsAtEnd = /[+-/*]$/g;

		if (!operatorsAtEnd.test(expr) && !divideByZero.test(expr)) {
			// eslint-disable-next-line
			let expressionResult = eval(expr).toFixed(4);
			expressionResult = expressionResult.replace(trailingZeros, "");
			this.setState((prevState) => {
				return {
					expression: prevState.expression + "=" + expressionResult,
					display: expressionResult,
				};
			});
		}
		return;
	}

	// * AUSGELAGERTES OPERATOR HANDLING
	handleOperators(pressedKey, previousKey, containsOperators) {
		let expr = this.state.expression;
		let firstCharIsOperator = /^[*/]/;
		const secondToLastKey = expr.charAt(expr.length - 2);

		//  * DO NOT ALLOW OPERATORS AS FIRST INPUT
		if (firstCharIsOperator.test(pressedKey) && expr.length === 0) {
			return;
		}

		//  * IF A RESULT WAS CALCULATED RENEW THE EXPRESSION
		if (expr.includes("=")) {
			let result = expr.substring(expr.indexOf("=") + 1);
			this.setState({
				expression: result + pressedKey,
				display: pressedKey,
			});
			return;
		}

		// * DRITTER OPERATOR DARF KEIN MINUS SEIN, UND DIE EXPRESSION WIRD RESETTED
		if (
			previousKey === "-" &&
			containsOperators.test(secondToLastKey) &&
			pressedKey !== "-"
		) {
			this.setState((prevState) => {
				return {
					expression: prevState.expression.slice(0, -2) + pressedKey,
					display: pressedKey,
				};
			});
			return;
		}

		// * ZWEITER OPERATOR DARF NUR MINUS SEIN
		if (containsOperators.test(previousKey) && pressedKey !== "-") {
			return;
		}

		// * GRUNDSÄTZLICH KETTEN WIR IMMER ANEINANDER
		this.setState((prevState) => {
			return {
				expression: prevState.expression + pressedKey,
				display: pressedKey,
			};
		});
	}

	// * JEDER KEY DER GEDRÜCKT WIRD HANDLING
	handleKeypress(e) {
		const expStr = this.state.expression;
		const displayStr = this.state.display;
		const pressedKey = e.target.innerHTML;
		const previousKey = expStr.charAt(expStr.length - 1);

		const containsOperators = /[+-/*]/g;

		// * DIGITAL LIMIT
		if (displayStr.length === 15) {
			this.setState({ display: "DIGITAL LIMIT MET" });
			return;
		}

		switch (pressedKey) {
			case "AC":
				this.setState({ expression: "", display: "0" });
				break;
			case "-":
			case "+":
			case "*":
			case "/":
				this.handleOperators(
					pressedKey,
					previousKey,
					containsOperators
				);
				break;
			case "=":
				this.handleEquals();
				break;
			case ".":
				// * ONLY ONE . PER NUMBER
				let expArr = expStr.split(/[+\-*/]/);
				if (expArr[expArr.length - 1].includes(".")) {
					break;
				}
				// * DEFAULT CASE .
				this.setState((prevState) => {
					let displayString = containsOperators.test(previousKey)
						? pressedKey
						: prevState.display + pressedKey;
					return {
						expression: prevState.expression + pressedKey,
						display: displayString,
					};
				});
				break;
			// * ALLE ZAHLEN
			default:
				// * 0 IST SPEZIALFALL
				if (displayStr[0] === "0") this.setState({ display: "" });

				// * RESTLICHE ZAHLEN
				this.setState((prevState) => {
					let displayString = containsOperators.test(previousKey)
						? pressedKey
						: prevState.display + pressedKey;
					if (previousKey === ".")
						displayString = prevState.display + pressedKey;
					return {
						expression: prevState.expression + pressedKey,
						display: displayString,
					};
				});
				break;
		}
	}

	render() {
		return (
			<div id="calculator">
				<Display
					display={this.state.display}
					expression={this.state.expression}
				/>
				<Keys onKeypress={this.handleKeypress} />
				<p className="credits credits-top">
					Designed by Peter Weinberg
				</p>
				<p className="credits">Coded by Kamran Babazadeh</p>
			</div>
		);
	}
}

function App() {
	return <Calculator />;
}

root.render(<App />);

// * KEYBOARD FUNCTIONALITY
document.addEventListener("keydown", (event) => {
	let pressedKey = myObjIncludes(event.key);
	if (pressedKey) {
		let correspondingElement = document.getElementById(pressedKey);
		correspondingElement.click();
	}
});

const operatorNames = {
	"+": ["add", "+"],
	"-": ["subtract", "-"],
	"*": ["multiply", "*"],
	"/": ["divide", "/"],
};
function createOperators(handleKeypress) {
	const operators = [];
	for (const [key, value] of Object.entries(operatorNames)) {
		operators.push(
			<div
				className={value[1] + " key operators"}
				id={value[0]}
				key={key}
				onClick={handleKeypress}
			>
				{key}
			</div>
		);
	}
	return operators;
}

function createNumbers(handleKeypress) {
	const keyNames = {
		0: "zero",
		1: "one",
		2: "two",
		3: "three",
		4: "four",
		5: "five",
		6: "six",
		7: "seven",
		8: "eight",
		9: "nine",
	};
	const numbers = [];
	for (let i of Object.keys(keyNames)) {
		numbers.push(
			<div
				className={keyNames[i] + " key numbers"}
				id={keyNames[i]}
				key={keyNames[i]}
				onClick={handleKeypress}
			>
				{i}
			</div>
		);
	}
	return numbers;
}

function createKeysContainer(numbers, operators, clear, equals, decimal) {
	return (
		<div className="keys-container">
			{clear}
			{operators[3]}
			{operators[2]}
			{numbers[7]}
			{numbers[8]}
			{numbers[9]}
			{operators[1]}
			{numbers[4]}
			{numbers[5]}
			{numbers[6]}
			{operators[0]}
			{numbers[1]}
			{numbers[2]}
			{numbers[3]}
			{equals}
			{numbers[0]}
			{decimal}
		</div>
	);
}

function myObjIncludes(eventKey) {
	let keyboardMap = {
		zero: "0",
		one: "1",
		two: "2",
		three: "3",
		four: "4",
		five: "5",
		six: "6",
		seven: "7",
		eight: "8",
		nine: "9",
		clear: "a",
		add: "+",
		subtract: "-",
		multiply: "*",
		divide: "/",
		equals: "Enter",
		decimal: ".",
	};
	for (let key in keyboardMap) {
		if (keyboardMap.hasOwnProperty(key) && keyboardMap[key] === eventKey) {
			return key;
		}
	}
	return false;
}
