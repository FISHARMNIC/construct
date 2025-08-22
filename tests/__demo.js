// !!!!BROKEN!!!!

let a = 123;
let b = [1,2, a + 10];

dbgprint(b);

let c = "hello!";
c = 1000;

function eek(bob)
{
    dbgprint(bob * 10);
}

if(a > 100)
{
    while(a < 130)
    {
        dbgprint(a);
        a = a + 1;
    }
    c = a * 5;
    dbgprint([10] * 10 + " chickens");
    dbgprint(c);

    eek(c);
    eek(a);
    eek("hi");
}
else
{
    dbgprint(["whatttttt", 2, 3]);
}