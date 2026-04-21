import * as ESTree from '@babel/types';
import { cpp } from './cpp';
import { ASTerr_kill } from './ASTerr';
import { ctype } from './ctypes';

const supportedOps = new Set(['+', '-', '*', '/', '%']);
const supportedComps = new Set(['<', '>', '<=', '>=', '==', '!=']);

export function coerce(node: ESTree.BinaryExpression, leftType: ctype, rightType: ctype): ctype
{
    const operator: string = node.operator;
    let returnType: ctype;

    // comparisons always collapse to bool
    if(supportedComps.has(operator))
    {
        returnType = cpp.types.BOOLEAN;
    }
    else if(!supportedOps.has(operator))
    {
        ASTerr_kill(node, `Unsupported operation "${operator}"`);
    }
    else if (operator === '+')
    {
        // JS-ish "+" behavior: string wins, dynamic stays dynamic
        if (leftType === cpp.types.IFFY || rightType === cpp.types.IFFY) {
            returnType = cpp.types.IFFY;
        } else if (leftType === cpp.types.STRING || rightType === cpp.types.STRING) {
            returnType = cpp.types.STRING;
        } else {
            returnType = cpp.types.NUMBER;
        }
    }
    else
    {
        returnType = cpp.types.NUMBER;
    }

    console.log(`[tcoer] <${leftType}> ${operator} <${rightType}> ==> <${returnType}>`);

    return returnType;
}
