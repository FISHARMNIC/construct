import * as ESTree from '@babel/types';
import traverse from '@babel/traverse';
import { ast } from './main';
import ASTerr from './ASTerr';

export default function(ident: ESTree.Identifier): boolean
{
    const loc = ident.loc;
    const myName = ident.name;

    let isTrue = false;

    traverse(ast, {
        Identifier(path) {
            let node = path.node;

            if(node.name !== myName)
            {
                return;
            }
            else
            {
                const binding = path.scope.getBinding(myName);

                if(binding == undefined)
                {
                    return;
                }
                // found the same identifier somewhere else
                else if(binding.identifier === ident)
                {
                    const parent = path.parent;

                    // if(ESTree.isVariableDeclarator(parent))
                    //     return;

                    // Variable is reassigned somewhere
                    if(ESTree.isAssignmentExpression(parent) && parent.left === node)
                    {
                        ASTerr(node, "SSA only for now");

                        /*

                        Needs to use walk on the value to see what it's being reassinged to

                        Level 1:
                            jump to assignment -> force static obvious type: "b = 10"
                        Level 2:
                            jump to assignment -> escape to wrapper function -> pause current compilation -> compile wrapper function -> force knowable type
                            Essentially can't use any arguments etc
                        Leve 3:
                            Same as level 2 but repeatedly jump out until everything is known, or its decided that the type cannot be known
                            can't be known when trying to compile same scope as we were in before 
                        */

                        // if type is not the same, stop searching since a difference was found
                        path.stop();
                    }
                }
            }
        }
    })

    return false;
}