// Global variables
let a = 2;

// Functions (no params no return yet)
function bob() {
    // Proper scope handling (this a != global a) 
    let a = 1.23;
    let b = "Hello";

    dbgprint(a);
    dbgprint(b);
}

// Proper JS type coercion (only for the 4 main math functions for now)
// note that flipping these two decs causes lookahead issues since c is reassigned to b, which won't be declared
// still works but forces c to be a "let" instead
let b = ("10" + 10) * a;
let c = 100;

// 100
dbgprint(c);

// Reassignment
a = 10;
c = b;

// c = b = ("10" + 10) * 2 = "1010" * 2 = number 2020
dbgprint(c);

// Re-typing
c = "Hello!";

dbgprint(c);
