import * as ESTree from '@babel/types';
import { buildInfo } from './walk';
import { typeSet2type } from './iffyTypes';

export type ctype = string;

export interface CVariable {
    possibleTypes: Set<ctype>,
    name: string,
    constant: boolean,
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
