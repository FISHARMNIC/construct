/*
Tests:
    * function revaluation. bob cannot be compiled until after "a" is declared
*/


function bob()
{
    let c = a;
    return c;
}

let a = 10;

let q = bob();
dbgprint(q);