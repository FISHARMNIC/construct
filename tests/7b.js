/*
@expects{{{
aaaaa2
aaaaaWorld!
}}}

Tests:
    * Iffys in template functions
        -> bob_0 takes dynamic as first param since a is passed as an int but given string later
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