/*
Tests:
    * parameter "a" shadows global
    * 
*/

let a = 10;

function bob(a)
{
    let b = a + 5;
    dbgprint(a);
}

bob(a);