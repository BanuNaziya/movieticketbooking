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
exports.activate = void 0;
const vscode = require("vscode");
const fs = require("fs");
const JavapContentProvider_1 = require("./JavapContentProvider");
const JarTreeDataProvider_1 = require("./JarTreeDataProvider");
const utils = require("./utils");
function activate(context) {
    utils.output.appendLine("Activated.");
    const javapProvider = new JavapContentProvider_1.default();
    const jarProvider = new JarTreeDataProvider_1.JarTreeDataProvider();
    context.subscriptions.push(utils.output, vscode.workspace.registerTextDocumentContentProvider("javap", javapProvider), vscode.commands.registerCommand("jvm-bytecode-viewer.show-bytecode", (fileUri) => __awaiter(this, void 0, void 0, function* () {
        yield showBytecode(fileUri);
    })), vscode.commands.registerCommand("jvm-bytecode-viewer.show-bytecode-verbose", (fileUri) => __awaiter(this, void 0, void 0, function* () {
        yield showBytecode(fileUri, { verbose: true });
    })), vscode.window.registerTreeDataProvider("jarExplorer", jarProvider), vscode.workspace.registerTextDocumentContentProvider("jar-file", jarProvider), vscode.commands.registerCommand("jvm-bytecode-viewer.explore-jar-file", (uri) => {
        if (uri instanceof vscode.Uri) {
            jarProvider.openJar(uri);
        }
        else if (vscode.window.activeTextEditor) {
            jarProvider.openJar(vscode.window.activeTextEditor.document.uri);
        }
        else {
            throw new Error("no jar file provided");
        }
    }), vscode.commands.registerCommand("jvm-bytecode-viewer.close-jar-file", (jar) => {
        jarProvider.closeJar(jar.jarUri);
    }));
    function showBytecode(arg, { verbose = false } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            let currentFilePath;
            if (arg instanceof JarTreeDataProvider_1.JarNode && arg.command) {
                currentFilePath = arg.resourceUri.path;
            }
            else if (arg instanceof vscode.Uri) {
                currentFilePath = arg.fsPath;
            }
            else if (vscode.window.activeTextEditor) {
                currentFilePath = vscode.window.activeTextEditor.document.uri.fsPath;
            }
            else {
                throw new Error("no bytecode file provided");
            }
            const currentClassFile = utils.classFile(currentFilePath);
            const bytecodePath = utils.bytecodeFile(currentClassFile, { verbose });
            const bytecodeUri = vscode.Uri.file(bytecodePath).with({ scheme: "javap" });
            yield vscode.window.showTextDocument(bytecodeUri);
            if (!utils.isInJar(currentFilePath)) {
                const fsWatcher = fs.watch(currentClassFile, () => {
                    utils.output.appendLine(`Updated: ${bytecodePath}`);
                    javapProvider.onDidChangeEmitter.fire(bytecodeUri);
                });
                context.subscriptions.push({ dispose: () => fsWatcher.close() });
            }
        });
    }
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map