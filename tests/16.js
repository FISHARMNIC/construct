let a = 0;

let b = true;

let c = b + "123";

// @todo this should be true123, not 1123. Its calling the js::number overload
dbgprint(c);

// while(a < 10)
// {
//     dbgprint(a)
//     a = a + 1;
// }
