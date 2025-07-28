/*
@expects{{{
10
}}}

Tests:
    * Normal calls and returns
    * Iffy in normal function
*/

function bob()
{
    let c = 10;
    c = 'hi';
    return c;
}

let q = bob();
dbgprint(q);