/*
@expects{{{
HELLO 2
3
Hello World!
}}}

Tests:
    * Template functions
    * Returns in template functions
    * Mixed params in template calls
*/

function bob(a,b)
{
    let c = a + b;
    let d = c;
    d = "returning: " + c;
    dbgprint(d);
    
    return c;
}

let a = bob("HELLO ",2);
let b = bob(1,2);
let c = bob("Hello ", "World!");

dbgprint(a);
dbgprint(b);
dbgprint(c);