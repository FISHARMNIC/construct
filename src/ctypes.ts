import * as ESTree from '@babel/types';
import { buildInfo } from './walk';
import { typeSet2type } from './iffyTypes';
import { newTypeInformation } from './main';

export type ctype = string;

export interface CVariable {
    possibleTypes: Set<ctype>,
    name: string,
    constant: boolean,
}

export function addType(variable: CVariable, type: ctype): void
{
    // mark that we need another pass only when there is genuinely new type info
    if(!variable.possibleTypes.has(type))
    {
        newTypeInformation();
    }

    variable.possibleTypes.add(type);
}
export function getType(variable: CVariable): ctype
{
    return typeSet2type(variable.possibleTypes);
}

// export function bInfoIsList(bInfo: buildInfo): boolean
// {
//     return(bInfo.info.isList ?? false);
// }
/**
 * Regular function WITHOUT parameters
 */
export interface CFunction {
    return: ctype,
    name: string,
}

/**
 * Function WITH parameters
 */
export interface CTemplateFunction {
    func: ESTree.FunctionDeclaration,
    params: ESTree.FunctionParameter[],
    name: string,
}

/**
 * Stores information about the current stack
 */
export interface stackInfo {
    funcs: ESTree.Identifier[],
    templateFuncs: ESTree.Identifier[],
    vars: ESTree.Identifier[],
    returnStatements: buildInfo[],
}
