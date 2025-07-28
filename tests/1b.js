/*
@expects{{{
100
2020
Hello!
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

// THIS FUNCTION WILL CAUSE AN ERROR @todo !important!
// function bob() {
//     // Proper scope handling (this a != global a) 
//     let a = 1.23;
//     let b = "Hello";

//     dbgprint(a);
//     dbgprint(b);
// }

// !important! this forces iffy on "c" because "c = b" and "b" is created after "let c = 10"
// but "b" is a number so c shouldn't be iffy
let c = 100;
let b = ("10" + 10) * a;
c = b;
