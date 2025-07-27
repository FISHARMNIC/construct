/*
@expects{{{
10
}}}

Tests:
    * Normal calls and returns

*/

function bob()
{
    let c = 10;
    return c;
}

let q = bob();
dbgprint(q);