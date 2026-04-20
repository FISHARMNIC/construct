/*

C++ bindings

each function here returns a string with compiled c++ code

in normal mode:
    calling things here can have side effects
        -> make new vars
        -> make new funcs
        -> update tracked types

in dummy mode:
    side effects are temporary
    -> things are still "created" so lookup works
    -> cleanup later removes them from the real maps

*/

import * as ESTree from '@babel/types';
import { buildInfo, nestLevel, replaceObj, stringTobuildInfo } from './walk';
import { eslintScope } from './main';
import { ASTerr_kill, ASTerr_throw, err } from './ASTerr';
import { evaluateAllFunctions, unevaledFuncs } from './funcs';
import { addType, CFunction, CTemplateFunction, ctype, CVariable, getType, stackInfo } from './ctypes';
import { normalTypeLists } from './iffy';
import { typeList2type, typeSet2type } from './iffyTypes';
import { cleanup } from './cleanup';

let allVars: Map<ESTree.Identifier, CVariable> = new Map<ESTree.Identifier, CVariable>();
let allGlobalVars: CVariable[] = [];
let allFuncs: Map<ESTree.Identifier, CFunction> = new Map<ESTree.Identifier, CFunction>();
let allTemplateFuncs: Map<ESTree.Identifier, CTemplateFunction> = new Map<ESTree.Identifier, CTemplateFunction>();
export let tempStack: stackInfo[] = [];
let dummyLevel: number = 0;
// cache identifier -> declaration binding to avoid re-walking eslintScope every lookup
const identBindingCache: Map<ESTree.Identifier, ESTree.Identifier | null> = new Map();
const functionBindingCache: Map<ESTree.Identifier, ESTree.Identifier | null> = new Map();

interface ScopeLike {
    references: ScopeReferenceLike[];
    variables: ScopeVariableLike[];
    set: Map<string, ScopeVariableLike>;
}

interface ScopeReferenceLike {
    identifier: ESTree.Identifier;
    resolved: ScopeVariableLike | null;
}

interface ScopeVariableLike {
    identifiers: ESTree.Identifier[];
    defs: ScopeDefinitionLike[];
}

interface ScopeDefinitionLike {
    type: string;
    node: {
        type: string;
        id?: ESTree.Identifier | null;
    };
}

function allScopes(): ScopeLike[] {
    return ((eslintScope as { scopes?: ScopeLike[] }).scopes ?? []);
}

function getFunctionDefBinding(variable: ScopeVariableLike, expectedName?: string): ESTree.Identifier | undefined {
    for (const def of variable.defs) {
        if (def.type !== "FunctionName" || def.node.type !== "FunctionDeclaration" || !def.node.id) {
            continue;
        }

        if (!expectedName || def.node.id.name === expectedName) {
            return def.node.id;
        }
    }

    return undefined;
}

function variable2binding(variable: ScopeVariableLike, preferFunction: boolean, expectedName?: string): ESTree.Identifier | undefined {
    if (preferFunction) {
        const fnBinding = getFunctionDefBinding(variable, expectedName);
        if (fnBinding) {
            return fnBinding;
        }
    }

    if (variable.identifiers.length > 0) {
        return variable.identifiers[0];
    }

    return getFunctionDefBinding(variable, expectedName);
}

function resolveBinding(node: ESTree.Identifier, preferFunction: boolean): ESTree.Identifier | undefined {
    // hot path: most nodes get looked up repeatedly across passes
    const cache = preferFunction ? functionBindingCache : identBindingCache;
    if (cache.has(node)) {
        return cache.get(node) ?? undefined;
    }

    for (const scope of allScopes()) {
        for (const ref of scope.references) {
            if (ref.identifier !== node || ref.resolved == null) {
                continue;
            }

            const bindingFromRef = variable2binding(ref.resolved, preferFunction, node.name);
            if (bindingFromRef) {
                cache.set(node, bindingFromRef);
                return bindingFromRef;
            }
        }
    }

    for (const scope of allScopes()) {
        const variable = scope.set.get(node.name);
        if (!variable || !variable.identifiers.includes(node)) {
            continue;
        }

        const bindingFromDeclaration = variable2binding(variable, preferFunction, node.name);
        if (bindingFromDeclaration) {
            cache.set(node, bindingFromDeclaration);
            return bindingFromDeclaration;
        }
    }

    cache.set(node, null);
    return undefined;
}

type TempSymbolStackKey = 'funcs' | 'templateFuncs' | 'vars';

function mapAddAndTrack<T>(map: Map<ESTree.Identifier, T>, key: ESTree.Identifier, value: T, tempStackKey: TempSymbolStackKey): void {
    if (map.has(key)) {
        err(`[INTERNAL] map already contains ${key.name}`);
    }

    map.set(key, value);

    // in dummy mode we still register symbols, but we also track them for rollback
    if (!inDummyMode()) {
        return;
    }

    const last = tempStack.at(-1);
    if (!last) {
        err('[INTERNAL] no tempstack exists');
    }

    last[tempStackKey].push(key);
}

cleanup.cpp = function () {
    allVars = new Map<ESTree.Identifier, CVariable>();
    allGlobalVars = [];
    allFuncs = new Map<ESTree.Identifier, CFunction>();
    allTemplateFuncs = new Map<ESTree.Identifier, CTemplateFunction>();
    tempStack = [];
    dummyLevel = 0;
    identBindingCache.clear();
    functionBindingCache.clear();
}

/// !warning! no cleanup nor tempstack
export function enterDummyMode_raw() {
    dummyLevel++;
    console.log("[dummy] ENTERING to", dummyLevel);
}

/// !warning! no cleanup nor tempstack
export function exitDummyMode_raw() {
    if (dummyLevel > 0) {
        dummyLevel--;
        console.log("[dummy] EXITING to", dummyLevel);
    }
}

export function inDummyMode(): boolean {
    return dummyLevel != 0;
}

export function __dummyModeGlevel(): number {
    return dummyLevel;
}


export function ident2binding(node: ESTree.Identifier): ESTree.Identifier | undefined {
    return resolveBinding(node, false);
}

export function fnIdent2binding(fnID: ESTree.Identifier): ESTree.Identifier | undefined {
    return resolveBinding(fnID, true);
}

export const cpp = {
    types:
    {
        NUMBER: "js::number",
        VOID: "void",
        // temp marker for function declaration nodes in buildInfo
        FUNCTION: "void*",
        STRING: "js::string",
        __RAW_ARRAY: "js::array",
        ARRAY: (of: ctype) => `${cpp.types.__RAW_ARRAY}<${of}>`,
        IFFY: "js::dynamic",
        AUTO: "auto", // only to be used by functions
        BOOLEAN: "js::boolean",
        isArray: (type: ctype) => type.slice(0, cpp.types.__RAW_ARRAY.length) === cpp.types.__RAW_ARRAY,
        arrayItemType: (node: ESTree.Node, type: ctype) => {
            if(!cpp.types.isArray(type))
            {
                ASTerr_kill(node, `Expected an array-like value, got ${type}`);
            }

            return(type.slice(cpp.types.__RAW_ARRAY.length + 1, type.length - 1));
        }
    },
    cast:
    {
        staticBinfo(to: ctype, value: buildInfo): string {
            if (value.info.type == to) {
                console.log(`[cast ] |OMIT| ${to} : "${value.content}"`);
                return `(${value.content})`;
            }
            else if (cpp.types.isArray(to)) {
                console.log(`[cast ] |ARAY| ${to} : "${value.content}"`);
                return `${to}(${value.content})`
            }
            else {
                console.log(`[cast ] |SUCC| ${to} : "${value.content}"`);
                return `static_cast<${to}>(${value.content})`;
            }
        },
        static(to: ctype, value: string, valueType: ctype): string {
            // const castTo = `static_cast<${to}>`;
            return cpp.cast.staticBinfo(to, { content: value, info: { type: valueType } });
        },
        number(value: string): string {
            return cpp.cast.static(cpp.types.NUMBER, value, cpp.types.AUTO);
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
        all: () => allVars,
        globals: () => allGlobalVars,
        exists(node: ESTree.Identifier): boolean {
            const binding = ident2binding(node);
            return binding != undefined && allVars.has(binding);
        },
        create2(node: ESTree.Identifier, name: string, value: buildInfo, { constant = false, forceNoForward = false, useTypeList = normalTypeLists } = {}): string {

            const newType = value.info.type;

            let myTypeList: Set<ctype>;

            if (useTypeList.has(node)) {
                console.log(`[n var] 2+ PASS : "${name}"`);
                // other passes
                myTypeList = useTypeList.get(node)!;
            }
            else {
                // first pass
                console.log(`[n var] FIRST PASS : "${name}"`);
                myTypeList = new Set<ctype>;
                useTypeList.set(node, myTypeList);
            }

            const cvar: CVariable = {
                possibleTypes: myTypeList, name, constant, // isList: bInfoIsList(value)
            };

            addType(cvar, newType);

            // console.log(myTypeList);
            const possibleType: ctype = typeSet2type(myTypeList);


            if (allVars.has(node)) {
                ASTerr_kill(node, `Identical variable "${name}" already declared`);
            }

            console.log(`[vars ] creating: "${name}" as "${possibleType}" : dummy? ${inDummyMode()}`);
            mapAddAndTrack(allVars, node, cvar, 'vars');

            if (nestLevel == 0 && !forceNoForward) {
                if (!inDummyMode())
                    allGlobalVars.push(cvar);
                return name + (value.content.length == 0 ? "" : ` = ${cpp.cast.staticBinfo(possibleType, value)}`);
            }
            else {
                return (constant ? "const " : "") + possibleType + " " + name + (value.content.length == 0 ? "" : ` = ${cpp.cast.staticBinfo(possibleType, value)}`);
            }
        },
        reassign(node: ESTree.Identifier, existingVar: CVariable, value: buildInfo): string {
            const newType = value.info.type;
            addType(existingVar, newType);

            console.log(`[resgn] "${existingVar.name}" = "${value.content}" as "${newType}"`);
            console.log(`[resgn] \t--> "${existingVar.name}" is now a "${getType(existingVar)}"`);

            const eType: ctype = getType(existingVar);

            if (value.info.type !== eType && eType !== cpp.types.IFFY) {
                ASTerr_kill(node, `Unable to coerce ${existingVar.name}: ${eType} -> ${value.info.type}`);
            }

            // console.log("-----",         cpp.cast.staticBinfo(eType, value))

            return `${existingVar.name} = ${cpp.cast.staticBinfo(eType, value)}`;
        },
        // permanently removes a variables. Do not use for temps etc. Only for "fake" variables like template parameters
        remove(node: ESTree.Identifier, { removeTypeLists = false, allowUndefined = true } = {}): void {
            let removed: boolean = allVars.delete(node);

            if (removeTypeLists) {
                console.log(`[tlist ] REMOVING "${node.name}"`)
                removed &&= normalTypeLists.delete(node);
            }

            if (!removed && !allowUndefined) {
                err(`[INTERNAL] cannot remove variable "${node.name}" since it doesn't exist`);
            }
        },

        /// Returns null if no binding at all (variable isn't declared anywhere scopewise), returns undefined if variable is declared but hasn't been interp yet
        get(node: ESTree.Identifier): CVariable | undefined | null {
            const binding = ident2binding(node);

            if (binding == undefined)
                return null;

            return allVars.get(binding);
        },

        getSafe(node: ESTree.Identifier): CVariable {
            const existingVar = cpp.variables.get(node);
            if (existingVar === undefined) // variable is declared elsewhere, but compiler hasn't looked at it yet
            {
                // throw (not kill) so function-eval flow can retry later once ordering resolves
                ASTerr_throw(node, `Assignment to "${node.name}" before it is declared`);
            }
            else if (existingVar === null) // variable is not declared anywhere
            {
                ASTerr_kill(node, `LHS of assignment "${node.name}" is never declared`);
            }
            else {
                return existingVar;
            }
        }
    },
    functions:
    {
        allNormal: () => allFuncs,
        allTemplates: () => allTemplateFuncs,
        createDec(fn: ESTree.FunctionDeclaration, node: ESTree.Identifier, name: string, params: ESTree.FunctionParameter[]): { strconts: string, repObj: replaceObj } {
            if (allFuncs.has(node) || allTemplateFuncs.has(node)) {
                ASTerr_kill(node, `Identical function "${name}" already declared`);
            }

            if (params.length != 0) {
                console.log(`[funcs] created template function ${name}`);

                fn.params.forEach((param): void => {
                    if (ESTree.isTSParameterProperty(param)) {
                        ASTerr_kill(param, "TS parameter properties are not supported; use plain JS-style parameters");
                    }
                })

                const paramsNoTS = fn.params as ESTree.FunctionParameter[];

                mapAddAndTrack(allTemplateFuncs, node, {
                    name, func: fn, params: paramsNoTS
                }, 'templateFuncs');

                return {
                    strconts: "",
                    repObj: { ready: false }
                };
            }
            else {

                mapAddAndTrack(allFuncs, node, {
                    return: cpp.types.AUTO,
                    name,
                }, 'funcs');

                let ostring = `auto ${name}()\n{\n`;

                const repObj: replaceObj = { ready: false, surroundings: [ostring, "\n}"] };
                unevaledFuncs.push({ func: fn, evaluatedCode: repObj });
                evaluateAllFunctions();

                ostring += "\n}"

                return {
                    strconts: ostring,
                    repObj
                };
            }
        },
        _call(fn: CFunction, givenParams: buildInfo[], argumentTypes: ctype[]): buildInfo {
            if (givenParams.length !== argumentTypes.length) {
                err(`Expected ${argumentTypes.length} arguments but given ${givenParams} when calling function "${fn.name}"`);
            }
            else {
                return stringTobuildInfo(`${fn.name}(${givenParams.map((v: buildInfo, i: number): string => cpp.cast.staticBinfo(argumentTypes[i], v)).join(", ")})`, fn.return);
            }
        },
        generateDef(fn: CFunction, argumentTypes: ctype[]): string {
            return `${fn.return} ${fn.name}(${argumentTypes.join(", ")})`;
        }
    },
    array:
    {
        itemType(arr: CVariable): ctype {
            const t = getType(arr);
            if (cpp.types.isArray(t)) {
                return t.slice(t.indexOf("<") + 1, t.lastIndexOf(">"));
            }
            else if(getType(arr) === cpp.types.IFFY)
            {
                return cpp.types.IFFY;
            }
            else if(getType(arr) == cpp.types.STRING)
            {
                return cpp.types.STRING;
            }
            else
            {
                err(`[INTERNAL] value is not an arrayLike`, String(arr.possibleTypes));
            }
        },
        instance(values: buildInfo[], unparsed: (ESTree.Expression | ESTree.SpreadElement | null)[]): buildInfo {
            const allTypes: ctype[] = values.map((v: buildInfo) => v.info.type);
            const itemType: ctype = typeList2type(allTypes);
            const arrayType: ctype = cpp.types.ARRAY(itemType);

            const initializerItems: string[] = [];

            // See 14.js 
            values.forEach((item: buildInfo, i) => {
                const unparsedItem = unparsed[i];

                if(unparsedItem && ESTree.isIdentifier(unparsedItem))
                {
                    const cvar = cpp.variables.getSafe(unparsedItem);
                    if(itemType == cpp.types.IFFY && cpp.types.isArray(getType(cvar)))
                    {
                        addType(cvar, cpp.types.ARRAY(cpp.types.IFFY));
                        // console.log(cvar.possibleTypes);
                        // process.exit(1);
                    }
                }

                initializerItems.push(cpp.cast.staticBinfo(itemType, item));
            })

            const initializerList: string = `{${initializerItems}}`;

            const init: string = cpp.cast.static(arrayType, initializerList, cpp.types.AUTO);

            return {
                content: init,
                info: {
                    type: arrayType,
                }
            }

        },
        modify(node: ESTree.Identifier, base: CVariable, index: buildInfo, value: buildInfo): buildInfo {
            const valueType: ctype = value.info.type;
            addType(base, cpp.types.ARRAY(valueType));

            // console.log(value)
            // process.exit(2)

            const arrayType = getType(base);

            const assignment: string = `${base.name}[${index.content}] = ${cpp.cast.staticBinfo(cpp.types.arrayItemType(node, arrayType), value)}`;


            return {
                content: assignment,
                info: {
                    type: getType(base),
                    // isList: true,
                }
            }
        }
    }
}
