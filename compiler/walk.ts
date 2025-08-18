import * as ESTree from '@babel/types';
import { ASTerr_kill, err, ThrowInfo } from './ASTerr';
import nodes from './nodes';
/// @ts-ignore
import { __dummyModeGlevel, cpp, enterDummyMode, enterDummyMode_raw, exitDummyMode, exitDummyMode_raw, tempStack } from './cpp';
import { ctype, stackInfo } from './ctypes';
import { TypeList_t, normalTypeLists } from './iffy';

// export let toReplace: replaceObj[] = [];

/**
 * Used in buildInfo to mark info about `buildInfo::content` like what type the compiled code should be
 * Can also store extra info, like `returningData` which is only used in function calls
 */
interface nodeInfo {
  type: ctype,              // what type is the node
  left?: buildInfo,         // info about what is on the left (not always provided)
  right?: buildInfo         // "
  returningData?: string, // used only for return analysis
  // isList?: boolean,
}

/**
 * @param ready Marks that the parent `buildInfo` is ready to be replaced with my `.with`
 * @param surroundings [0] addes a prefix, [1] adds a suffix, for example a function definition wrapper: int main() {...}
 */
export interface replaceObj {
  ready: boolean,           // if the parenting build info is ready to be replaced
  with?: buildInfo[],       // what to replace with
  surroundings?: string[]
}

/**
 * Used everywhere to store not only what string was compiled by `walk`, but also what type it is
 * Also stores extra info, like if the node should be replaced with something later, if it should be deferred
 */
export interface buildInfo {
  content: string,
  info: nodeInfo,
  defer?: boolean,     // dont place in the main function, for example like a function dec
  replace?: replaceObj, // if this exists and so does .ready, then this build info .content should be replaces with .replace.with
  // ^^^ used for fuction evaluation that may be pushed off until later
}

// Used to know if code is global or not
export let nestLevel = -1;
export function changeNestLevel(by: number) {
  nestLevel += by;
}

/**
 * Walks a block statement in dummy mode, as such that there is no side effects like variable creation
 * Used to verify if a function is compileable yet
 * @param body List of statements
 * @param beforeDelete Run this callback before the stack information along with all local variables are deleted
 * @returns Information about what was compiled, along with if it failed and why
 */
export function walkBodyDummy(body: ESTree.Statement[], beforeDelete?: (obj: stackInfo, success: boolean, errorInfo: ThrowInfo | undefined) => void, useTypeList: TypeList_t = normalTypeLists): { info: buildInfo[], success: boolean, errorInfo: ThrowInfo | undefined } {

  let lastObj: stackInfo = {
    funcs: [],
    vars: [],
    templateFuncs: [],
    returnStatements: []
  };

  tempStack.push(lastObj);
  // console.log("----- CREATED TEMP STACK -----", __dummyModeGlevel());

  let success = false;
  let out: buildInfo[] = [];
  let errInfo: ThrowInfo | undefined = undefined;

  // console.log(">>>>>> in", nestLevel, nestLevel + 1);
  nestLevel++;

  try {
    out = walkBody(body, { dummy: true, unsafe: true, useTypeList });
    success = true;
  }
  catch (err) {
    success = false;
    errInfo = err;
  }

  // console.log(">>>>>> out", nestLevel, nestLevel - 1);
  nestLevel--;

  if (beforeDelete)
    beforeDelete(lastObj, success, errInfo);

  ///  @todo make this more dynamic. Just instead of it being an Identifier[] also hold the delete function

  // clean up all temporary stuff
  lastObj.funcs.forEach((value: ESTree.Identifier): void => {
    cpp.functions.allNormal().delete(value);
  });

  lastObj.vars.forEach((value: ESTree.Identifier): void => {
    console.log("[dummy] deleting dummy variable", value.name);
    cpp.variables.remove(value);
  });

  lastObj.templateFuncs.forEach((value: ESTree.Identifier): void => {
    console.log("[dummy] deleting dummy templateFunc", value.name);
    cpp.functions.allTemplates().delete(value);
  });

  tempStack.pop();
  // console.log("----- DESTRYD TEMP STACK -----", __dummyModeGlevel())

  return {
    info: out,
    success,
    errorInfo: errInfo
  };
}

/** Maps buildInfo[] to a string array of its `.contents` 
 */
export function buildInfoToStr(bInfo: buildInfo[]): string[] {
  return bInfo.map((value: buildInfo): string => value.content);
}

/** Converts a string to a buildInfo
 *  Use loosly when type doesn't matter
 * @param type what type to mark it as. defualts to `AUTO`
 */
export function stringTobuildInfo(str: string, type: ctype = cpp.types.AUTO): buildInfo {
  return {
    content: str,
    info: { type }
  };
}

/**
 * fully walk a single node, not a collection of statements
 * @param dummyUnsafe walk in dummy mode !WARNING! never removes temporary dummy variables. 
 * Do NOT use this directly unless it is known that no variables/functions/etc will be created. Meant to be used by things like `walkBodyDymmy`
 */
export function walk(node: ESTree.Node, dummyUnsafe: boolean = false, useTypeList: TypeList_t = normalTypeLists): buildInfo[] {

  if (dummyUnsafe) {
    enterDummyMode_raw();
  }

  let build: buildInfo[] = [];

  let type = node.type;
  if (type in nodes) {
    build.push(nodes[node.type](node, build, useTypeList));
  }
  else {
    ASTerr_kill(node, `Unable to handle node "${type}"`);
  }

  if (dummyUnsafe) {
    exitDummyMode_raw();
  }

  return build;
}

/**
 * Use to make sure that the return of a `walk` only has one item
 * @param err shows this error if the result is not a single item
 * @param dummy !WARNING! see `dummyUnsafe` in `walk`
 */
export function walk_requireSingle(node: ESTree.Node, err: string = "Expected single value", dummy: boolean = false): buildInfo {
  let bInfo: buildInfo[] = walk(node, dummy);

  if (bInfo.length != 1) {
    ASTerr_kill(node, err);
  }

  return bInfo[0];
}

/**
 * walk a series of statement like those within the main file or the block statement of a fn
 * @param dummy !WARNING! see `dummyUnsafe` in `walk`
 * @param unsafe only to be used by walkBodyDummy. Forces no stack 
 * @returns 
 */
export function walkBody(body: ESTree.Statement[], { dummy = false, unsafe = false, useTypeList = normalTypeLists, beforeDelete = (obj: stackInfo) => { } } = {}): buildInfo[] {

  //let output: string[] = [];
  let output: buildInfo[] = [];

  if (!unsafe) {
    let lastObj: stackInfo = {
      funcs: [],
      vars: [],
      templateFuncs: [],
      returnStatements: []
    };

    tempStack.push(lastObj);
    nestLevel++;
  }

  for (const statement of body) {
    let info: buildInfo[] = walk(statement, dummy, useTypeList);

    let strinfo = info.map((v: buildInfo | undefined): string => {
      if (v == undefined) {
        err("[INTERNAL ERROR] Something didnt return a buildinfo");
      }
      return v.content;
    })

    output.push(...info);

    //output.push(...strinfo);
  }

  if (!unsafe) {
    beforeDelete(tempStack.at(-1)!);
    nestLevel--;
    tempStack.pop();
  }

  return output;
}

/**
 * Use for things like "if", "while", etc where there could be a block beneath or it could be a one-liner
 */
export function walkInlineOrBody(body: ESTree.Statement, { dummy = false, unsafe = false, useTypeList = normalTypeLists, beforeDelete = (obj: stackInfo) => { } } = {}): buildInfo[] {
  if (ESTree.isExpressionStatement(body)) {
      return walk(body.expression, dummy, useTypeList);
  }
  else if(ESTree.isBlockStatement(body)) {
    return walkBody(body.body, { dummy, unsafe, useTypeList, beforeDelete });
  }
  else
  {
    ASTerr_kill(body, `@todo [walkInlineOrBody] unable to handle statement of type ${body.type}`)
  }
}


// traverse(ast, {
//   VariableDeclaration(path: NodePath<ESTree.VariableDeclaration>) {
//     const node = path.node;
//     const kind = node.kind; // const, let, var

//     // Can be multiple declarators, like "let a, b";
//     node.declarations.forEach((dec: ESTree.VariableDeclarator): void => {
//       const value = dec.init;
//       const ident = dec.id;

//       if (ESTree.isIdentifier(ident)) {
//         const name = ident.name;
//         console.log('Variable name:', name);
//         ident.skip();
//       }
//       else
//       {
//         ASTerr(node, "Non-simple variable declaration (destructuring?) not implemented");
//       }

//       if (ESTree.isLiteral(dec.init)) {
//         console.log('Initial value:', dec.init.value);
//       } else if (dec.init) {
//         console.log('Init type:', dec.init.type);
//       }
//     })
//   },

//   Identifier(path: NodePath<ESTree.Identifier>) {
//     console.log("ID", path.node.name)
//   }
// });