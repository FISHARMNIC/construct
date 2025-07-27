/*
!IMPORTANT! !HERE! Fails!
return statement in bob isn't compiling

Tests:
    * Iffys in template functions
    * template functions
*/


function bob(a,b)
{
    a = "aaaaa";
    let c = a + b;
    dbgprint(c);
}

bob(1,2);
bob("Hello ", "World!");