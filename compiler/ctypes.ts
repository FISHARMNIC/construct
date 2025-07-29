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
    if(!variable.possibleTypes.has(type))
    {
        newTypeInformation();
    }

    variable.possibleTypes.add(type);

    // @todo store the types that changed here for faster difference resolving before next pass
    // cant just force do it. need to check that its actually new first or else whats the point of this function
}
export function getType(variable: CVariable): ctype
{
    return typeSet2type(variable.possibleTypes);
}

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
    func: ESTree.Function,
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
