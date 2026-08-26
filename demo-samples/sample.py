# Returns the factorial of n
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)


"""
This is a module-level docstring style comment
used to test multi-line block detection.
"""


def greet(name):
    # don't forget: apostrophes shouldn't break parsing
    message = "hello, it's a great day"  # trailing comment
    return f"{message}, {name}!"


# Edge case: a string that looks like a comment marker
fake_comment = "# this is not a comment, just a string"
