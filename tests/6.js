/*
@expects{{{
3
Hello World!
}}}

@templates{{{
bob takes [NUMBER, NUMBER] returns VOID
bob takes [STRING, STRING] returns VOID
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