import * as ESTree from '@babel/types';

type ctype = string;

interface CVariable
{
    type: ctype,
    name: string,
    constant: boolean,
}

let allVars = new Map<ESTree.Identifier, CVariable>();

export default {
    types:
    {
        NUMBER: "number",
        STRING: "string",
        ARRAY: "ERROR_NOT_IMPLEMENTED",
        UNKNOWN: "let"
    },
    cast:
    {
        static(to: ctype, value: string): string
        {
            return `static_cast<${to}>(${value})`;
        }
    },
    string:
    {
        fromCstr(cstr: string): string
        {
            return `std::string("${cstr}")`;
        }
    },
    variables:
    {
        all: allVars,
        create(node: ESTree.Identifier, type: ctype, name: string, value: string, constant: boolean = false): string
        {
            allVars.set(node, {
                type, name, constant
            });

            return (constant ? "const " : "") + type + " " + name + (value.length == 0? "" : ` = ${value}`);
        }
    }
}