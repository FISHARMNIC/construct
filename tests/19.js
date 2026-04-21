/*
@expects
Hello
10
Hello
[1, 2, 3]
Hello

@end

Tests scoping
*/

let bob = "Hello";

function a()
{
    let bob = 10;
    dbgprint(bob);
}

function b()
{
    let bob = [1,2,3];
    dbgprint(bob);
}

dbgprint(bob);
a();
dbgprint(bob);
b();
dbgprint(bob);