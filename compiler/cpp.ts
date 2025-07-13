import * as ESTree from '@babel/types';
import { buildInfo, eslintScope, walkBody } from './walk';
import ASTerr, { err } from './ASTerr';

declare global {
    interface Map<K, V> {
        add(key: K, value: V): void;
    }
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

let allVars = new Map<ESTree.Identifier, CVariable>();
let allFuncs = new Map<ESTree.Identifier, CFunction>();

let unique_label = 0;
function new_unique() {
    return ++unique_label;
}

export let dummyMode: boolean = false; // doesn't create variables etc. Used for looking ahead
export function setDummyMode(mode: boolean): void
{
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

// safe version of Map::set
Map.prototype.add = function <K, V>(key: K, value: V): void {
    if (!dummyMode) {

        if (this.has(key)) {
            err(`[INTERNAL] map already contains ${value}`);
        }
        else {
            this.set(key, value);
        }
    }
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
            return `static_cast<${to}>(${value})`;
        },
        number(value: string): string {
            return `NUMBER(${value})`
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

            allVars.add(node, {
                type, name, constant
            });

            return (constant ? "const " : "") + type + " " + name + (value.length == 0 ? "" : ` = ${cpp.cast.static(type, value)}`);
        },
        reassign(node: ESTree.Identifier, existingVar: CVariable, value: buildInfo): string {
            if(value.info.type !== existingVar.type && existingVar.type !== cpp.types.IFFY)
            {
                ASTerr(node, `@todo unable to coercer ${existingVar.name} : ${existingVar.type} -> ${value.info.type}`);
            }

            return `${existingVar.name} = ${cpp.cast.static(existingVar.type, value.content)}`;
        },

        get(node: ESTree.Identifier): CVariable | undefined {
            const binding = ident2binding(node);

            if (binding == undefined)
                return binding

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

            allFuncs.add(node, {
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

                // @todo function body here

                let output: string[] = walkBody(body);

                ostring += output.join("\n");

                ostring += "\n}"

                return ostring;
            }
        }
    }
}