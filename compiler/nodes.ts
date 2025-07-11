import * as ESTree from '@babel/types';
import ASTerr from './ASTerr';
import { buildInfo, walk } from './walk';
import { cpp } from './cpp';
import iffy from './iffy';
import { coerce } from './typeco';

export default {
    VariableDeclaration(node: ESTree.VariableDeclaration, build: buildInfo[]): buildInfo | void {
        const kind = node.kind; // let, const, var
        let myType = cpp.types.AUTO;

        if (node.declarations.length != 1) {
            ASTerr(node, "@todo multiple declrations not implemented");
        }
        else {
            for (const dec of node.declarations) {
                // each declaration can have multiple declarators: "let a = 2,b = 10";
                const ident = dec.id;
                if (!ESTree.isIdentifier(ident)) {
                    ASTerr(node, "@todo non-simple variable declaration (destructuring?) not implemented");
                }
                else {
                    const name = (ident as ESTree.Identifier).name;

                    //console.log(dec);

                    const value_in: ESTree.Expression | null | undefined = dec.init;

                    let value: buildInfo = {
                        content: "",
                        info: {
                            type: cpp.types.IFFY
                        }
                    };

                    if (iffy(ident)) {
                        myType = cpp.types.IFFY;
                    }
                    else {
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

                    //console.log(compiled);

                    let ret: buildInfo = {
                        content: compiled,
                        info: {
                            type: myType
                        }
                    };


                    return ret;
                }
            }
        }
    },

    FunctionDeclaration(node: ESTree.FunctionDeclaration, build: buildInfo[]): buildInfo {
        let id = node.id;
        if(id == undefined || id == null)
        {
            ASTerr(node, "[INTERNAL] Function has no ID");
        }

        let name: string = id.name;
        let params = node.params;

        //console.log(node)

        if (name == undefined) {
            ASTerr(node, "Function has no name");
        }
        else {
            return {
                content: cpp.functions.create(id, name, params, node.body),
                info: {
                    type: cpp.types.FUNCTION
                }
            };
        }
    },

    BinaryExpression(node: ESTree.BinaryExpression, build: buildInfo[]): buildInfo {
        let left_a = walk(node.left);
        let right_a = walk(node.right);

        if(left_a.length != 1 || right_a.length != 1)
        {
            ASTerr(node, "Unsure what to do with binary expression (got multiple values, expected 1)");
        }

        let left = left_a[0];
        let right = right_a[0];

        // @todo return type based on types of left and right
        let cotype = coerce(node, left.info.type, right.info.type);
        let str = cpp.cast.static(cotype, left.content + node.operator + right.content);
        return {
            content: str,
            info: {
                type: cotype,
                left: left, 
                right: right
            }
        }
    },

    ExpressionStatement(node: ESTree.ExpressionStatement, build: buildInfo[]): buildInfo
    {
        let expression = node.expression;

        if(ESTree.isCallExpression(expression))
        {
            /// @ts-ignore
            let fname: string = expression.callee.name;

            /// debug
            if(fname === "dbgprint")
            {
                return {
                    // @ts-ignore
                    content: `std::cout << ${expression.arguments[0].name} << std::endl`,
                    info: {
                        type: cpp.types.NUMBER
                    }
                }
            }
            else
            {
                ASTerr(expression, "@todo call expressions not implemented (only dbgprint)");
            }
        }
        else
        {
            ASTerr(expression, `@todo expression type ${expression.type} not implemented`);
        }
        process.exit(0)
    },

    NumericLiteral(node: ESTree.NumericLiteral, build: buildInfo[]): buildInfo {
        return {
            content: cpp.cast.number(node.value.toString()),
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
    },

    Identifier(node: ESTree.Identifier, build: buildInfo[]): buildInfo {
        let binding = cpp.variables.get(node);
        // if is variable
        if (binding) {
            return {
                content: binding.name,
                info: {
                    type: binding.type
                }
            };
        }
        else {
            ASTerr(node, `@tod identifier "${node.name}" is not declared or unimplemented`);
        }
    },
}