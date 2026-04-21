// c will not hold reference to b!

let b = [1,2,3];

let c = "hello!";
c = b;

c[1] = 100;

dbgprint(b);
dbgprint(c);