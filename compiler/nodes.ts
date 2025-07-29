/*

Each item in the export should be an ESTree node type

Each node is automatically called by walk, and is expected to return a buildInfo with the compiled code, and information about it

*/

import * as ESTree from '@babel/types';
import { ASTerr_kill, ASTerr_throw, ASTinfo_throw, ASTwarn, err, ThrowInfoTypes } from './ASTerr';
import { buildInfo, walk_requireSingle } from './walk';
import { cpp, fnIdent2binding, ident2binding, inDummyMode, tempStack } from './cpp';
import { coerce } from './typeco';
import { ast, eslintScope } from './main';
import { evaluateAllFunctions, evaluateAndCallTemplateFunction, unevaledFuncs } from './funcs';
import { CFunction, CTemplateFunction, getType } from './ctypes';
import { TypeList_t } from './iffy';

/**
 * Each of these functions is passed:
 * @param node information about the corresponding node
 * @param build !DEPRECATED! list of what else has been built in the same `walk` prior to this node.
 * @param useTypeList if doing something like creating new variables, use this as the typelist for that.
 * S\ee why this is needed in `iffy.ts`
 */
export default {
    VariableDeclaration(node: ESTree.VariableDeclaration, build: buildInfo[], useTypeList: TypeList_t): buildInfo {
        const kind = node.kind; // let, const, var
        // let myType = cpp.types.;

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
                    const name = ident.name;

                    const value_in: ESTree.Expression | null | undefined = dec.init;

                    if (!(value_in === undefined || value_in === null)) {
                        //console.log(value_in);
                        let value = walk_requireSingle(value_in, "Assigning multiple values to single variable");

                        let compiled = cpp.variables.create2(ident, name, value, { constant: kind === "const", useTypeList });

                        let ret: buildInfo = {
                            content: compiled,
                            info: {
                                type: value.info.type
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

            // Should never get here. 
            // @todo Remove this when multiple decs implemented
            ASTerr_kill(node, "Inconcievable! ;)");
        }
    },

    MemberExpression(node: ESTree.MemberExpression): buildInfo {

        err(`@todo MemberExpression needs to be reworked`);

        // @ todo !HERE! !IMPORTANT! this is super messy because its duplicated in AssignmentExpression
        // need have buildInfo store 2 things, its type, like "variable" "list" "function" and its binding
        // ORRRRR just evaluate the binding from there and dont need to store any of that
        if (!node.computed) {
                ASTerr_kill(node, `@todo dot property access not implemented`);
            }
            else if (!ESTree.isIdentifier(node.object)) {
                // just need to walk
                ASTerr_kill(node.object, `@todo complex base type not supported yet`);
            }
            else {
                let base: ESTree.Identifier = node.object as ESTree.Identifier;
                let index: buildInfo = walk_requireSingle(node.property);

                // @todo note i dont know how its going to work with prototype etc
                // @todo eventually all methods will have to be implemented as a part of the class

                let existingVar = cpp.variables.getSafe(base);

                return {
                    content: `${base}[${index}]`,
                    info: {
                        type: getType(existingVar),
                        isList: false
                    }
                }
            }
    },

    AssignmentExpression(node: ESTree.AssignmentExpression): buildInfo {
        let left = node.left;
        let rval = walk_requireSingle(node.right, "Assigning multiple values to a variable");

        if (ESTree.isMemberExpression(left)) { // a[X] or a.X
            if (!left.computed) {
                ASTerr_kill(left, `@todo dot property access not implemented`);
            }
            else if (!ESTree.isIdentifier(left.object)) {
                // just need to walk
                ASTerr_kill(left.object, `@todo complex base type not supported yet`);
            }
            else {
                let base: ESTree.Identifier = left.object;
                let index: buildInfo = walk_requireSingle(left.property);

                // @todo note i dont know how its going to work with prototype etc
                // @todo eventually all methods will have to be implemented as a part of the class

                let existingVar = cpp.variables.getSafe(base);

                return cpp.array.modify(base, existingVar, index, rval);
            }
        }
        else if (ESTree.isIdentifier(left)) {
            // used when "iffy" is looking for reassignments
            // let lookingFor = dummyWalkPauseOnSet.at(-1);
            // if (lookingFor)
            //     if (inDummyMode() && lookingFor.find == binding) {
            //         if (!lookingFor.location)
            //             ASTerr_kill(left, "Error");

            //         if (lookingFor.location == left.loc) {
            //             console.log(`----- FOUND what iffy was looking for! : "${left.name}" -----`);

            //             let value = walk_requireSingle(node.right, "Assigning multiple values to a variable");

            //             ASTinfo_throw({
            //                 type: ThrowInfoTypes.IdentFound,
            //                 contents: {
            //                     bInfo: value
            //                 }
            //             })

            //         }
            //     }

            let existingVar = cpp.variables.getSafe(left);

            let reassignment: string = cpp.variables.reassign(left, existingVar, rval);

            return {
                content: reassignment,
                info: {
                    type: getType(existingVar),
                }
            };


        }
        else {
            ASTerr_kill(left, `@todo unable to handle LHS of assignment as "${left.type}"`);
        }

    },

    // @todo create function forward decs
    FunctionDeclaration(node: ESTree.FunctionDeclaration): buildInfo {
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
            let fn = cpp.functions.createDec(node, id, name, params, node.body);
            // console.log("INFO", fn);
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

    BinaryExpression(node: ESTree.BinaryExpression): buildInfo {
        let left = walk_requireSingle(node.left, "Unsure what to do with binary expression (got multiple values, expected 1)");
        let right = walk_requireSingle(node.right, "Unsure what to do with binary expression (got multiple values, expected 1)");

        // @todo return type based on types of left and right
        let cotype = coerce(node, left.info.type, right.info.type);
        let str = cpp.cast.static(cotype, left.content + node.operator + right.content, cotype);
        return {
            content: str,
            info: {
                type: cotype,
                left: left,
                right: right
            }
        }
    },

    CallExpression(expression: ESTree.CallExpression): buildInfo {
        if (ESTree.isV8IntrinsicIdentifier(expression.callee)) {
            ASTerr_kill(expression, "Unable to handle callee of type V8IntrinsicIdentifier");
        }

        const functionCalled: ESTree.Expression = expression.callee;

        if (!ESTree.isIdentifier(functionCalled))
            // @todo just do a walk
            ASTerr_kill(functionCalled, `@todo unable to call function of type ${functionCalled.type}`);

        const fname: string = functionCalled.name;

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
            };
        }
        else {
            const fnID: ESTree.Identifier = functionCalled;

            let params = expression.arguments;
            let evaluatedArguments = params.map((value): buildInfo => {
                if (ESTree.isExpression(value)) {
                    return walk_requireSingle(value, `Expected single value in parameter`);
                }
                else {
                    ASTerr_kill(value, `@todo unimplemented parameter type "${value.type}"`)
                }
            })

            const binding = fnIdent2binding(fnID);
            if (binding == undefined) {
                // @todo maybe make this dont kill? - same thing as var use without linear control flow
                ASTerr_kill(fnID, `@todo Undeclared function "${fname}"`);
            }
            else if (cpp.functions.allTemplates().has(binding)) { // template function
                const ctempfunc: CTemplateFunction = cpp.functions.allTemplates().get(binding)!;
                const evaluated: buildInfo = evaluateAndCallTemplateFunction(ctempfunc, evaluatedArguments);

                return evaluated;

            }
            else if (cpp.functions.allNormal().has(binding)) { // regular function
                const funcData: CFunction = cpp.functions.allNormal().get(binding)!;
                const findIndex = () => unevaledFuncs.findIndex((v): boolean => {
                    const id = (v.func as ESTree.FunctionDeclaration).id
                    return id === binding
                })
                if (findIndex() !== -1) {
                    evaluateAllFunctions(); // @todo don't need to do all. Just add new param that lets it just find one, and returns success or not
                    if (findIndex() !== -1) // see comment above on how this could be opt
                    {
                        ASTerr_kill(fnID, `Was not able to evaluate function "${funcData.name}" at call time`);
                    }
                }

                return cpp.functions._call(funcData, [], []);
            }
            else {
                ASTerr_kill(fnID, `Unknown function "${fnID.name}"`);
            }

            //console.log(Array.from(allTemplateFuncs.values())[0]);

            //// @ts-expect-error
            //true;

            // ASTerr_kill(expression, "@todo call expressions not implemented (only dbgprint)");
        }
    },

    ExpressionStatement(node: ESTree.ExpressionStatement, build: buildInfo[]): buildInfo {
        let expression = node.expression;

        if (ESTree.isCallExpression(expression)) {
            return this.CallExpression(expression, build);
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

    NumericLiteral(node: ESTree.NumericLiteral): buildInfo {
        return {
            content: cpp.cast.number(node.value.toString()),
            info: {
                type: cpp.types.NUMBER
            }
        };
    },

    StringLiteral(node: ESTree.StringLiteral): buildInfo {
        return {
            content: cpp.string.fromCstr(node.value.toString()),
            info: {
                type: cpp.types.STRING
            }
        };
    },

    Identifier(node: ESTree.Identifier): buildInfo {
        let binding = cpp.variables.get(node);
        // if is variable
        if (binding) {
            return {
                content: binding.name,
                info: {
                    type: getType(binding)
                }
            };
        }
        else {
            ASTerr_throw(node, `@todo identifier "${node.name}" is not declared or is unimplemented`);
        }
    },

    ReturnStatement(node: ESTree.ReturnStatement): buildInfo {

        const returnsVoid: boolean = !node.argument;
        let value: buildInfo = { content: '', info: { type: cpp.types.VOID } };

        if (!returnsVoid) {
            value = walk_requireSingle(node.argument!)
            value.info.returningData = value.content;
        }

        value.content = 'return ' + value.content;
        console.log(`[retrn] ==> "${value.content}" as "${value.info.type}"`)

        const recent = tempStack.at(-1);
        if (recent !== undefined/* && inDummyMode()*/) {
            recent.returnStatements?.push(value);
        }

        return value;
    },

    ArrayExpression(node: ESTree.ArrayExpression): buildInfo {
        console.log(node);

        const unparsedElements = node.elements;
        let arrayElements: buildInfo[] = [];

        unparsedElements.forEach((element): void => {
            if (ESTree.isExpression(element)) {
                arrayElements.push(walk_requireSingle(element, "Expected single element in array"));
            }
            else if (ESTree.isSpreadElement(element)) {
                ASTerr_kill(node, `@todo array spread not implemented`);
            }
            else {
                ASTerr_kill(node, `@todo value in array is null?`);
            }
        })

        let instance: buildInfo = cpp.array.instance(arrayElements);

        return instance;
    }
}