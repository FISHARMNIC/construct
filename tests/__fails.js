/*
    @todo !important! hoisting needs to be implemented
*/

bob(1,2);
bob("Hello ", "World!");

function bob(a,b)
{
    let c = a + b;
    dbgprint(c);
}