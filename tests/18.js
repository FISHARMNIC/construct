/*
@expects
456
hello!

@end
*/

let a = 5;

let q = 123;

if (a > 6) {
    dbgprint(123);
}
else if("beta" > "alpha") {
    if (false) {
        dbgprint("wait whattttt");
    }
    else {
        q = "hello!";
        dbgprint(456);
    }
}
else {
    q = [1,2,3];
}
dbgprint(q);