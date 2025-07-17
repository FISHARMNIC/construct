/*

Computes resulting type of binary mathematical expression involving two same or different types

*/

import * as ESTree from '@babel/types';
import { cpp } from './cpp';
import { ASTerr_kill } from './ASTerr';
import { ctype } from './ctypes';

let truthStatements = 
{
    "+": {},
    "-": {},
    "*": {},
    "/": {},
};

// @todo type coercion for obj (ToPrimitive)

// pretty disgusting, more temporary than anything
(truthStatements["+"][cpp.types.NUMBER] ??= {})[cpp.types.NUMBER] = cpp.types.NUMBER;
(truthStatements["+"][cpp.types.STRING] ??= {})[cpp.types.STRING] = cpp.types.STRING;
(truthStatements["+"][cpp.types.STRING] ??= {})[cpp.types.NUMBER] = cpp.types.STRING;
(truthStatements["+"][cpp.types.NUMBER] ??= {})[cpp.types.STRING] = cpp.types.NUMBER;

(truthStatements["-"][cpp.types.NUMBER] ??= {})[cpp.types.NUMBER] = cpp.types.NUMBER;
(truthStatements["-"][cpp.types.STRING] ??= {})[cpp.types.STRING] = cpp.types.NUMBER;
(truthStatements["-"][cpp.types.STRING] ??= {})[cpp.types.NUMBER] = cpp.types.NUMBER;
(truthStatements["-"][cpp.types.NUMBER] ??= {})[cpp.types.STRING] = cpp.types.NUMBER;

(truthStatements["*"][cpp.types.NUMBER] ??= {})[cpp.types.NUMBER] = cpp.types.NUMBER;
(truthStatements["*"][cpp.types.STRING] ??= {})[cpp.types.STRING] = cpp.types.NUMBER;
(truthStatements["*"][cpp.types.STRING] ??= {})[cpp.types.NUMBER] = cpp.types.NUMBER;
(truthStatements["*"][cpp.types.NUMBER] ??= {})[cpp.types.STRING] = cpp.types.NUMBER;

(truthStatements["/"][cpp.types.NUMBER] ??= {})[cpp.types.NUMBER] = cpp.types.NUMBER;
(truthStatements["/"][cpp.types.STRING] ??= {})[cpp.types.STRING] = cpp.types.NUMBER;
(truthStatements["/"][cpp.types.STRING] ??= {})[cpp.types.NUMBER] = cpp.types.NUMBER;
(truthStatements["/"][cpp.types.NUMBER] ??= {})[cpp.types.STRING] = cpp.types.NUMBER;


export function coerce(node: ESTree.BinaryExpression, leftType: ctype, rightType: ctype): ctype
{
    if(leftType === cpp.types.IFFY || rightType === cpp.types.IFFY)
    {
        return cpp.types.IFFY; 
    }

    let operator: string = node.operator;

    if(operator in truthStatements)
    {
        if(leftType in truthStatements[operator] && rightType in truthStatements[operator][leftType])
        {
            return truthStatements[operator][leftType][rightType];
        }
        else
        {
            ASTerr_kill(node, `@todo type coercion with expression: (${leftType} ${operator} ${rightType}) doesn't exist or isnt' supported`)
        }
    }
    else
    {
        ASTerr_kill(node, `@todo unimplemented operator ${operator}`)
    }
    // "+" | "-" | "/" | "%" | "*" | "**" | "&" | "|" | ">>" | ">>>" | "<<" | "^" | "==" | "===" | "!=" | "!==" | "in" | "instanceof" | ">" | "<" | ">=" | "<=" | "|>"
}