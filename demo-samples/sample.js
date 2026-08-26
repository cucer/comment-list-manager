// Adds two numbers together
function add(a, b) {
  return a + b;
}

/**
 * Multiplies two numbers.
 * This block comment spans multiple lines.
 */
function multiply(a, b) {
  return a * b;
}

// Edge case: these look like comment markers but are just string values
const commentMarkers = ['/*', '*/', '//'];

// don't let apostrophes inside a comment break the scanner
function greet(name) {
  return `Hello, ${name}!`; // trailing comment after a template literal
}

module.exports = { add, multiply, greet };
