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
import { walk_requireSingle } from './walk';
import { ast } from './main';
import { ASTwarn } from './ASTerr';
import { ctype } from './ctypes';


let functionStack: ESTree.FunctionDeclaration[] = [];

// @todo check that the ident is the binding itself. This is only meant for new variables
export default function(ident: ESTree.Identifier, currentType: ctype): boolean
{
    const myName = ident.name;

    let isIffy = false;

    traverse(ast, {
        FunctionDeclaration(path) {
            let node: ESTree.FunctionDeclaration = path.node;
            
            functionStack.push(node);

        },

        Identifier(path) {
            let node: ESTree.Identifier = path.node;

            if(node.name !== myName)
            {
                return;
            }
            else // if we found another identifier with my name
            {
                // get the binding of the identifier
                const binding = path.scope.getBinding(myName);

                if(binding == undefined)
                {
                    return;
                }
                // if the identifier is the same as me
                else if(binding.identifier === ident)
                {
                    const parent = path.parent;

                    // If the identifier is being reassigned a value
                    if(ESTree.isAssignmentExpression(parent) && parent.left === node)
                    {
                        // try to evaluate the type
                        let newValue = parent.right;
                        try{
                            let result = walk_requireSingle(newValue, "Assigning multiple values to a variable", true);
                            //console.log(result);

                            let newType = result.info.type;

                            if(newType !== currentType)
                            {
                                isIffy = true;
                                path.stop();
                            }

                        }
                        catch(err)
                        {
                            // couldn't get type. In the future this should just escape to the parent/wrapper function
                            // and try to keep evaluating until it figures it out. If it ever ends up back in the same place
                            // as we started, just mark it as iffy.
                            // so essentially try scope nest:3 -> fail -> try scope nest:2 -> fail -> try scope nest:1 -> success?
                            // for now, just default to "let", but thats lazy so try to fix
                            ASTwarn(newValue, `@todo (IGNORE ERROR ABOVE) variable is reassigned but lookahead is unable to resolve type. Defaulting to "let"`);
                            isIffy = true;

                            /*
                            @todo to evaluate single on most recent
                                -> on fail pop again, try again
                                -> evaluateSingle wont work because uses the uneval function stack stuff
                                -> just use walkBodyDummy

                            Find way to get variables defined before they are removed from dummy mode
                                -> maybe return

                            */

                            console.log(functionStack);
                            path.stop();
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
                }
            }
        }
    })

    return isIffy;
}