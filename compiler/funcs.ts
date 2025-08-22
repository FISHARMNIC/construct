/*
!IMPORTANT! Alot of these are for function decs only, not arrows, etc. 
    -> Specify the required types as .FunctionDeclaration insteaf of just .Function when necessary

slightly outdated, but mostly correct:

Expects:
    * A list/queue of all function declarations / methods / etc

Returns
    * A list of strings with the compiled code
    * The indices of the returned list are the same as those of the given argument
Does:

until no more functions in queue
    dequeue a function
    trycompile(that function)

function trycompile(function)
    try(Evaluate function in dummy mode)
    catch(
    if failed on calling unknown function?
        --> recurse(failed function)
        --> keep evaling
    else if failed on unknown variable or something else
        --> push this to the back of the queue
        --> quit 
    )
     

*/

import * as ESTree from '@babel/types';
import { buildInfo, changeNestLevel, replaceObj, stringTobuildInfo, walkBody, walkBodyDummy } from './walk';
import { ASTerr_kill, err } from './ASTerr';
import './extensions';
import { CFunction, CTemplateFunction, ctype, getType, stackInfo } from './ctypes';
import { cpp } from './cpp';
import { fixxes } from './main';
import { typeList2type } from './iffyTypes';
import { cleanup } from './cleanup';
import { getTemplateTypeListFromUniqueID, TypeList_t, normalTypeLists } from './iffy';

interface FunctionQueueElement {
    func: ESTree.Function;     // @todo make this FunctionDeclaration
    evaluatedCode: replaceObj; // used for .replace
};

interface evalInfo {
    bInfo: buildInfo[],
    successfull: boolean,
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
/**
 * @returns A unique identifier
 */
function template_newName(uniqueID: number): string // @todo this is lazy. Make one for each template function
{
    return `_version${uniqueID}__`;
}

/**
 * Attempts to evaluate all functions in the queue. If some fail, keep them in the queue for next time
*/
export function evaluateAllFunctions(): string[] {

    alreadyTried = [];

    while (unevaledFuncs.length != 0) {
        let fn = unevaledFuncs.pop()!;

        if (alreadyTried.includes(fn)) {
            unevaledFuncs.pushFront(fn);
            break;
        }

        let info: evalInfo = evaluateSingle(fn);

        // if failed, push it back in
        if (!info.successfull) {
            unevaledFuncs.pushFront(fn);
            alreadyTried.push(fn);
        }

        // @todo check loops, for now if its never fixed then it will just go forever
    }

    return [""];
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
            const name = (funcInfo.func as ESTree.FunctionDeclaration).id?.name;
            if (!name) {
                err(`[INTERNAL] :: function has no name`);
            }

            // generate the forward definition for the function
            // @todo this is messy because callAndEvaluateTemplateFunction does this internally
            fixxes.pre.push(cpp.functions.generateDef({ name, return: singleReturnType }, []) + ';');
        }
        else {
            // obj.vars.forEach((variable: ESTree.Identifier): void => {
            //     cpp.variables.remove(variable);
            // })
        }

        return singleReturnType;
    }

    // Doesnt nest again if the parent is handeling the scope
    if (changeNest)
        changeNestLevel(1);

    let succeeded = false;
    let output: buildInfo[] = [];
    let returnType: ctype = cpp.types.VOID;

    if (ESTree.isFunctionDeclaration(funcInfo.func)) {
        let node = funcInfo.func as ESTree.FunctionDeclaration;
        let allReturnStatements: buildInfo[] = [];

        console.log(`[funcs] ATTEMPTING EVAL ON "${node.id?.name}"`);

        // try to evaluate the function
        let out = walkBodyDummy(node.body.body, (obj: stackInfo, success: boolean, errorInfo): void => {
            if (success && forceDummyOnly) {
                // If it succeddes, and the function is never to be walked normally, evaluate return types now (beforeDeleteFn)
                allReturnStatements = obj.returnStatements;
                returnType = beforeDeletefn(obj, allReturnStatements)
            }
        }, useTypeList);


        if (out.success) {
            console.log(`[funcs] -> SUCCESS on eval "${node.id?.name}"`);

            // if it gets here, it succeeded
            if (forceDummyOnly) {
                output = out.info;
            }
            else {
                // if not only walking in dummy mode, walk for reals this time 
                // @todo is this really needed? Can just leave in dummy mode? because local scope cant cause global effects? or what?
                output = walkBody(node.body.body, {
                    useTypeList,
                    beforeDelete: (obj: stackInfo): void => {
                        allReturnStatements = obj.returnStatements;
                        returnType = beforeDeletefn(obj, allReturnStatements);
                    }
                },
                );
            }

            const templateMatch: CTemplateFunction | undefined = cpp.functions.allTemplates().get(funcInfo.func.id!);
            const normalMatch: CFunction | undefined = cpp.functions.allNormal().get(funcInfo.func.id!);

            // Mark the functions return type if its a normal (non-template) function
            // Template functions each have their own return type
            if (normalMatch) { // could use !templateFn here too
                normalMatch.return = returnType;
            }
            else if (!templateMatch || !(funcInfo.func.id)) {
                // should never reach here
                ASTerr_kill(funcInfo.func, `[INTERNAL] Critical failiure. Unknown function "${funcInfo.func.id?.name}"`);
            }

            funcInfo.evaluatedCode.with = output;
            funcInfo.evaluatedCode.ready = true;

            // generate the call expression
            // @todo this is messy because callAndEvaluateTemplateFunction does this internally
            if (!templateFn)
                funcInfo.evaluatedCode.surroundings![0] = cpp.functions.generateDef({ return: returnType, name: funcInfo.func.id?.name! }, []) + '{';

            succeeded = true;
        }
        else {
            console.log(`[funcs] -> FAILIURE on eval "${node.id?.name}"`);
            succeeded = false;
        }
    }
    else {
        ASTerr_kill(funcInfo.func, `Unable to process function type "${funcInfo.func.type}"`);
    }

    if (changeNest)
        changeNestLevel(-1);

    return {
        bInfo: output,
        successfull: succeeded,
        returnType
    };
}

// Helper for `evaluateTemplateFunction`. This just wraps evaluateSingle.
function evaluateSingleTemplate_helper(func: ESTree.Function, useTypeList: TypeList_t): evalInfo {
    let fqe: FunctionQueueElement = {
        func, evaluatedCode: {
            ready: false
        }
    };

    /*
    Note: it never evaluates in real mode (forceDummyOnly: true) since all local variables will have the same bindings on next template instance
    */
    let res = evaluateSingle(fqe, { changeNest: false, forceDummyOnly: true, templateFn: true, useTypeList });
    if (!res.successfull) {
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
    /*
    @todo:
        * -- DONE -- create temporary variables that are the names of the params
            -> Binding is the param in the function itself
            -> Just pass the funcInfo.params[N] so bindings work correctly
        * -- DONE -- Generate the header and footer of the overload
            -> give name like <function>_version1__
        * -- DONE -- Compile code using those temporaries
    @todo LATER:
            * Store the functions that have already been compiled with types A, B, etc...
            * See if new call uses params already compiled for
                -> Use those instead of generating new ones with the same types
            * DO NOT DO: generate better names like bob_returns_number_takes_number_string
                -> using template ID system to track their identifier
                - actually maybe can do but dont mess with getID
    */

    if(givenParams.length != funcInfo.params.length)
    {
        ASTerr_kill(funcInfo.func, `Function "${funcInfo.name}" given ${givenParams.length} arguments but expected ${funcInfo.params.length}`);
    }

    let parameter_genList: string[] = [];

    let argumentTypes: ctype[] = [];

    // See comments in iffy.ts on why the typelists are segregated for template functions
    const myID: number = template_getUniqueID();
    let scopedTypeList = getTemplateTypeListFromUniqueID(myID);

    // notes the info about the parameters 
    // treats them as variables for simplicity
    // note that this shouldn't be run in dummy mode since at this point everything should be known
    funcInfo.params.forEach((param: ESTree.FunctionParameter, i: number): void => {
        const value: buildInfo = givenParams[i];
        if (ESTree.isIdentifier(param)) {
            // no need to read the return since its not actually a variable
            // console.log(givenParams)
            cpp.variables.create2(param, param.name, value, { forceNoForward: true, useTypeList: scopedTypeList });
            // type may be iffy if param is reassigned
            const ptype: ctype = getType(cpp.variables.all().get(param)!);

            // generates the parameter as in: <type> <name>
            parameter_genList.push(`${ptype} ${param.name}`);
            argumentTypes.push(ptype);
        }
        else {
            ASTerr_kill(param, `@todo unknown parameter type "${param.type}"`)
        }
    });

    // enterDummyMode();
    // changeNestLevel(1);

    // evaluate the template functions body
    const evaluatedInfo: evalInfo = evaluateSingleTemplate_helper(funcInfo.func, scopedTypeList);
    const evaluatedFunc: buildInfo[] = evaluatedInfo.bInfo;

    const fnName = funcInfo.name + template_newName(myID); // @todo maybe dont even need this bc c++ has native overloads?? Or maybe better for ambiguity idk

    // generate the call expression as in: <function name>(<argument list>)
    // @todo use cpp.functions._call
    const callExpr = cpp.functions._call({ name: fnName, return: evaluatedInfo.returnType }, givenParams, argumentTypes);

    // generate the definition as in: <function name>(<parameter list>)
    // used for forward def and actual dec
    const fnDef = cpp.functions.generateDef({ name: fnName, return: evaluatedInfo.returnType }, parameter_genList);

    // forward def
    fixxes.pre.push(fnDef + ';');

    // actual function declaration
    fixxes.post.push(stringTobuildInfo(fnDef + "{"), ...evaluatedFunc, stringTobuildInfo("}"));

    // get rid of all of the parameters, since they were stored as variables
    funcInfo.params.forEach((param: ESTree.FunctionParameter, i: number): void => {
        const value: buildInfo = givenParams[i];
        if (ESTree.isIdentifier(param)) {
            cpp.variables.remove(param);
            parameter_genList.push(`${value.info.type} ${param.name}`)
        }
        else {
            ASTerr_kill(param, `@todo not sure how to get rid of param of type "${param.type}"`)
        }
    });

    return callExpr;
}