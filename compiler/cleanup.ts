import { err } from "./ASTerr";

type cleanupFn = Function | null;

export let cleanup: {
    funcs: cleanupFn,
    cpp: cleanupFn,
    main: cleanupFn
} = {
    funcs: null,
    cpp: null,
    main: null
};

export function cleanAll()
{
    Object.entries(cleanup).forEach((cleaner: [string, cleanupFn]): void => {
        const [name, fn] = cleaner;

        if(fn == null)
        {
            err(`[INTERNAL] "${name}" has no cleanup function`);
        }
        else
        {
            fn();
        }
    })
}