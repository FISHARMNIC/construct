// This code can be compiled by Construct!

let a = 123;
dbgprint(a + 1000); // math

let b = a;
b = "Hello";
b = [1, 2, 3]; // dynamic types

function scale(me)
{
    dbgprint(me * 10);

    return me + " dollar(s)";
}

// templated functions
scale(a);           // a is a number    : 123 * 10 = 1230
scale(b);           // b is a dynamic   :  [1,2,3] * 10 = NaN
let q = scale([1]); // this is an array : [1] * 10 = 10
dbgprint(q);

// proper JS coercion
dbgprint([8000] + " Hello!");
dbgprint(("12360.7079633" - 12345) / [[["5.0"]]]);

let v = 123

// branching
if((a / 100) < 1000)
{
    dbgprint("yup");
    v = "321";
}
else if("pie" < "apple")
{
    dbgprint("hmmm");
    v = [321];
}
else
{
    dbgprint("nope");
    v = false;
}

// branch-dependent types
dbgprint(v);

// loops
let z = 0;
while(z < 3)
{
    dbgprint(z + " bottles");
    z = z + 1;
}

// funky arrays
dbgprint([1, "hi", ["hello", true * false, false]]);