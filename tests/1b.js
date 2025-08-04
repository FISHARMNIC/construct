/*
@expects
2020
1.23
Hello

@end

Tests:
    * string and number types
    * Dynamic re-typing (iffy/let types)
    * Type coercion for the four main math functions +,-,*,/ 
    * Variable scoping
    * Global code
*/


// Global variables
let a = 2;

function bob() {
    // Proper scope handling (this a != global a) 
    let a = 1.23;
    let b = "Hello";

    dbgprint(a);
    dbgprint(b);
}

let c = 100;
let b = ("10" + 10) * a;
c = b;

dbgprint(c);
bob();