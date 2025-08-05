/*
@expects
20
10
[1, 2, 3]

@end

*/

function bob(a,b)
{
    let c = a * b;
    dbgprint(c);
}

function joe(a)
{
    // push stuff with go here
    // just to check copy constructor doesn't create new array 
}

bob([2], 10);
bob("5", 2);

let a = [1,2,3];
joe(a);
dbgprint(a);