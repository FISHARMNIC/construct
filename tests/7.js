/*
@expects
aaaaa2
aaaaaWorld!

@end

Tests:
    * Iffys in template functions -> "a" is a let
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