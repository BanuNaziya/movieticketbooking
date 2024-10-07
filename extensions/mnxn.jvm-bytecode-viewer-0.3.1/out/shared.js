"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
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
//# sourceMappingURL=shared.js.map