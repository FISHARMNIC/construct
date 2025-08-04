/*
@expects
HELLO 2
3
Hello World!

@end
*/

function bob(a,b)
{
    let c = a + b;
    return c;
}

let a = bob("HELLO ", 2);
let b = bob(1, 2);
let c = bob("Hello ", "World!");

dbgprint(a);
dbgprint(b);
dbgprint(c);