/*

Given an identifier (which must be a new variable!), check if it is ever reassigned a new type
    -> returns if the identifier is ever re-typed

In the future, there will be more types of iffys/lets for speed optimization
    let_simple = string or number
    let_obj = array or object
    let_all = let_simple or let_obj
        -> should this be a variant with let_simple and let_obj? or a 4-way variant of the types collapsed

*/


import * as ESTree from '@babel/types';
import traverse from '@babel/traverse';
import { buildInfo, walk_requireSingle, walkBodyDummy } from './walk';
import { ast } from './main';
import { ASTerr_kill, ASTwarn, ThrowInfo, ThrowInfoTypes } from './ASTerr';
import { ctype, stackInfo } from './ctypes';
import { allVars } from './cpp';

interface dummyWalkPauseOnSet_t {
    find: ESTree.Identifier | null,
    location?: ESTree.SourceLocation | null | undefined
}

let functionStack: ESTree.FunctionDeclaration[] = [];

export let dummyWalkPauseOnSet: dummyWalkPauseOnSet_t[] = [];

function iffyDbgPrint(...args: any[])
{
    if(dummyWalkPauseOnSet.length <= 0)
        console.log(...args);
    else
        console.log("\t".repeat(dummyWalkPauseOnSet.length), ...args);
}

// @todo check that the ident is the binding itself. This is only meant for new variables
export default function (ident: ESTree.Identifier, currentType: ctype): boolean {
    iffyDbgPrint(`[iffy ] START - checking for "${ident.name}" declared on line ${ident.loc?.start.line}`);
    // let returnInfo: ctype[] = [];

    const myName = ident.name;

    let isIffy = false;

    let myPauser: dummyWalkPauseOnSet_t = {
        find: ident
    }

    dummyWalkPauseOnSet.push(myPauser)

    traverse(ast, {
        FunctionDeclaration(path) {
            let node: ESTree.FunctionDeclaration = path.node;

            functionStack.push(node);

        },

        Identifier(path) {
            let node: ESTree.Identifier = path.node;

            myPauser.location = node.loc;

            if (node.name !== myName) {
                return;
            }
            else // if we found another identifier with my name
            {
                // get the binding of the identifier
                const binding = path.scope.getBinding(myName);

                if (binding == undefined) {
                    return;
                }
                // if the identifier is the same as me
                else if (binding.identifier === ident) {
                    const parent = path.parent;

                    // If the identifier is being reassigned a value
                    if (ESTree.isAssignmentExpression(parent) && parent.left === node) {

                        iffyDbgPrint(`[iffy ] Found a matching identifier on line ${parent.loc?.start.line}`);
                        // try to evaluate the type
                        let newValue = parent.right;
                        try {
                            let result = walk_requireSingle(newValue, "Assigning multiple values to a variable", true);
                            //console.log(result);

                            let newType = result.info.type;

                            if (newType !== currentType) {
                                isIffy = true;
                                path.stop();
                            }

                            // returnInfo.push(newType);

                        }
                        catch (err) { // couldn't get the type easily. try to backprop and see what it can do

                            /*
                            OLD::
                            // couldn't get type. In the future this should just escape to the parent/wrapper function
                            // and try to keep evaluating until it figures it out. If it ever ends up back in the same place
                            // as we started, just mark it as iffy.
                            // so essentially try scope nest:3 -> fail -> try scope nest:2 -> fail -> try scope nest:1 -> success?
                            // for now, just default to "let", but thats lazy so try to fix
                            */

                            ASTwarn(newValue, `(IGNORE ERROR ABOVE) Using complex type resolving\n\t-> Searching for mods to "${ident.name}"`);

                            /*
                            @todo to evaluate single on most recent
                                -> on fail pop again, try again
                                -> evaluateSingle wont work because uses the uneval function stack stuff
                                -> just use walkBodyDummy

                            Find way to get variables defined before they are removed from dummy mode
                                -> maybe return

                            */

                            let ready = false;
                            while (!ready && functionStack.length != 0) {
                                let fnScope = functionStack.pop(); // get the innermost function
                                if (fnScope?.body.body) {          // as long as it has a body (duh it does but just safe)
                                    // console.log("WALKING-------", dummyWalkPauseOnSet)

                                    // try to walk the body of that function
                                    iffyDbgPrint(`[iffy ] Attempting to dummy walk the innermost function, defined on line ${fnScope.loc?.start.line}`)
                                    walkBodyDummy(fnScope?.body.body, (tempObjs: stackInfo, success: boolean, errInfo: ThrowInfo | undefined) => {

                                        /*
                                        !HERE! !IMPORTANT!

                                        Need to find some way to mark all modifications

                                        Here, the variable doesn't exist yet
                                            -> Do i need to create the variable first?
                                            -> But how would it evaluate types. The entire point of this function is to do that
                                            -> Maybe force a pause on walkBodyDummy?
                                                -> On assignment, throw info
                                                -> make a global flag (type = identifier) and set it to this idents
                                                    -> whenever found, throw ctype being set to it
                                                    -> Along with info to tell catch that this throw was OK
                                                    -> NO NEED TO MAKE VAR BEFORE
                                                        -> just check flag before checking if exists
                                        */

                                        // if it didn't succeed
                                        if (!success) {
                                            // check if it was actually just an infoThrow, saying "hey, i found it"
                                            if (typeof errInfo === "object" && ("type" in errInfo)) {
                                                const eInfo: ThrowInfo = errInfo;

                                                if (eInfo.type === ThrowInfoTypes.IdentFound) {
                                                    //console.log("--------- YUP -----", ident.name, eInfo.contents.bInfo!.content);
                                                    
                                                    const setInfo: buildInfo = eInfo.contents.bInfo!;
                                                    const newType = setInfo.info.type;
                                                    
                                                    // Here, the reassignment has been found. Now just see if the type is different
                                                    if (newType !== currentType) {
                                                        isIffy = true;
                                                    }

                                                    ready = true;
                                                }
                                                else {
                                                    ASTerr_kill(node, `Unknown error info "${eInfo.type}"`);
                                                }
                                            }
                                            // There was some other issue, the function cannot be evaluated
                                            // need to go one step out and try to re evaluate from a broader scope
                                            else {
                                                // normal error, can't eval this function, jump out one more
                                                ready = false;
                                            }
                                        } else 
                                        {
                                            // Function was pointless, didn't tell us anything
                                            // @todo this is an issue with how FunctionDeclaration pushes any fn it find to functionStack 
                                            // These may just be random functions that are opened and closed before the scope of this one
                                            // need to make it only push when its actually a parent of where this code sits
                                            ready = false;
                                        }
                                        //process.exit();
                                        //console.log("WEfiojfoqfjioqjfioqf " + ready)
                                    })
                                }
                                // if the body told me nothing, just go out a bit more
                            }

                            // Did everything it could, none of the functions gave it any info
                            // Just mark it as iffy
                            if(functionStack.length == 0)
                            {
                                ASTwarn(node, `Was not able to evaluate type. defaulting to "let"`);
                                isIffy = true;
                            }

                            // console.log(functionStack);
                            // path.stop();
                        }

                        //ASTerr(node, "@todo SSA only for now");

                        /*

                        Needs to use walk on the value to see what it's being reassinged to

                        Level 1:
                            jump to assignment -> force static obvious type: "b = 10"
                            -> use try catch since error does a throw
                        Level 2:
                            jump to assignment -> escape to wrapper function -> pause current compilation -> compile wrapper function -> force knowable type
                            Essentially can't use any arguments etc
                            -> on catch, escape deeper
                        Leve 3:
                            Same as level 2 but repeatedly jump out until everything is known, or its decided that the type cannot be known
                            can't be known when trying to compile same scope as we were in before 
                        */

                        // if type is not the same, stop searching since a difference was found
                        //path.stop();
                    }

                    if(isIffy)
                    {
                        path.stop();
                    }
                }
            }
        }
    })

    dummyWalkPauseOnSet.pop();

    iffyDbgPrint(`[iffy ] DONE, "${ident.name}" should be a let? : ${isIffy}`);

    // return returnInfo;
    return isIffy;
}