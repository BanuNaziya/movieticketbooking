"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uriJoin = exports.pathJoin = exports.zipEntries = exports.isInJar = exports.jarPath = exports.bytecodeFile = exports.classFile = exports.output = void 0;
const vscode = require("vscode");
const path = require("path");
exports.output = vscode.window.createOutputChannel("JVM Bytecode Viewer");
function classFile(bytecodeFile) {
    return bytecodeFile.replace(/\.bytecode(\.verbose)?$/, ".class");
}
exports.classFile = classFile;
function bytecodeFile(classFile, { verbose = false } = {}) {
    return verbose === true
        ? classFile.replace(/\.class$/, ".bytecode.verbose")
        : classFile.replace(/\.class$/, ".bytecode");
}
exports.bytecodeFile = bytecodeFile;
function jarPath(filePath) {
    return "jar:file:" + filePath.replace(/\\/g, "/");
}
exports.jarPath = jarPath;
function isInJar(filePath) {
    return filePath.includes("jar!");
}
exports.isInJar = isInJar;
function zipEntries(zip) {
    return zip
        .getEntries()
        .map((e) => e.entryName)
        .sort((l, r) => l.localeCompare(r));
}
exports.zipEntries = zipEntries;
function pathJoin(...paths) {
    return path.posix.join(...paths.map((p) => {
        if (p instanceof vscode.Uri)
            return p.path;
        else
            return p;
    }));
}
exports.pathJoin = pathJoin;
function uriJoin(...paths) {
    return vscode.Uri.parse(pathJoin(...paths));
}
exports.uriJoin = uriJoin;
//# sourceMappingURL=utils.js.map