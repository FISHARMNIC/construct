/*
@expects{{{
1
}}}

@types{{{
global a as NUMBER
global:bob q as NUMBER
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