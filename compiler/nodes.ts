import * as ESTree from '@babel/types';
import ASTerr from './ASTerr';
import { walk } from './main';

export default {
    VariableDeclaration(node: ESTree.VariableDeclaration, build: string[]) {
        const kind = node.kind; // let, const, var
        node.declarations.forEach((dec: ESTree.VariableDeclarator): void => {
            // each declaration can have multiple declarators: "let a = 2,b = 10";
            const ident = dec.id;
            if (!ESTree.isIdentifier(ident)) {
                ASTerr(node, "Non-simple variable declaration (destructuring?) not implemented");
            }
            else {
                const name = (ident as ESTree.Identifier).name;

                console.log(dec);

                const value: ESTree.Expression | null | undefined = dec.init;
                let value_str: string;
                // no given value: "let a";
                if (value === undefined || value === null) {
                    value_str = "";   
                }
                else
                {
                    console.log(value)
                    value_str = walk(value).join(" ");
                }

                console.log(value_str)
            }
        })
    },

    NumericLiteral(node: ESTree.NumericLiteral, build: string[]) {
        return node.value
    }
}