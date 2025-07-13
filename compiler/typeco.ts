import * as ESTree from '@babel/types';
import { ctype } from './cpp';
import { cpp } from './cpp';
import ASTerr from './ASTerr';

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
            ASTerr(node, `@todo type coercion with expression: (${leftType} ${operator} ${rightType}) doesn't exist or isnt' supported`)
        }
    }
    else
    {
        ASTerr(node, `@todo unimplemented operator ${operator}`)
    }
    // "+" | "-" | "/" | "%" | "*" | "**" | "&" | "|" | ">>" | ">>>" | "<<" | "^" | "==" | "===" | "!=" | "!==" | "in" | "instanceof" | ">" | "<" | ">=" | "<=" | "|>"
}