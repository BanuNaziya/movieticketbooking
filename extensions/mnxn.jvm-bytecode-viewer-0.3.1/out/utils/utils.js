"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function getCurrentFile(fileUri) {
    return __awaiter(this, void 0, void 0, function* () {
        if (fileUri !== undefined && fileUri !== null)
            return fileUri;
        const editor = vscode.window.activeTextEditor;
        if (editor !== undefined && editor !== null)
            return editor.document.uri;
        throw "no .class file provided.";
    });
}
exports.getCurrentFile = getCurrentFile;
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
//# sourceMappingURL=utils.js.map