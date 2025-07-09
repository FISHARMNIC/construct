#ifndef __FILES_H__
#define __FILES_H__

// #include <filesystem>

#define FNA_AST_GENERATOR "parse.ts"
#define FNA_JSON_OP       "AST.json"

#define FILE_GETDIR(relpath, fname) (__DIRNAME relpath fname)

// #define FILE2PATH(fname) ((std::filesystem::path)(std::filesystem::current_path() / fname))
// #define FILE2PATHSTR(path) (FILE2PATH(path).generic_string().c_str())
#endif // __FILES_H__