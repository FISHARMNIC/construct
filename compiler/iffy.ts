/*




NEW SYSTEM TO BE IMPLEMENTED:

* In the beginning, all variables are untyped.
* On assign/create, add the type that they are assigned to to their list of types
* Evaluate the code normally, assuming that their types are typeList2type(myTypes)
* After first pass, restart
    * This will add other types to their list if there was a reassignment later
* Keep doing these passes until nobodys type list changes
* After 2+ passes, variables will become iffy if they are retyped later on
    * Further passes ensure that they poison dependencies as iffy too

* On each pass, everything needs to be redone. Only keeping the type list of each variable
* Store the typelist as its own Map from ident binding to ctype[]
* On variable creation, see if its ident exists in the typeList, otherwise make a new one


*/

import * as ESTree from '@babel/types';
import traverse from '@babel/traverse';
import { buildInfo, walk_requireSingle, walkBodyDummy } from './walk';
import { ast } from './main';
import { ASTerr_kill, ASTwarn, err, ThrowInfo, ThrowInfoTypes } from './ASTerr';
import { ctype, stackInfo } from './ctypes';
import { getWrapperFunc, ident2binding } from './cpp';

export type TypeList_t = Map<ESTree.Identifier, Set<ctype>>;
// no cleanup for this

/*
normalTypeLists is to be used by everything that is compiled once (not including dummy)
    -> normal functions, variables, etc.

Template functions are instanced multiple times, resulting in their local variables' identifiers being mashed together
    -> So templateTypeLists are segregated by template ID
*/
export let normalTypeLists: TypeList_t = new Map<ESTree.Identifier, Set<ctype>>;
export let templateTypeLists: TypeList_t[] = [];

/**
 * Given a template id, which is gotten by calling `template_getUniqueID`, get the appropriate type list to use
 * See comments above on why this is needed
 */
export function getTemplateTypeListFromUniqueID(id: number): TypeList_t
{
    if(templateTypeLists.length == id)
    {
        const newMap = new Map<ESTree.Identifier, Set<ctype>>;
        templateTypeLists.push(newMap);
        return newMap;
    }
    else if(id > templateTypeLists.length)
    {
        // id should grow linearly such that it should never be greater than this array
        err("[INTERNAL] typelist ordering failiure");
    }
    else
    {
        return templateTypeLists[id];
    }
}