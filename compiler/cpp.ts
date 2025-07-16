/*

@todo MAJOR ISSUE
========================================
Dummy mode should still create the variables temporarily
If theres the function:
'''
function bob()
{
    let a = 10;
    dbgprint(a);
}
'''
And it is evaluated in dummy mode, then 'a' will show up as invalid on the dbgprint line

SOLUTION:
At the beginning of a dummy walk on a BLOCKSTATEMENT ONLY add an empty list to the temp stack
Instead of just not adding new vars/funcs to the map, add them temporarily
    -> add them to the last list on the temp stack
at the end of a dummy walk of a BLOCKSTATEMENT, inside the walk fn itself clear all temporaries 
    -> as in delete all items that exist in the last list in the temp stack
    -> then remove the last list itself as to make the stack smaller / go back to jow it was before

note: no issues with nested functions are fine because they need to be try evaled before they are compiled anyways



========================================

C++ bindings

Each function returns a string with the compiled code

In normal mode:
    Calling any function here may have side effects such as:
        * Noting a new variable along with it's type 
        * Noting a new function along with everything that it associates with

In dummy mode:
    Doing things like creating a variable won't have any side effects (i.e. the variable won't be marked)
    This is used to try the evluation of something before actually doing it


*/


import * as ESTree from '@babel/types';
import { buildInfo, walkBody } from './walk';
import { ast, eslintScope } from './main';
import ASTerr, { err } from './ASTerr';

declare global {
    interface Map<K extends ESTree.Identifier, V> {
        add(key: K, to: string, value: V): void;
    }
}

// safe version of Map::set
Map.prototype.add = function <K extends ESTree.Identifier, V>(key: K, to: string, value: V): void {
    //if (!dummyMode) {

    if (this.has(key)) {
        err(`[INTERNAL] map already contains ${value}`);
    }
    else {
        this.set(key, value);

        if (dummyMode) {

            let last = tempStack.at(-1);

            if (last != undefined) {
                last[to].push(key);
                console.log("ijoj")
            }
            else {
                err('[INTERNAL] no tempstack exists');
            }
        }

    }
    //}
}

export type ctype = string;

interface CVariable {
    type: ctype,
    name: string,
    constant: boolean,
}

interface CFunction {
    return: ctype;
    name: string,
    parameters: ESTree.FunctionParameter[]
}

export let allVars = new Map<ESTree.Identifier, CVariable>();
export let allFuncs = new Map<ESTree.Identifier, CFunction>();

export interface stackInfo {
    funcs: ESTree.Identifier[],
    vars: ESTree.Identifier[]
}

export let tempStack: stackInfo[] = [];

let unique_label = 0;
function new_unique() {
    return ++unique_label;
}

export let dummyMode: boolean = false; // doesn't create variables etc. Used for looking ahead
export function setDummyMode(mode: boolean): void {
    dummyMode = mode;
}

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

export let cpp = {
    types:
    {
        NUMBER: "js::number",
        FUNCTION: "void*", // @todo use cpp function types
        STRING: "js::string",
        ARRAY: "ERROR_NOT_IMPLEMENTED",
        IFFY: "let",
        AUTO: "auto", // only to be used by functions
        BOOLEAN: "boolean",
        // @todo null literals
        LATER: function () {
            return `__TYPE_${new_unique()}__` // @todo use macros to replace later
        }
    },
    cast:
    {
        static(to: ctype, value: string): string {
            let castTo = `static_cast<${to}>`;

            // already being casted
            if (value.slice(0, castTo.length) == castTo) {
                return value;
            }
            else {
                return `${castTo}(${value})`;
            }
        },
        number(value: string): string {
            return cpp.cast.static(cpp.types.NUMBER, value)
        }
    },
    string:
    {
        fromCstr(cstr: string): string {
            return `${cpp.types.STRING}("${cstr}")`;
        }
    },
    variables:
    {
        all: allVars,
        exists(node: ESTree.Identifier): boolean {
            const binding = ident2binding(node);
            return binding != undefined && allVars.has(binding);
        },
        create(node: ESTree.Identifier, type: ctype, name: string, value: string, constant: boolean = false): string {
            if (allVars.has(node)) {
                ASTerr(node, `Identical variable "${name}" already declared`);
            }

            allVars.add(node, 'vars', {
                type, name, constant
            });

            return (constant ? "const " : "") + type + " " + name + (value.length == 0 ? "" : ` = ${cpp.cast.static(type, value)}`);
        },
        reassign(node: ESTree.Identifier, existingVar: CVariable, value: buildInfo): string {
            if (value.info.type !== existingVar.type && existingVar.type !== cpp.types.IFFY) {
                ASTerr(node, `@todo unable to coercer ${existingVar.name} : ${existingVar.type} -> ${value.info.type}`);
            }

            return `${existingVar.name} = ${cpp.cast.static(existingVar.type, value.content)}`;
        },

        /// Returns null if no binding at all (variable isn't declared anywhere scopewise), returns undefined if variable is declared but hasn't been interp yet
        get(node: ESTree.Identifier): CVariable | undefined | null {
            const binding = ident2binding(node);

            if (binding == undefined)
                return null;

            return allVars.get(binding);
        }
    },
    functions:
    {
        all: allFuncs,
        create(node: ESTree.Identifier, name: string, params: ESTree.FunctionParameter[], block: ESTree.BlockStatement) {
            let body = block.body;

            if (allFuncs.has(node)) {
                ASTerr(node, `Identical function "${name}" already declared`);
            }

            allFuncs.add(node, 'funcs', {
                return: cpp.types.AUTO,
                parameters: params,
                name,
            });

            if (params.length != 0) {
                // use allVars to create to store them
                err("@todo parameters not implemented");
            }
            else {
                let ostring = `auto ${name}()\n{\n`;

                /*

                HERE 

                @todo add to funcs and use evaluateAllFunctions from funcs.ts

                Buildinfo should contain an optional property that causes replacement if triggered
                This is so that if a function fails to eval, it can be revaled later on the next function creation

                also find some way to pass .replacement binding

                */

                let output: string[] = walkBody(body);

                ostring += output.join("\n");

                ostring += "\n}"

                return ostring;
            }
        }
    }
}