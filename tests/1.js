/*
@expects
100
2020
Hello!

@end

@types{{{
global a as NUMBER
global b as NUMBER
global c as IFFY
}}}

Tests:
    * string and number types
    * Dynamic re-typing (iffy/let types)
    * Type coercion for the four main math functions +,-,*,/ 
    * Variable scoping
    * Global code
*/


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

// !IMPORTANT! !HERE! @todo flipping these two causes complex type evaluation fails because retries main and forces A to be redeclared
// to fix: maybe either block same-scope reval or allow redec in dummy mode??
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
