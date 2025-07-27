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

let y = bob(1,2);
let z = bob("Hello ", "World!");

dbgprint(y);
dbgprint(z);