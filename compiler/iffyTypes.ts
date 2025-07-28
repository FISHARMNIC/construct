import { cpp } from "./cpp";
import { ctype } from "./ctypes";

/**

Takes a multiple types and returns the best type that encompasses all those

for now, just the basic types and the regular iffy

@todo in the future there should be different iffys for string/number, object/array, etc to reduce the std::variant overhead

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

    // @todo optimize for different iffy types
    return cpp.types.IFFY;
}

export function typeSet2type(types: Set<ctype>): ctype
{
    return typeList2type([...types]);
}