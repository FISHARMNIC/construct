/*

Function evaluation queue

idea:
    keep trying function declarations until they can compile cleanly
    if one fails because context is missing, push it back and retry later

template functions:
    each call instantiates a version with a unique name
    local types for each instance stay isolated via template type-lists

*/

import * as ESTree from '@babel/types';
import { buildInfo, changeNestLevel, replaceObj, stringTobuildInfo, walkBody, walkBodyDummy } from './walk';
import { ASTerr_kill, err } from './ASTerr';
import { CFunction, CTemplateFunction, ctype, getType, stackInfo } from './ctypes';
import { cpp } from './cpp';
import { fixxes } from './main';
import { typeList2type } from './iffyTypes';
import { cleanup } from './cleanup';
import { getTemplateTypeListFromUniqueID, TypeList_t, normalTypeLists } from './iffy';

interface FunctionQueueElement {
    func: ESTree.FunctionDeclaration;
    evaluatedCode: replaceObj;
};

interface evalInfo {
    bInfo: buildInfo[],
    successful: boolean,
    returnType: ctype,
};

type FunctionQueue = FunctionQueueElement[];


export let unevaledFuncs: FunctionQueue = [];
let alreadyTried: FunctionQueue = [];
let namingCounter = 0;

cleanup.funcs = function () {
    unevaledFuncs = [];
    alreadyTried = [];
    namingCounter = 0;
}

function template_getUniqueID(): number {
    return namingCounter++;
}
// keep names simple and deterministic for now
function template_newName(uniqueID: number): string {
    return `_version${uniqueID}__`;
}

export function evaluateAllFunctions(): void {

    alreadyTried = [];

    while (unevaledFuncs.length !== 0) {
        const fn = unevaledFuncs.pop()!;

        // if we cycle back to something we already retried this round, stop and keep leftovers queued
        if (alreadyTried.includes(fn)) {
            unevaledFuncs.unshift(fn);
            break;
        }

        const info: evalInfo = evaluateSingle(fn);

        if (!info.successful) {
            unevaledFuncs.unshift(fn);
            alreadyTried.push(fn);
        }
    }
}

/**
 * Attempts to evaluate a single item from the function queue.  
 * @param changeNest Used to prevent marking as global code. Only set to true if parent function handles scope entrance
 * @param forceDummyOnly Used to prevent walking for real. Only use if don't want to actually create anything like scoped variables etc.
*/
function evaluateSingle(funcInfo: FunctionQueueElement, { changeNest = true, forceDummyOnly = false, templateFn = false, useTypeList = normalTypeLists } = {}): evalInfo {

    // this function is called by walkBodyDummy before all of the dummy vars and tempStack are deleted and the state is rolled back
    // here, it extracts all returns which were stored in the tempStack, and casts them to the general type that supports all of them
    const beforeDeletefn = (obj: stackInfo, allReturnStatements: buildInfo[]): ctype => {

        const singleReturnType: ctype = typeList2type(allReturnStatements.map((v): ctype => v.info.type));

        allReturnStatements.forEach((statement: buildInfo): void => {
            if (statement.info.returningData) {
                statement.replace = {
                    with: [stringTobuildInfo(`return(${cpp.cast.static(singleReturnType, statement.info.returningData, singleReturnType)})`)],
                    ready: true,
                }
            }
        })

        if (!templateFn) {
            const name = funcInfo.func.id?.name;
            if (!name) {
                err(`[INTERNAL] :: function has no name`);
            }

            fixxes.pre.push(cpp.functions.generateDef({ name, return: singleReturnType }, []) + ';');
        }

        return singleReturnType;
    }

    // Does not nest again if the parent is handling the scope
    if (changeNest)
        changeNestLevel(1);

    let succeeded = false;
    let output: buildInfo[] = [];
    let returnType: ctype = cpp.types.VOID;
    const node = funcInfo.func;
    let allReturnStatements: buildInfo[] = [];

    console.log(`[funcs] ATTEMPTING EVAL ON "${node.id?.name}"`);

    const out = walkBodyDummy(node.body.body, (obj: stackInfo, success: boolean): void => {
        if (success && forceDummyOnly) {
            // template path only: evaluate returns from dummy walk directly
            allReturnStatements = obj.returnStatements;
            returnType = beforeDeletefn(obj, allReturnStatements)
        }
    }, useTypeList);

    if (out.success) {
        console.log(`[funcs] -> SUCCESS on eval "${node.id?.name}"`);

        if (forceDummyOnly) {
            output = out.info;
        }
        else {
            // normal path: walk again in real mode so scoped vars/functions are persisted
            output = walkBody(node.body.body, {
                useTypeList,
                beforeDelete: (obj: stackInfo): void => {
                    allReturnStatements = obj.returnStatements;
                    returnType = beforeDeletefn(obj, allReturnStatements);
                }
            });
        }

        const templateMatch: CTemplateFunction | undefined = cpp.functions.allTemplates().get(node.id!);
        const normalMatch: CFunction | undefined = cpp.functions.allNormal().get(node.id!);

        if (normalMatch) {
            normalMatch.return = returnType;
        }
        else if (!templateMatch || !node.id) {
            ASTerr_kill(node, `[INTERNAL] Critical failure. Unknown function "${node.id?.name}"`);
        }

        funcInfo.evaluatedCode.with = output;
        funcInfo.evaluatedCode.ready = true;

        if (!node.id) {
            ASTerr_kill(node, `[INTERNAL] Function has no id: "${node}"`)
        }

        if (!templateFn) {
            funcInfo.evaluatedCode.surroundings![0] = cpp.functions.generateDef({ return: returnType, name: node.id.name }, []) + '{';
        }

        succeeded = true;
    }
    else {
        console.log(`[funcs] -> FAILURE on eval "${node.id?.name}"`);
        succeeded = false;
    }

    if (changeNest)
        changeNestLevel(-1);

    return {
        bInfo: output,
        successful: succeeded,
        returnType
    };
}

function evaluateSingleTemplate_helper(func: ESTree.FunctionDeclaration, useTypeList: TypeList_t): evalInfo {
    const fqe: FunctionQueueElement = {
        func, evaluatedCode: {
            ready: false
        }
    };

    // never evaluate template instance in full mode; param bindings are reused and would clash
    const res = evaluateSingle(fqe, { changeNest: false, forceDummyOnly: true, templateFn: true, useTypeList });
    if (!res.successful) {
        ASTerr_kill(func, `[CRITICAL ERROR] Unable to evaluate template function`);
    }

    return res;
}

/**
 * Instances and evaluates a template function (function with parameters). Should never fail since all declarations should be known at call time
 * Same idea as c++ templates, but handled manually so that local types can be evaluated 
 * @param funcInfo Function to evaluate
 * @param givenParams Arguments given. Must already be walked with requireSingle
 * @returns 
 */
export function evaluateAndCallTemplateFunction(funcInfo: CTemplateFunction, givenParams: buildInfo[]): buildInfo {
    if(givenParams.length !== funcInfo.params.length)
    {
        ASTerr_kill(funcInfo.func, `Function "${funcInfo.name}" given ${givenParams.length} arguments but expected ${funcInfo.params.length}`);
    }

    const parameter_genList: string[] = [];

    const argumentTypes: ctype[] = [];

    // See comments in iffy.ts on why the typelists are segregated for template functions
    const myID: number = template_getUniqueID();
    const scopedTypeList = getTemplateTypeListFromUniqueID(myID);

    funcInfo.params.forEach((param: ESTree.FunctionParameter, i: number): void => {
        const value: buildInfo = givenParams[i];
        if (ESTree.isIdentifier(param)) {
            cpp.variables.create2(param, param.name, value, { forceNoForward: true, useTypeList: scopedTypeList });
            const ptype: ctype = getType(cpp.variables.all().get(param)!);

            parameter_genList.push(`${ptype} ${param.name}`);
            argumentTypes.push(ptype);
        }
        else {
            ASTerr_kill(param, `Unsupported parameter type "${param.type}"`)
        }
    });

    const evaluatedInfo: evalInfo = evaluateSingleTemplate_helper(funcInfo.func, scopedTypeList);
    const evaluatedFunc: buildInfo[] = evaluatedInfo.bInfo;

    const fnName = funcInfo.name + template_newName(myID);

    const callExpr = cpp.functions._call({ name: fnName, return: evaluatedInfo.returnType }, givenParams, argumentTypes);

    const fnDef = cpp.functions.generateDef({ name: fnName, return: evaluatedInfo.returnType }, parameter_genList);

    fixxes.pre.push(fnDef + ';');

    fixxes.post.push(stringTobuildInfo(fnDef + "{"), ...evaluatedFunc, stringTobuildInfo("}"));

    funcInfo.params.forEach((param: ESTree.FunctionParameter, i: number): void => {
        if (ESTree.isIdentifier(param)) {
            cpp.variables.remove(param);
        }
        else {
            ASTerr_kill(param, `Unsupported parameter type "${param.type}"`)
        }
    });

    return callExpr;
}
