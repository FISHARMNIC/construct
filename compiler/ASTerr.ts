import * as ESTree from '@babel/types';
import { setDummyMode } from './cpp';

/*
Use kill when when there is a critical error, like a parser error
Use throw when something couldn't be evaluated because of missing context, but its not a fatal error
    -> example: unknown identifier
    -> so walkBodyDummy can catch it and try to re evaluate something later
*/

export function ASTerr_throw(node: ESTree.Node, ...args: any[]): never
{
    console.error(`[ERROR] on {${node.loc!.start.line}} : `, ...args);
    setDummyMode(false); // for catches
    throw new Error();
    //process.exit(1);
}

export function ASTwarn(node: ESTree.Node, ...args: any[]): void
{
    console.warn(`[WARNING] on {${node.loc!.start.line}} : `, ...args);
}

export function ASTerr_kill(node: ESTree.Node, ...args: any[]): never
{
    console.error(`[ERROR] on {${node.loc!.start.line}} : `, ...args);
    process.exit(1);
}

// General error, kills the program
export function err(...args: any[]): never
{
    console.error(`[ERROR] on {?} : `, ...args);
    throw new Error();
}