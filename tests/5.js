/*
@expects{{{
5
}}}
Tests:
    * No side-effects in dummy mode - Shouldn't re-type "a"
    * Function re-evalutation
*/

function bob()
{
    let q = 123;
    a = q;
}

let a = 1;
dbgprint(a);