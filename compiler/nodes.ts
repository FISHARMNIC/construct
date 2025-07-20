/*

Each item in the export should be an ESTree node type

Each node is automatically called by walk, and is expected to return a buildInfo with the compiled code, and information about it

*/

import * as ESTree from '@babel/types';
import { ASTerr_kill, ASTerr_throw, ASTinfo_throw, ThrowInfoTypes } from './ASTerr';
import { buildInfo, walk_requireSingle } from './walk';
import { cpp, ident2binding, inDummyMode } from './cpp';
import iffy, { dummyWalkPauseOnSet } from './iffy';
import { coerce } from './typeco';

export default {
    VariableDeclaration(node: ESTree.VariableDeclaration, build: buildInfo[]): buildInfo | void {
        const kind = node.kind; // let, const, var
        let myType = cpp.types.AUTO;

        if (node.declarations.length != 1) {
            ASTerr_kill(node, "@todo multiple declarations not implemented");
        }
        else {
            for (const dec of node.declarations) {
                // each declaration can have multiple declarators: "let a = 2,b = 10";
                const ident = dec.id;
                if (!ESTree.isIdentifier(ident)) {
                    ASTerr_kill(node, "@todo non-simple variable declaration (destructuring?) not implemented");
                }
                else {
                    const name = (ident as ESTree.Identifier).name;

                    const value_in: ESTree.Expression | null | undefined = dec.init;

                    if (!(value_in === undefined || value_in === null)) {
                        //console.log(value_in);
                        let value = walk_requireSingle(value_in, "Assigning multiple values to single variable");

                        let compiled = cpp.variables.create2(ident, name, value, kind === "const");

                        let ret: buildInfo = {
                            content: compiled,
                            info: {
                                type: myType
                            }
                        };


                        return ret;
                    }
                    else {
                        ASTerr_kill(ident, "@todo Variable has no value");
                    }

                    //console.log(dec);

                    // const value_in: ESTree.Expression | null | undefined = dec.init;

                    // let value: buildInfo = {
                    //     content: "",
                    //     info: {
                    //         type: cpp.types.IFFY
                    //     }
                    // };


                    //     // given value: "let a = 10" as opposed to "let a"
                    //     if (!(value_in === undefined || value_in === null)) {
                    //         //console.log(value_in);
                    //         value = walk_requireSingle(value_in, "Assigning multiple values to single variable");


                    //             if (value.info.type) {
                    //                 myType = value.info.type;
                    //             }

                    //             if (iffy(ident, myType)) {
                    //                 myType = cpp.types.IFFY;
                    //             }

                    //     }

                    // //console.log("CREATING", myType, name, value)
                    // let compiled = cpp.variables.create(ident, myType, name, value.content, kind === "const");

                    //console.log(compiled);

                    // let ret: buildInfo = {
                    //     content: compiled,
                    //     info: {
                    //         type: myType
                    //     }
                    // };


                    // return ret;
                }
            }
        }
    },

    AssignmentExpression(node: ESTree.AssignmentExpression, build: buildInfo[]): buildInfo {
        let left = node.left;
        if (!ESTree.isIdentifier(left)) {
            ASTerr_kill(left, "@todo LHS of assignment is not an identifier");
        }
        else {
            let binding = ident2binding(left);

            // used when "iffy" is looking for reassignments
            let lookingFor = dummyWalkPauseOnSet.at(-1);
            if (lookingFor)
                if (inDummyMode() && lookingFor.find == binding) {
                    if (!lookingFor.location)
                        ASTerr_kill(left, "Error");

                    if (lookingFor.location == left.loc) {
                        console.log(`----- FOUND what iffy was looking for! : "${left.name}" -----`);

                        let value = walk_requireSingle(node.right, "Assigning multiple values to a variable");

                        ASTinfo_throw({
                            type: ThrowInfoTypes.IdentFound,
                            contents: {
                                bInfo: value
                            }
                        })

                    }
                }

            let existingVar = cpp.variables.get(left);
            if (existingVar === undefined) // variable is declared elsewhere, but compiler hasn't looked at it yet
            {
                /* 
                @todo this is where a throw (ASTerr normal) should be used 
                
                In the future, on function decs, they should only walk the body/blockStatement as a dummy in an attempt to compile
                If fail (like this for example, where it uses a var declared later), then catch and hold off until the function is called,
                then try to revaluate the function (again in dummy mode)
                If success, reval not in dummy mode for reals this time

                */
                ASTerr_throw(left, `@todo assignment to "${left.name}" before it is declared`);
            }
            else if (existingVar === null) // variable is not declared anywhere
            {
                ASTerr_kill(left, `LHS of assignment "${left.name}" is never declared`);
            }
            else {
                let rval = walk_requireSingle(node.right, "Assigning multiple values to a variable");
                let reassignment: string = cpp.variables.reassign(left, existingVar, rval);

                return {
                    content: reassignment,
                    info: {
                        type: existingVar.type,
                    }
                };

            }
        }

    },

    // @todo create function forward decs
    FunctionDeclaration(node: ESTree.FunctionDeclaration, build: buildInfo[]): buildInfo {
        let id = node.id;
        if (id == undefined || id == null) {
            ASTerr_kill(node, "[INTERNAL] Function has no ID");
        }

        let name: string = id.name;
        let params = node.params;

        //console.log(node)

        if (name == undefined) {
            ASTerr_kill(node, "Function has no name");
        }
        else {
            let fn = cpp.functions.create(node, id, name, params, node.body);
            console.log("INFO", fn);
            return {
                content: fn.strconts,
                info: {
                    type: cpp.types.FUNCTION
                },
                replace: fn.repObj,
                defer: true
            };
        }
    },

    BinaryExpression(node: ESTree.BinaryExpression, build: buildInfo[]): buildInfo {
        let left = walk_requireSingle(node.left, "Unsure what to do with binary expression (got multiple values, expected 1)");
        let right = walk_requireSingle(node.right, "Unsure what to do with binary expression (got multiple values, expected 1)");

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

    ExpressionStatement(node: ESTree.ExpressionStatement, build: buildInfo[]): buildInfo {
        let expression = node.expression;

        if (ESTree.isCallExpression(expression)) {
            /// @ts-ignore
            let fname: string = expression.callee.name;

            /// debug
            if (fname === "dbgprint") {
                return {
                    // @ts-ignore
                    // @todo for will get compiler error if you dont just put a single item
                    // it expects an identifier
                    content: `std::cout << ${expression.arguments[0].name} << std::endl`,
                    info: {
                        type: cpp.types.NUMBER
                    }
                }
            }
            else {
                // @todo on function call need to check if evaluated yet
                ASTerr_kill(expression, "@todo call expressions not implemented (only dbgprint)");
            }
        }
        else {
            if (expression.type in this) {
                return this[expression.type](expression, build);
            }
            else {
                ASTerr_kill(expression, `@todo expression type ${expression.type} not implemented`);
            }
        }
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
            ASTerr_throw(node, `@todo identifier "${node.name}" is not declared or is unimplemented`);
        }
    },
}