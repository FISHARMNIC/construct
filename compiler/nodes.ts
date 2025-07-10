import * as ESTree from '@babel/types';
import ASTerr from './ASTerr';
import { buildInfo, walk } from './main';
import cpp from './cpp';
import iffy from './iffy';

export default {
    VariableDeclaration(node: ESTree.VariableDeclaration, build: buildInfo[]): buildInfo | void {
        const kind = node.kind; // let, const, var
        let myType = cpp.types.UNKNOWN;

        if (node.declarations.length != 1) {
            ASTerr(node, "@todo multiple declrations not implemented");
        }

        for (const dec of node.declarations) {
            // each declaration can have multiple declarators: "let a = 2,b = 10";
            const ident = dec.id;
            if (!ESTree.isIdentifier(ident)) {
                ASTerr(node, "Non-simple variable declaration (destructuring?) not implemented");
            }
            else {
                const name = (ident as ESTree.Identifier).name;

                //console.log(dec);

                const value_in: ESTree.Expression | null | undefined = dec.init;

                let value: buildInfo = {
                    content: "",
                    info: {}
                };

                if (iffy(ident)) {
                    myType = cpp.types.UNKNOWN;
                }
                else 
                {
                    // given value: "let a = 10" as opposed to "let a"
                    if (!(value_in === undefined || value_in === null)) {
                        //console.log(value_in);
                        let allInfo: buildInfo[] = walk(value_in);
                        if (allInfo.length != 1) {
                            ASTerr(node, "Assigning multiple values to variable");
                        }
                        else {
                            value = allInfo[0];

                            if (value.info.type) {
                                myType = value.info.type;
                            }
                        }
                    }
                }

                let compiled = cpp.variables.create(ident, myType, name, value.content, kind === "const");

                console.log(compiled);

                let ret: buildInfo = {
                    content: compiled,
                    info: {
                        type: myType
                    }
                };


                return ret;
            }
        }
    },

    NumericLiteral(node: ESTree.NumericLiteral, build: buildInfo[]): buildInfo {
        return {
            content: cpp.cast.static(cpp.types.NUMBER, node.value.toString()),
            info: {
                type: cpp.types.NUMBER
            }
        };
    },

    StringLiteral(node: ESTree.StringLiteral, build: buildInfo[]): buildInfo {
        return {
            content: cpp.string.fromCstr(node.value.toString()),
            info: {
                type: cpp.types.STRING
            }
        };
    }
}