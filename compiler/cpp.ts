/*

@todo (was) MAJOR ISSUE 
========================================

THIS IS CURRENTLY IMPLEMENTED (needs to be tested)

@todo ? THIS NEEDS TO BE TESTED -- maybe done ?

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
import { buildInfo, buildInfoToStr, nestLevel, replaceObj, stringTobuildInfo } from './walk';
import { ast, eslintScope } from './main';
import { ASTerr_kill, ASTerr_throw, err } from './ASTerr';
import { evaluateAllFunctions, unevaledFuncs } from './funcs';
import './extensions';
import { addType, CFunction, CTemplateFunction, ctype, CVariable, getType, stackInfo } from './ctypes';
import { normalTypeLists } from './iffy';
import { typeList2type, typeSet2type } from './iffyTypes';
import { cleanup } from './cleanup';

// @todo make this nicer. shouldnt be allocated here then realloced in cleanup too
let allVars: Map<ESTree.Identifier, CVariable> = new Map<ESTree.Identifier, CVariable>();
let allGlobalVars: CVariable[] = [];
let allFuncs: Map<ESTree.Identifier, CFunction> = new Map<ESTree.Identifier, CFunction>();
let allTemplateFuncs: Map<ESTree.Identifier, CTemplateFunction> = new Map<ESTree.Identifier, CTemplateFunction>();
export let tempStack: stackInfo[] = [];
let dummyLevel: number = 0;
let unique_label = 0;

function new_unique() {
    return ++unique_label;
}

cleanup.cpp = function () {
    allVars = new Map<ESTree.Identifier, CVariable>();
    allGlobalVars = [];
    allFuncs = new Map<ESTree.Identifier, CFunction>();
    allTemplateFuncs = new Map<ESTree.Identifier, CTemplateFunction>();
    tempStack = [];
    dummyLevel = 0;
    unique_label = 0;
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


// export function setDummyMode(mode: boolean): void {
//     dummyMode = mode;
// }

// @todo this is an absolutley disgusting TEMPORARY function until I'm not lazy and fix the walker to store path info
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

// @todo !IMPORTANT! this may not be working correctly. has to add fnID.name === def.node.id.name
// It was returning the wrong binding in test 12 bob became jon???
// @todo modified version of ident2binding. Gross. remove later
export function fnIdent2binding(fnID: ESTree.Identifier): ESTree.Identifier | undefined {

    let foundMatch: undefined | ESTree.Identifier = undefined;

    for (const scope of eslintScope.scopes) {
        for (const variable of scope.variables) {
            for (const def of variable.defs) {
                if (def.type === "FunctionName" && def.node.type === "FunctionDeclaration") {
                                    console.log("::::::::", def.name)
                    for (const ref of variable.scope.references) {
                        if (ref.identifier === fnID && fnID.name === def.node.id.name)
                        {
                            if(foundMatch)
                            {
                                // if thise ever happens its becuase this function is garbage
                                ASTerr_kill(fnID, `[INTERNAL] Function "${fnID.name}" has at least two possible matches.\nMatch names are: "${foundMatch.name}" and "${def.node.id.name}"`);
                            }
                            foundMatch = def.node.id as ESTree.Identifier;
                        }
                    }
                }
            }
        }
    }

    return foundMatch;
}

// @todo also disgusting
export function isGlobalVar(node: ESTree.Identifier): boolean {
    for (const s of eslintScope.scopes) {
        const v = s.set.get(node.name);
        if (v && v.defs.length > 0 && v.identifiers.includes(node)) {
            return s.type === "global";
        }
    }
    return false;
}

// @todo also horrible. Really need to put path in the walker
export function getWrapperFunc(retStatement: ESTree.Node): ESTree.Function | ESTree.Program | null {
    const root: ESTree.Node = ast.program;
    const parents = new Map<ESTree.Node, ESTree.Node | null>();

    (function build(node: ESTree.Node, parent: ESTree.Node | null = null): void {
        if (node == null || typeof node !== 'object') return;

        parents.set(node, parent);

        for (const k in node) {
            const child = (node as any)[k];
            if (Array.isArray(child)) {
                for (const c of child) {
                    if (c && typeof c === 'object' && 'type' in c) {
                        build(c, node);
                    }
                }
            } else if (child && typeof child === 'object' && 'type' in child) {
                build(child, node);
            }
        }
    })(root);

    let curr: ESTree.Node | null | undefined = parents.get(retStatement);
    while (curr) {
        if (ESTree.isFunctionDeclaration(curr) || ESTree.isFunctionExpression(curr) || ESTree.isArrowFunctionExpression(curr) || ESTree.isProgram(curr)) {
            return curr;
        }
        curr = parents.get(curr);
    }

    return null;
}

export let cpp = {
    types:
    {
        NUMBER: "js::number",
        VOID: "void",
        FUNCTION: "void*", // @todo use cpp function types
        STRING: "js::string",
        // @todo just mark types as literals or classes
        // if classes, dont call static_cast
        __RAW_ARRAY: "js::array",
        ARRAY: (of: ctype) => `${cpp.types.__RAW_ARRAY}<${of}>`,
        IFFY: "js::dynamic",
        AUTO: "auto", // only to be used by functions
        BOOLEAN: "boolean",
        // @todo null literals
        // LATER: function () {
        //     return `__TYPE_${new_unique()}__` // @todo use macros to replace later
        // },
        isArray: (type: ctype) => type.slice(0, cpp.types.__RAW_ARRAY.length) === cpp.types.__RAW_ARRAY
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
            let castTo = `static_cast<${to}>`;
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
        /*
        create(node: ESTree.Identifier, type: ctype, name: string, value: string, constant: boolean = false): string {
            if (allVars.has(node)) {
                ASTerr_kill(node, `Identical variable "${name}" already declared`);
            }

            let cvar: CVariable = {
                type, name, constant
            };

            allVars.add(node, 'vars', cvar);

            // let possibleBinding =  eslintScope.acquire(node.);

            //if(isGlobalVar(node))
            if (nestLevel == 0) {
                if (!inDummyMode())
                    allGlobalVars.push(cvar);
                return name + (value.length == 0 ? "" : ` = ${cpp.cast.static(type, value)}`);
            }
            else {
                return (constant ? "const " : "") + type + " " + name + (value.length == 0 ? "" : ` = ${cpp.cast.static(type, value)}`);
            }
        },
        */
        create2(node: ESTree.Identifier, name: string, value: buildInfo, { constant = false, forceNoForward = false, useTypeList = normalTypeLists } = {}): string {

            let newType = value.info.type;

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

            let cvar: CVariable = {
                possibleTypes: myTypeList, name, constant, // isList: bInfoIsList(value)
            };

            addType(cvar, newType);

            // console.log(myTypeList);
            let possibleType: ctype = typeSet2type(myTypeList);


            if (allVars.has(node)) {
                ASTerr_kill(node, `Identical variable "${name}" already declared`);
            }

            console.log(`[vars ] creating: "${name}" as "${possibleType}" : dummy? ${inDummyMode()}`);
            allVars.add(node, 'vars', cvar);

            // process.exit(0);



            // let possibleBinding =  eslintScope.acquire(node.);
            if (nestLevel == 0 && !forceNoForward) {
                // likeDummy act
                if (!inDummyMode())
                    allGlobalVars.push(cvar);
                return name + (value.content.length == 0 ? "" : ` = ${cpp.cast.staticBinfo(possibleType, value)}`);
            }
            else {
                return (constant ? "const " : "") + possibleType + " " + name + (value.content.length == 0 ? "" : ` = ${cpp.cast.staticBinfo(possibleType, value)}`);
            }
        },
        reassign(node: ESTree.Identifier, existingVar: CVariable, value: buildInfo): string {
            let newType = value.info.type;
            addType(existingVar, newType);

            console.log(`[resgn] "${existingVar.name}" = "${value.content}" as "${newType}"`);
            console.log(`[resgn] \t--> "${existingVar.name}" is now a "${getType(existingVar)}"`);

            const eType: ctype = getType(existingVar);

            if (value.info.type !== eType && eType !== cpp.types.IFFY) {
                ASTerr_kill(node, `@todo unable to coerce ${existingVar.name} : ${eType} -> ${value.info.type}`);
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
            let existingVar = cpp.variables.get(node);
            if (existingVar === undefined) // variable is declared elsewhere, but compiler hasn't looked at it yet
            {
                /* 
                @todo this is where a throw (ASTerr normal) should be used 
                
                In the future, on function decs, they should only walk the body/blockStatement as a dummy in an attempt to compile
                If fail (like this for example, where it uses a var declared later), then catch and hold off until the function is called,
                then try to revaluate the function (again in dummy mode)
                If success, reval not in dummy mode for reals this time
 
                */
                ASTerr_throw(node, `@todo assignment to "${node.name}" before it is declared`);
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
        createDec(fn: ESTree.FunctionDeclaration, node: ESTree.Identifier, name: string, params: ESTree.FunctionParameter[], block: ESTree.BlockStatement): { strconts: string, repObj: replaceObj } {
            let body = block.body;

            if (allFuncs.has(node)) {
                ASTerr_kill(node, `Identical function "${name}" already declared`);
            }

            if (params.length != 0) {
                // @todo use allVars to create to store them
                console.log(`[funcs] created template function ${name}`);

                fn.params.forEach((param): void => {
                    if (ESTree.isTSParameterProperty(param)) {
                        // In the future allow for TS params to optimize functions
                        ASTerr_kill(param, "@todo got a TS paramter but only support JS style parameters")
                    }
                })

                const paramsNoTS = fn.params as ESTree.FunctionParameter[];

                allTemplateFuncs.add(node, 'templateFuncs', {
                    name, func: fn, params: paramsNoTS
                })

                return {
                    strconts: "",
                    repObj: { ready: false }
                };
            }
            else {

                allFuncs.add(node, 'funcs', {
                    return: cpp.types.AUTO,
                    // parameters: params,
                    name,
                });


                let ostring = `auto ${name}()\n{\n`; // @todo not "auto" once returns are implemented

                let repObj: replaceObj = { ready: false, surroundings: [ostring, "\n}"] };
                unevaledFuncs.push({ func: fn, evaluatedCode: repObj });
                evaluateAllFunctions();

                // ostring += output.join("\n");

                ostring += "\n}"

                return {
                    strconts: ostring,
                    repObj
                };

                // let ostring = `auto ${name}()\n{\n`;

                // let output: string[] = walkBody(body);

                // ostring += output.join("\n");

                // ostring += "\n}"

                // return ostring;
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
            let t = getType(arr);
            if (cpp.types.isArray(t)) {
                return t.slice(t.indexOf("<") + 1, t.lastIndexOf(">"));
            }
            else
            {
                err(`[INTERNAL] value is not an array`, arr.possibleTypes);
            }
        },
        instance(values: buildInfo[]): buildInfo {
            const allTypes: ctype[] = values.map((v: buildInfo) => v.info.type);
            const itemType: ctype = typeList2type(allTypes);
            const arrayType: ctype = cpp.types.ARRAY(itemType);

            const initializerList: string = `{${values.map((value: buildInfo): string => cpp.cast.staticBinfo(itemType, value))}}`;

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

            let assignment: string = `${base.name}[${index.content}] = ${value.content}`;


            return {
                content: assignment,
                info: {
                    type: typeSet2type(base.possibleTypes),
                    // isList: true,
                }
            }
        }
    }
}