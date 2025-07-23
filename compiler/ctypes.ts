import * as ESTree from '@babel/types';

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
    parameters: ESTree.FunctionParameter[],
    name: string,
}
export interface stackInfo {
    funcs: ESTree.Identifier[],
    vars: ESTree.Identifier[]
}
