import * as ESTree from '@babel/types';
import { buildInfo } from './walk';

export type ctype = string;

export interface CVariable {
    type: ctype,
    name: string,
    constant: boolean,
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
