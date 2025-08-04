import * as ESTree from '@babel/types';
import { cpp } from './cpp';
import { ASTerr_kill } from './ASTerr';
import { ctype } from './ctypes';

const supportedOps = ['+','-','*','/'];

export function coerce(node: ESTree.BinaryExpression, leftType: ctype, rightType: ctype): ctype
{
    let operator: string = node.operator;
    let returnType: string;

    if(!(supportedOps.includes(operator)))
    {
        ASTerr_kill(node, `Unsupported operation "${operator}"`);
    }
    else if(leftType === cpp.types.IFFY || rightType === cpp.types.IFFY)
    {
        returnType = cpp.types.IFFY; 
    }
    else
    {
        if(operator === '+')
        {
            if((leftType === cpp.types.STRING) || (rightType === cpp.types.STRING))
            {
                returnType = cpp.types.STRING;
            }
            else
            {
                returnType = cpp.types.NUMBER;
            }
        }
        else
        {
            returnType = cpp.types.NUMBER;
        }
    }

    console.log(`[tcoer] <${leftType}> ${operator} <${rightType}> ==> <${returnType}>`);

    return returnType;
}