/*
Tests:
    * Template functions
    * Returns in template functions
*/

function bob(a,b)
{
    let c = a + b;
    return c;
}

let w = bob("HELLO ",2);
let y = bob(1,2);
let z = bob("Hello ", "World!");

dbgprint(w);
dbgprint(y);
dbgprint(z);