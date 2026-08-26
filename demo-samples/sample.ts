// Returns the square of a number
function square(n: number): number {
  return n * n;
}

/**
 * Represents a simple point in 2D space.
 */
interface Point {
  x: number;
  y: number;
}

// Edge case: an array of strings containing comment-like markers
const fakeComments: string[] = ['// not a comment', '/* also not a comment */'];

function distance(a: Point, b: Point): number {
  // Using the Pythagorean theorem here
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export { square, distance, Point };
