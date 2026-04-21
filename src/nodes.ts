/*

Each item in the export should be an ESTree node type

Each node is automatically called by walk, and is expected to return a buildInfo with the compiled code, and information about it

*/

import * as ESTree from '@babel/types';
import { ASTerr_kill, ASTerr_throw } from './ASTerr';
import { buildInfo, buildInfoToStr, stringTobuildInfo, walk_requireSingle, walkInlineOrBody } from './walk';
import { cpp, fnIdent2binding, tempStack } from './cpp';
import { coerce } from './typeco';
import { evaluateAllFunctions, evaluateAndCallTemplateFunction, unevaledFuncs } from './funcs';
import { CFunction, CTemplateFunction, ctype, getType } from './ctypes';
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
        // supports multi-declaration now: let a=1, b=2;
        const declarations: string[] = [];
        let lastType: ctype = cpp.types.VOID;

        for (const dec of node.declarations) {
            const ident = dec.id;
            if (!ESTree.isIdentifier(ident)) {
                ASTerr_kill(node, "Non-simple variable declaration (destructuring) is not implemented");
            }

            const value_in: ESTree.Expression | null | undefined = dec.init;
            if (value_in === undefined || value_in === null) {
                ASTerr_kill(ident, `Variable "${ident.name}" must have an initializer`);
            }

            const value = walk_requireSingle(value_in, "Assigning multiple values to single variable");
            const compiled = cpp.variables.create2(ident, ident.name, value, { constant: kind === "const", useTypeList });

            declarations.push(compiled);
            lastType = value.info.type;
        }

        return {
            content: declarations.join(";\n"),
            info: {
                type: lastType
            }
        };
    },

    MemberExpression(node: ESTree.MemberExpression): buildInfo {
        // right now this is only array/string style access with computed index (obj[idx])
        if (!node.computed) {
            ASTerr_kill(node, `Dot property access is not implemented`);
        }
        else if (!ESTree.isIdentifier(node.object)) {
            ASTerr_kill(node.object, `Complex base type is not supported yet`);
        }
        else {
            const base: ESTree.Identifier = node.object as ESTree.Identifier;
            const index: buildInfo = walk_requireSingle(node.property);

            const existingVar = cpp.variables.getSafe(base);

            const type: ctype = cpp.array.itemType(existingVar);

            return {
                content: `${existingVar.name}[${index.content}]`,
                info: {
                    type
                }
            }
        }
    },

    AssignmentExpression(node: ESTree.AssignmentExpression): buildInfo {
        const left = node.left;
        const rval = walk_requireSingle(node.right, "Assigning multiple values to a variable");

        if (ESTree.isMemberExpression(left)) { // a[X] or a.X
            if (!left.computed) {
                ASTerr_kill(left, `Dot property access is not implemented`);
            }
            else if (!ESTree.isIdentifier(left.object)) {
                ASTerr_kill(left.object, `Complex base type is not supported yet`);
            }
            else {
                const base: ESTree.Identifier = left.object;
                const index: buildInfo = walk_requireSingle(left.property);

                const existingVar = cpp.variables.getSafe(base);

                return cpp.array.modify(base, existingVar, index, rval);
            }
        }
        else if (ESTree.isIdentifier(left)) {
            const existingVar = cpp.variables.getSafe(left);

            const reassignment: string = cpp.variables.reassign(left, existingVar, rval);

            return {
                content: reassignment,
                info: {
                    type: getType(existingVar),
                }
            };


        }
        else {
            ASTerr_kill(left, `Unable to handle LHS of assignment as "${left.type}"`);
        }

    },

    FunctionDeclaration(node: ESTree.FunctionDeclaration): buildInfo {
        const id = node.id;
        if (id == undefined || id == null) {
            ASTerr_kill(node, "[INTERNAL] Function has no ID");
        }

        const name: string = id.name;
        const params = node.params;

        //console.log(node)

        if (name == undefined) {
            ASTerr_kill(node, "Function has no name");
        }
        else {
            const fn = cpp.functions.createDec(node, id, name, params);
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
        const left = walk_requireSingle(node.left, "Unsure what to do with binary expression (got multiple values, expected 1)");
        const right = walk_requireSingle(node.right, "Unsure what to do with binary expression (got multiple values, expected 1)");
        const operator = node.operator;

        const cotype = coerce(node, left.info.type, right.info.type);

        const str = cpp.cast.static(cotype, operator == '%' ? `std::fmod(${left.content},${right.content})` : `${left.content} ${operator} ${right.content}`, cotype);
        
        return {
            content: str,
            info: {
                type: cotype,
                left: left,
                right: right,
                operator
            }
        };
    },

    CallExpression(expression: ESTree.CallExpression): buildInfo {
        if (ESTree.isV8IntrinsicIdentifier(expression.callee)) {
            ASTerr_kill(expression, "Unable to handle callee of type V8IntrinsicIdentifier");
        }

        const functionCalled: ESTree.Expression = expression.callee;

        if (!ESTree.isIdentifier(functionCalled))
            ASTerr_kill(functionCalled, `Unable to call function of type ${functionCalled.type}`);

        const fname: string = functionCalled.name;

        // special builtin mapped straight to cout
        if (fname === "dbgprint") {
            const firstArg = expression.arguments[0];
            if (!firstArg || !ESTree.isExpression(firstArg)) {
                ASTerr_kill(expression, `dbgprint expects one expression argument`);
            }

            return {
                content: `std::cout << ${walk_requireSingle(firstArg).content} << std::endl`,
                info: {
                    type: cpp.types.NUMBER
                }
            };
        }
        else {
            const fnID: ESTree.Identifier = functionCalled;

            const params = expression.arguments;
            const evaluatedArguments = params.map((value): buildInfo => {
                if (ESTree.isExpression(value)) {
                    return walk_requireSingle(value, `Expected single value in parameter`);
                }
                else {
                    ASTerr_kill(value, `Unsupported parameter type "${value.type}"`)
                }
            })

            const binding = fnIdent2binding(fnID);
            if (binding == undefined) {
                ASTerr_kill(fnID, `Undeclared function "${fname}"`);
            }
            else if (cpp.functions.allTemplates().has(binding)) { // template function
                console.log(`[tfunc] binding ${functionCalled.name} ==> ${binding.name}`)
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
                    // function is known but deferred; try resolving queue now
                    evaluateAllFunctions();
                    if (findIndex() !== -1)
                    {
                        ASTerr_kill(fnID, `Was not able to evaluate function "${funcData.name}" at call time`);
                    }
                }

                if (evaluatedArguments.length !== 0) {
                    // non-template functions are currently zero-param only
                    ASTerr_kill(fnID, `Function "${funcData.name}" does not take arguments`);
                }

                return cpp.functions._call(funcData, [], []);
            }
            else {
                ASTerr_kill(fnID, `Unknown function "${fnID.name}"`);
            }
        }
    },

    ExpressionStatement(node: ESTree.ExpressionStatement, build: buildInfo[]): buildInfo {
        const expression = node.expression;

        if (ESTree.isCallExpression(expression)) {
            return this.CallExpression(expression, build);
        }
        else {
            if (expression.type in this) {
                return this[expression.type](expression, build);
            }
            else {
                ASTerr_kill(expression, `Expression type ${expression.type} is not implemented`);
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
        const binding = cpp.variables.get(node);
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
            ASTerr_throw(node, `Identifier "${node.name}" is not declared or is not implemented`);
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
        // console.log(node);

        const unparsedElements = node.elements;
        const arrayElements: buildInfo[] = [];

        unparsedElements.forEach((element): void => {
            if (ESTree.isExpression(element)) {
                arrayElements.push(walk_requireSingle(element, "Expected single element in array"));
            }
            else if (ESTree.isSpreadElement(element)) {
                ASTerr_kill(node, `Array spread is not implemented`);
            }
            else {
                ASTerr_kill(node, `Array literal contains an unsupported null element`);
            }
        })

        const instance: buildInfo = cpp.array.instance(arrayElements, unparsedElements);

        return instance;
    },
    WhileStatement(node: ESTree.WhileStatement): buildInfo {
        const castedComparisonStatement: string = simpleComparisonBlock(node.test);
        const body: buildInfo[] = walkInlineOrBody(node.body);

        return stringTobuildInfo(`while(${castedComparisonStatement}) {\n${buildInfoToStr(body).join("\n")}\n}`);
    },
    IfStatement(node: ESTree.IfStatement): buildInfo {
        const out: string = genIfBranches(node);
        return stringTobuildInfo(out);
    },
    BooleanLiteral(node: ESTree.BooleanLiteral): buildInfo {
        return {
            content: String(node.value),
            info:
            {
                type: cpp.types.BOOLEAN
            }
        };
    }
}

/**
 * Walks an expression and casts to a boolean 
 */
function simpleComparisonBlock(comparison: ESTree.Expression): string {
    const test: buildInfo = walk_requireSingle(comparison);
    const castedComparisonStatement: string = cpp.cast.static(cpp.types.BOOLEAN, test.content, test.info.type);

    return castedComparisonStatement;
}

/**
 * Recursive helper for IfStatement that handles nested if/(if else)/else statements
 * @param build used internally 
 * @param isIfElse used internally
 * @returns entire block of branch statements
 */
function genIfBranches(node: ESTree.Statement, build: string[] = [], isIfElse: boolean = false): string {
    
    if (ESTree.isIfStatement(node)) {
        const comp: string = simpleComparisonBlock(node.test);

        const body = walkInlineOrBody(node.consequent);
        build.push(`${isIfElse ? "else " : ""}if(${comp}) {\n${buildInfoToStr(body).join("\n")}\n}`);

        if (node.alternate) {
            genIfBranches(node.alternate, build, true);
        } 
    }
    else {
        const body = walkInlineOrBody(node);

        build.push(`else {\n${buildInfoToStr(body).join("\n")}\n}`);

    }

    return build.join("\n");
}
