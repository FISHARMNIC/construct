/*

How this works:

Expects:
    * A list/queue of all function declarations / methods / etc
    * All functions to be at the very end of the file

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
import { walk } from './walk';

interface FunctionQueueElement
{
    func: ESTree.Function;
    id: number;
};

type FunctionQueue = FunctionQueueElement[]

export function evaluateAllFunctions(funcs: ESTree.Function[]): string[]
{
    let queue: FunctionQueue = funcs.map((func: ESTree.Function, id: number): FunctionQueueElement =>
    {
        return {func, id};
    })

    while(queue.length != 0)
    {

    }

    return [""];
}

function evaluateSingle(func: FunctionQueueElement)
{
    try {
        // walk in dummy mode
        walk(func.func, true);
    }
    catch(err)
    {

    }
}