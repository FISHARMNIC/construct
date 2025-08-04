/*
@expects
[1, 1, 3]

@end
*/

let a = [1,2,3];

a[1] = a[0];

// @todo dbpring('hello') prints undefined?
dbgprint(a);

// let b = a + "HI";
//dbgprint(b);

// a = "hello";