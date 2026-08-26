public class Sample {
    // Returns the maximum of two integers
    public static int max(int a, int b) {
        return a > b ? a : b;
    }

    /*
     * Checks whether a number is even.
     * This is a multi-line block comment.
     */
    public static boolean isEven(int n) {
        return n % 2 == 0;
    }

    public static void main(String[] args) {
        // Edge case: string literal containing comment markers
        String tricky = "/* not a real comment */ and // not this either";
        System.out.println(tricky);
        System.out.println(max(3, 7));
    }
}
