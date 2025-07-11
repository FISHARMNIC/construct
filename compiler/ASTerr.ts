import * as ESTree from '@babel/types';

export default function(node: ESTree.Node, ...args: any[]): never
{
    console.error(`[ERROR] on {${node.loc!.start.line}} : `, ...args);
    throw new Error();
}

export function err(...args: any[]): never
{
    console.error(`[ERROR] on {?} : `, ...args);
    throw new Error();
}