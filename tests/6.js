/*
@expects{{{
3
Hello World!
}}}

Tests:
    * Template functions
*/


function bob(a,b)
{
    let c = a + b;
    dbgprint(c);
}

bob(1,2);
bob("Hello ", "World!");