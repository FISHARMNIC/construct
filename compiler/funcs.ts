/*
!IMPORTANT! Alot of these are for function decs only, not arrows, etc. 
    -> Specify the required types as .FunctionDeclaration insteaf of just .Function when necessary

!HERE! !IMPORTANT! Need to implement some type of "iffy" for returns, that finds all returns and compares their types
    -> doesn't need to be done until the end, just use .replace to cast
    -> maybe create macro like: RETURN_AS(js::number)(123) ===> return(static_cast<js::number>(123));
    -> Also need to return what type the return needs to be

slightly outdated, but mostly correct:

Expects:
    * A list/queue of all function declarations / methods / etc
    * All functions to be at the very end of the file
    *       -> or NOT this can just be run every time a function is encountered, and at EOF

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
import { buildInfo, buildInfoToStr, changeNestLevel, replaceObj, stringTobuildInfo, walkBody, walkBodyDummy } from './walk';
import { ASTerr_kill } from './ASTerr';
import './extensions';
import { CFunction, CTemplateFunction, ctype, stackInfo } from './ctypes';
import { allVars, cpp, enterDummyMode_raw, exitDummyMode_raw } from './cpp';
import { fixxes } from './main';
import { typeList2type } from './iffyTypes';

interface FunctionQueueElement {
    func: ESTree.Function; // @todo make this FunctionDeclaration
    evaluatedCode: replaceObj; //used for .replace
    // id: number;
};

interface evalInfo {
    bInfo: buildInfo[],
    successfull: boolean,
    returnType: ctype,
};

type FunctionQueue = FunctionQueueElement[];

export let unevaledFuncs: FunctionQueue = [];
let alreadyTried: FunctionQueue = [];

export function evaluateAllFunctions(): string[] {

    // @todo dont need the queue id anymore, since using .replace? now in buildInfo
    // let queue: FunctionQueue = unevaledFuncs.map((func: ESTree.Function, id: number): FunctionQueueElement => {
    //     return { func, id, evaluatedCode: [] };
    // })

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

function evaluateSingle(funcInfo: FunctionQueueElement, { changeNest = true, forceDummyOnly = false }: { changeNest?: boolean; forceDummyOnly?: boolean } = {}): evalInfo {

    const beforeDeletefn = (obj: stackInfo, allReturnStatements: buildInfo[]): ctype => {

        const singleReturnType: ctype = typeList2type(allReturnStatements.map((v): ctype => v.info.type));
        console.log(singleReturnType);

        /*
        @todo need to now use .replace or something to set return type and add explicit cast to all returns
        */
        allReturnStatements.forEach((statement: buildInfo): void => {
            if (statement.info.returningData) {
                statement.replace = {
                    with: [stringTobuildInfo(`return(${cpp.cast.static(singleReturnType, statement.info.returningData)})`)],
                    ready: true,
                }
            }
        })

        // console.log("DEBUG KILLING", allReturnStatements);
        //process.exit(0);

        return singleReturnType;
    }


    if (changeNest)
        changeNestLevel(1);

    let succeeded = false;
    let output: buildInfo[] = [];
    let returnType: ctype = cpp.types.VOID;

    if (ESTree.isFunctionDeclaration(funcInfo.func)) {
        let node = funcInfo.func as ESTree.FunctionDeclaration;
        let allReturnStatements: buildInfo[] = [];

        console.log(`[funcs] ATTEMPTING EVAL ON "${node.id?.name}"`);
        let out = walkBodyDummy(node.body.body, (obj: stackInfo, success: boolean, errorInfo): void => {
            if (success && forceDummyOnly) {
                allReturnStatements = obj.returnStatements;
                returnType = beforeDeletefn(obj, allReturnStatements)
            }
        });


        if (out.success) {
            console.log(`[funcs] -> SUCCESS on eval "${node.id?.name}"`);

            // if it gets here, it succeeded
            if (forceDummyOnly) {
                output = out.info;
            }
            else {
                output = walkBody(node.body.body, {
                    beforeDelete: (obj: stackInfo): void => {
                        allReturnStatements = obj.returnStatements;
                        returnType = beforeDeletefn(obj, allReturnStatements);
                    }
                }
                );
            }

            const templateMatch: CTemplateFunction | undefined = cpp.functions.allTemplates.get(funcInfo.func.id!);
            const normalMatch: CFunction | undefined = cpp.functions.all.get(funcInfo.func.id!);

            // if(templateMatch)
            // {
            //     templateMatch.
            // }
            if(normalMatch)
            {
                normalMatch.return = returnType;
            }
            else if(!templateMatch)
            {
                // should never reach here
                ASTerr_kill(funcInfo.func, `[INTERNAL] Critical failiure. Unknown function "${funcInfo.func.id?.name}"`);
            }

            // console.log();
            // process.exit(0);
            
            funcInfo.evaluatedCode.with = output;
            funcInfo.evaluatedCode.ready = true;

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



let namingCounter = 0;
function template_newName(): string // @todo this is lazy. Make one for each template function
{
    return `_version${namingCounter++}__`;
}

function evaluateSingleTemplate_helper(func: ESTree.Function): evalInfo {
    let fqe: FunctionQueueElement = {
        func, evaluatedCode: {
            ready: false
        }
    };

    /*
    Note: it never evaluates in real mode (forceDummyOnly: true) since all local variables will have the same bindings on next template instance
    */
    let res = evaluateSingle(fqe, { changeNest: false, forceDummyOnly: true });
    if (!res.successfull) {
        ASTerr_kill(func, `[CRITICAL ERROR] Unable to evaluate template function`);
    }

    return res;
}

interface etf_robj {
    returnType: ctype,
    callExpr: string,
    fnName: string,
    fnDef: string,
    fnBody: buildInfo[]
}

/*
 Note this function should not fail, since all Identifiers should be defined at call time (just like in JS)
*/
/// @returns function type
export function evaluateTemplateFunction(funcInfo: CTemplateFunction, givenParams: buildInfo[]): buildInfo {
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
    */

    let parameter_genList: string[] = [];

    // notes the info about the parameters 
    // treats them as variables for simplicity
    // note wont trigger redec erro since binding is the param
    // note that this shouldn't be run in dummy mode since at this point everything should be known
    let paramTypes: ctype[] = []

    funcInfo.params.forEach((param: ESTree.FunctionParameter, i: number): void => {
        const value: buildInfo = givenParams[i];
        if (ESTree.isIdentifier(param)) {
            // no need to read the return since its not actually a variable
            cpp.variables.create2(param, param.name, value, { forceNoForward: true });
            const ptype: ctype = allVars.get(param)!.type;
            parameter_genList.push(`${ptype} ${param.name}`);
            paramTypes.push(ptype);
        }
        else {
            ASTerr_kill(param, `@todo unknown parameter type "${param.type}"`)
        }
    });

    // enterDummyMode();
    // changeNestLevel(1);

    const evaluatedInfo: evalInfo = evaluateSingleTemplate_helper(funcInfo.func);
    const evaluatedFunc: buildInfo[] = evaluatedInfo.bInfo;
    const parameter_genStr: string = parameter_genList.join(", ");

    const fnName = funcInfo.name + template_newName(); // @todo maybe dont even need this bc c++ has native overloads?? Or maybe better for ambiguity idk

    const callExpr = `${fnName}(${givenParams.map((v: buildInfo, i: number): string => cpp.cast.static(paramTypes[i], v.content)).join(", ")})`;
    const fnDef = `${evaluatedInfo.returnType} ${fnName}(${parameter_genStr})`;

    fixxes.pre.push(fnDef + ';');
    fixxes.post.push(stringTobuildInfo(fnDef + "{"), ...evaluatedFunc, stringTobuildInfo("}"));

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

    return {
        content: callExpr,
        info: {
            type: evaluatedInfo.returnType
        }
    };

    // changeNestLevel(-1);
    // exitDummyMode();

}