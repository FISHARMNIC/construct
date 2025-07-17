import * as ESTree from '@babel/types';
import { dummyMode, tempStack } from './cpp';
import { err } from './ASTerr';

// safe version of Map::set
Map.prototype.add = function <K extends ESTree.Identifier, V>(key: K, to: string, value: V): void {
    //if (!dummyMode) {

    if (this.has(key)) {
        err(`[INTERNAL] map already contains ${value}`);
    }
    else {
        this.set(key, value);

        if (dummyMode) {

            let last = tempStack.at(-1);

            if (last != undefined) {
                last[to].push(key);
                console.log("ijoj")
            }
            else {
                err('[INTERNAL] no tempstack exists');
            }
        }

    }
    //}
}

Array.prototype.pushFront = function <T>(value: T) {
    this.splice(0, 0, value);
}