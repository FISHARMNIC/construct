/*
!HERE! !IMPORTANT! Alot of these are for function decs only, not arrows, etc. 
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
import { buildInfo, changeNestLevel, replaceObj, walkBody, walkBodyDummy } from './walk';
import { ASTerr_kill } from './ASTerr';
import './extensions';
import { CTemplateFunction, ctype } from './ctypes';
import { cpp, enterDummyMode, exitDummyMode } from './cpp';

interface FunctionQueueElement {
    func: ESTree.Function; // @todo make this FunctionDeclaration
    evaluatedCode: replaceObj; //used for .replace
    // id: number;
};

interface evalInfo {
    bInfo: buildInfo[],
    successfull: boolean
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

function evaluateSingle(funcInfo: FunctionQueueElement, changeNest: boolean = true): evalInfo {
    if (changeNest)
        changeNestLevel(1);

    let succeeded = false;
    let output: buildInfo[] = [];

    if (ESTree.isFunctionDeclaration(funcInfo.func)) {
        let node = funcInfo.func as ESTree.FunctionDeclaration;

        console.log(`[funcs] ATTEMPTING EVAL ON "${node.id?.name}"`);
        let out = walkBodyDummy(node.body.body);
        if (out.success) {
            console.log(`[funcs] -> SUCCESS on eval "${node.id?.name}"`);

            // if it gets here, it succeeded
            output = walkBody(node.body.body);
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
        successfull: succeeded
    };
}

function evaluateSingleTemplate_helper(func: ESTree.Function): buildInfo[]
{
    let fqe: FunctionQueueElement = {
        func, evaluatedCode: {
            ready: false
        }
    };

    let res = evaluateSingle(fqe, false);
    if(!res.successfull)
    {
        ASTerr_kill(func, `[CRITICAL ERROR] Unable to evaluate template function`);
    }

    return res.bInfo;
}

/*
 Note this function should not fail, since all Identifiers should be defined at call time (just like in JS)
*/
/// @returns function type
export function evaluateTemplateFunction(funcInfo: CTemplateFunction, givenParams: buildInfo[]): ctype {
    /*
    @todo:
        * create temporary variables that are the names of the params
            -> Binding is the param in the function itself
            -> Just pass the funcInfo.params[N] so bindings work correctly
        * Generate the header and footer of the overload
            -> give name like <function>_version1__
        * Compile code using those temporaries
    @todo LATER:
            * Store the functions that have already been compiled with types A, B, etc...
            * See if new call uses params already compiled for
                -> Use those instead of generating new ones with the same types
    */
    enterDummyMode();
    changeNestLevel(1);

    // notes the info about the parameters 
    // treats them as variables for simplicity
    // note wont trigger redec erro since binding is the param
    funcInfo.params.forEach((param: ESTree.FunctionParameter, i: number): void => {
        const value: buildInfo = givenParams[i];
        if (ESTree.isIdentifier(param)) {
            // no need to read the return since its not actually a variable
            cpp.variables.create2(param, param.name, value);
        }
        else {
            ASTerr_kill(param, `@todo unknown expected parameter type "${param.type}"`)
        }
    });

    let evaluatedFunc = evaluateSingleTemplate_helper(funcInfo.func);

    console.log(evaluatedFunc);
    console.log("DEBUG KILLING");
    process.exit(0);

    changeNestLevel(-1);
    exitDummyMode();

}