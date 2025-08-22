import * as ESTree from '@babel/types';
import { cpp } from './cpp';
import { ASTerr_kill } from './ASTerr';
import { ctype } from './ctypes';

const supportedOps = ['+','-','*','/'];
const supportedComps = ['<','>','<=','>=','==','!='];

// @todo refactor all of the lazy if else
export function coerce(node: ESTree.BinaryExpression, leftType: ctype, rightType: ctype): ctype
{
    const operator: string = node.operator;
    let returnType: string;

    if(supportedComps.includes(operator))
    {
        returnType = cpp.types.BOOLEAN;
    }
    else if(!(supportedOps.includes(operator)))
    {
        ASTerr_kill(node, `Unsupported operation "${operator}"`);
    }
    else if(leftType === cpp.types.IFFY || rightType === cpp.types.IFFY)
    {
        if(operator === '+')
        {
        returnType = cpp.types.IFFY; 
        }
        else
        {
            returnType = cpp.types.NUMBER;
        }
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