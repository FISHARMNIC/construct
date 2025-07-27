import * as ESTree from '@babel/types';
import { buildInfo } from './walk';

export type ctype = string;

export interface CVariable {
    type: ctype,
    name: string,
    constant: boolean,
}

export interface CFunction {
    return: ctype,
    name: string,
    // parameters: ESTree.FunctionParameter[]
}

export interface CTemplateFunction {
    func: ESTree.Function,
    params: ESTree.FunctionParameter[],
    name: string,
}

export interface stackInfo {
    funcs: ESTree.Identifier[],
    templateFuncs: ESTree.Identifier[],
    vars: ESTree.Identifier[],
    returnStatements: buildInfo[],
}
