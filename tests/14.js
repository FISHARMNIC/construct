/*
@expects
[100, Hi, [1, 2, 4]]

@end

*/
let a = [1,2,3];

let b = [100, 'Hi', a];

a[2] = 4;

dbgprint(b);