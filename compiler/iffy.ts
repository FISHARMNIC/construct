import * as ESTree from '@babel/types';
import traverse from '@babel/traverse';
import { ast, buildInfo, walk, walk_requireSingle } from './walk';
import ASTerr, { ASTerr_kill, ASTwarn } from './ASTerr';
import { ctype, dummyMode, setDummyMode } from './cpp';

export default function(ident: ESTree.Identifier, currentType: ctype): boolean
{
    const loc = ident.loc;
    const myName = ident.name;

    let isIffy = false;

    traverse(ast, {
        Identifier(path) {
            let node = path.node;

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