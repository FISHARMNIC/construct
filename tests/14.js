/*

THIS STUFF IS OLD --------
This is tricky because a needs to be casted to a dynamic array but its values kept
    -> if "a" contains an array or object, changing that item needs to change "b" too
    -> so cant just be a clone
    -> need a reference-to-dynamic function that maintains the reference
        -> new type in dynamic called arrayReference
        -> example: convert js::array<js::number> into js:dynamic
        -> process:
            -> should be all done at runtime
            -> template that inserts according type into variant?
            like: given a js::array<js::number> that needs to be converted into a js::dynamic holding js::arrayReference
            
            template T
            requires(T is a js::array) // or object 
            js::dynamic obj2dynref(T object)
            {
                js::dynamic ret = js::arrayReference(&object);
            }
            -> also stores what type the array is using variant or something
            -> the array cannot have any dynamic types for now -> much more complicated
                -> NO RUINS THE WHOLE POINT OF THIS

            // wont work if new items are deleted or old ones are removed
            // think of something else that doesnt loop over each item, instead stores address of array what type it stores
            js::dynamic<js::arrayReference> clone;
            for each item
            {
                if(item type is reference) // array of arrays or objects
                {
                    recursion(item);
                }
                else
                {
                    clone.pushBack(&item);
                }
            }
            return clone;
    -> the arrayReference type will need its corresponding overloads for everything too.
    -> what is dynamic arr was removed from dynamic, so just arrayReferene now

    I think best solution is to backtrack and add array<dynamic> as a type to A
*/


/*
@expects
[100, Hi, [1, 2, 4]]

@end

*/
let a = [1,2,3];

let b = [100, 'Hi', a];

a[2] = 4;

dbgprint(b);