import { cpp } from "./cpp";
import { ctype } from "./ctypes";

/**

Takes a multiple types and returns the best type that encompasses all those

for now, just the basic types and the regular iffy

In the future this could split dynamic types by domain (for example scalar/object) to reduce std::variant overhead.

*/
export function typeList2type(types: ctype[]): ctype
{
    if(types.length == 0)
    {
        return cpp.types.VOID;
    }

    const unique = new Set(types);

    if(unique.size == 1)
    {
        return types[0];
    }

    const isDynArr = types.every(cpp.types.isArray);

    return isDynArr? cpp.types.ARRAY(cpp.types.IFFY) : cpp.types.IFFY;
}

export function typeSet2type(types: Set<ctype>): ctype
{
    return typeList2type([...types]);
}
