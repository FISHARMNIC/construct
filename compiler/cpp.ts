import * as ESTree from '@babel/types';
import { eslintScope } from './walk';
import { err } from './ASTerr';

type ctype = string;

interface CVariable
{
    type: ctype,
    name: string,
    constant: boolean,
}

let allVars = new Map<ESTree.Identifier, CVariable>();

// this is an absolutley disgusting TEMPORARY function until I'm not lazy and fix the walker to store path info
export function ident2binding(node: ESTree.Identifier): ESTree.Identifier | undefined {

  for (const s of eslintScope.scopes) {
    for (const v of s.variables) {
      for (const r of v.references) {
        if (r.identifier === node) {
          return v.identifiers[0];
        }
      }
    }
  }
  return undefined;
}

let unique_label = 0;

function new_unique()
{
    return ++unique_label;
}

export let cpp =  {
    types:
    {
        NUMBER: "js::number",
        FUNCTION: "void*", // @todo use cpp function types
        STRING: "js::string",
        ARRAY: "ERROR_NOT_IMPLEMENTED",
        UNKNOWN: "let",
        LATER: function() {
            return `__TYPE_${new_unique()}__` // @todo use macros to replace later
        }
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
            return `${cpp.types.STRING}("${cstr}")`;
        }
    },
    variables:
    {
        all: allVars,
        exists(node: ESTree.Identifier): boolean
        {
            const binding = ident2binding(node);
            return binding != undefined && allVars.has(binding);
        },
        create(node: ESTree.Identifier, type: ctype, name: string, value: string, constant: boolean = false): string
        {
            allVars.set(node, {
                type, name, constant
            });

            return (constant ? "const " : "") + type + " " + name + (value.length == 0? "" : ` = ${value}`);
        },
        get(node: ESTree.Identifier): CVariable | undefined
        {
            const binding = ident2binding(node);

            if(binding == undefined)
                return binding

            return allVars.get(binding);
        }
    },
    functions:
    {
        create(name: string, params: ESTree.FunctionParameter[], body: ESTree.BlockStatement)
        {
            if(params.length != 0)
            {
                // use variable create to store them
                err("@todo parameters not implemented")
            }
            else
            {
                // @todo find some way to return the later

                let returnT = cpp.types.LATER();
                let ostring = `${returnT} ${name}()\n{\n`

                // @todo function body here

                ostring += "\n}"

                return ostring;
            }
        }
    }
}