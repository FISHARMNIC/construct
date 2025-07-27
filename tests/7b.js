/*
@expects{{{
aaaaa2
aaaaaWorld!
}}}

Tests:
    * Iffys in template functions
    * template functions
    * Template returns
*/


function bob(a,b)
{
    a = "aaaaa";
    let c = a + b;
    return c;
}

let y = bob(1,2);
let z = bob("Hello ", "World!");

dbgprint(y);
dbgprint(z);