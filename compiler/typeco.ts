import * as ESTree from '@babel/types';
import { cpp } from './cpp';
import { ASTerr_kill } from './ASTerr';
import { ctype } from './ctypes';

const supportedOps = ['+','-','*','/'];
const supportedComps = ['<','>','<=','>=','==','!='];

function eitherIs(leftType: ctype, rightType: ctype, type: ctype | ((_: ctype) => boolean)): boolean
{
    if(typeof(type) === 'function')
    {
        return type(leftType) || type(rightType)
    }

    return leftType === type || rightType === type;
}

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
        if(operator == '===' || operator == '!==')
        {
            ASTerr_kill(node, `@todo please use loose equality only.`);
        }
        else
        {
        ASTerr_kill(node, `Unsupported operation "${operator}"`);
        }
    }
    else if(eitherIs(leftType, rightType, cpp.types.IFFY))
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
            if(eitherIs(leftType, rightType, cpp.types.STRING) || eitherIs(leftType, rightType, cpp.types.isArray))
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