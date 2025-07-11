// Global variables
let a = 1.23;
let b = "Hello";

// Functions (no params no return yet)
function main()
{
    // Proper scope handling (this a != global a) 
    let a = 2;
    // Proper JS type coercion (only for 4-main math for now)
    // note that flipping these two decs causes lookahead issues since c is reassigned to b, which won't be declared
    // still works but forces c to be a "let" instead
    let b = ("10" + 10) * a;
    let c = 100;

    dbgprint(c);

    // Reassignment
    a = 10;
    c = b;

    dbgprint(b);
}