/*
@expects
[1, Hi]

@end

@todo !HERE! !IMPORTANT! Should print "Hi" in single quotes as well as any string in arr
console.log([1, "Hi"]) == [1, 'Hi']
*/
let a = [1, "Hi"];
 
// will fail since first need to implement converting array to dynamic array
// also need to make sure reference is kept though -> as in deep copy
// so this array needs to be make a dynamic array not just casted
// maybe use.replaceWith or something?
// let a = [1, "Hi", [1,2,3]];

dbgprint(a);