/*

How this works:

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
import { buildInfo, walk, walkBody, walkBodyDummy } from './walk';
import ASTerr from './ASTerr';

interface FunctionQueueElement {
    func: ESTree.Function;
    evaluatedCode: buildInfo[]; //used for .replace
    // id: number;
};

type FunctionQueue = FunctionQueueElement[];

declare global {
    interface Array<T> {
        pushFront(value: T): void;
    }
}

Array.prototype.pushFront = function <T>(value: T) {
    this.splice(0, 0, value);
}

interface evalInfo {
    bInfo: string[],
    successfull: boolean
};

export let unevaledFuncs: FunctionQueue = [];

export function evaluateAllFunctions(): string[] {

    // @todo dont need the queue id anymore, since using .replace? now in buildInfo
    // let queue: FunctionQueue = unevaledFuncs.map((func: ESTree.Function, id: number): FunctionQueueElement => {
    //     return { func, id, evaluatedCode: [] };
    // })

    while (unevaledFuncs.length != 0) {
        let fn = unevaledFuncs.pop()!;
        let info: evalInfo = evaluateSingle(fn);

        // if failed, push it back in
        if (!info.successfull) {
            unevaledFuncs.pushFront(fn);
        }

        // @todo check loops, for now if its never fixed then it will just go forever
    }

    return [""];
}


function evaluateSingle(funcInfo: FunctionQueueElement): evalInfo {
    let succeeded = false;
    let output: string[] = [];
    try {
        // walk in dummy mode
        if (ESTree.isFunctionDeclaration(funcInfo.func)) {
            let node = funcInfo.func as ESTree.FunctionDeclaration;

            console.log(`[ATTEMPTING EVAL] on "${node.id?.name}"`);
            output = walkBodyDummy(node.body.body);
            console.log(`\t-> success`);

            // if it gets here, it succeeded
            output = walkBody(node.body.body);
            succeeded = true;
        }
        else {
            ASTerr(funcInfo.func, `Unable to process function type "${funcInfo.func.type}"`);
        }
    }
    catch (err) {
        console.log(`\t-> failiure`);
        succeeded = false;
    }

    return {
        bInfo: output,
        successfull: succeeded
    };
}