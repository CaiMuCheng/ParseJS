import { visitorKeys } from "../ast/index.js";
import types from "../types/index.js";

function traverse(node, visitor, parent, parentPath, key, listKey) {
    if (!node || !visitorKeys[node.type]) return;
    const keys = visitorKeys[node.type]
    const path = new NodePath(node, visitor, parent, parentPath, key, listKey);
    visitor.enter && visitor.enter(path);

    if (node.__shouldSkip) {
        delete node.__shouldSkip;
        return;
    }

    for (key of keys) {
        const prop = node[key];
        if (Array.isArray(prop)) {
            prop.forEach((childNode, index) => {
                traverse(childNode, visitor, node, path, key, index);
            });
        } else {
            traverse(prop, visitor, node, path, key);
        }
    }

    visitor.exit && visitor.exit(path);
}

class NodePath {
    constructor(node, visitor, parent, parentPath, key, listKey) {
        this.node = node;
        this.visitor = visitor;
        this.parent = parent;
        this.parentPath = parentPath;
        this.key = key;
        this.listKey = listKey;
    }
    skip() {
        this.node.__shouldSkip = true;
    }
    remove() {
        if (this.listKey != undefined) {
            this.parent[this.key].splice(this.listKey, 1);
        } else {
            this.parent[this.key] = null;
        }
    }
    traverse(childKey, listKey) {
        if (typeof childKey == "object") {
            traverse(this.node, childKey, this.parent, this.parentPath, this.key, this.listKey);
            return;
        }
        const prop = this.node[childKey];
        if (Array.isArray(prop)) {
            if (listKey === undefined) {
                prop.forEach((childNode, index) => {
                    traverse(childNode, this.visitor, this.node, this, childKey, index);
                });
            } else {
                traverse(prop[listKey], this.visitor, this.node, this, childKey, listKey);
            }
        } else {
            traverse(prop, this.visitor, this.node, this, childKey);
        }
    }
    replaceWith(node) {
        if (this.listKey != undefined) {
            this.parent[this.key][this.listKey] = node;
        } else {
            this.parent[this.key] = node;
        }
    }
    replaceWithSource(source) {
        this.replaceWith(types.sourceCode(source));
    }
    findParent(callback) {
        let curPath = this.parentPath;
        while (curPath && !callback(curPath)) {
            curPath = curPath.parentPath;
        }
        return curPath;
    }
    find(callback) {
        let curPath = this;
        while (curPath && !callback(curPath)) {
            curPath = curPath.parentPath;
        }
        return curPath;
    }
    get scope() {
        // ??????????????????scope
        if (this.__scope) {
            return this.__scope;
        }
        // ???????????????block??????
        const isBlock = this.isBlock();
        // ???????????????????????????scope ????????????????????????get scope??? ?????????????????????
        const parentScope = this.parentPath && this.parentPath.scope;
        // ??????????????????????????????????????????????????????Scope
        return this.__scope = isBlock ? new Scope(parentScope, this) : parentScope;
    }
    isBlock() {
        return this.node.type == "BlockStatement" || this.node.type == "Program";
    }
}

class Binding {
    constructor(id, path, scope, kind) {
        this.id = id;
        this.path = path;
        this.referenced = false;
        this.referencePaths = [];
    }
}

class Scope {
    constructor(parentScope, path) {
        this.parent = parentScope; // ????????????
        this.bindings = {}; // ???????????????
        this.path = path; // ????????????????????????path

        path.traverse({
            enter: childPath => {
                const type = childPath.node.type;
                if (type == "VariableDeclarator") {
                    this.registerBinding(childPath.node.id.name, childPath);
                }
                if (type == "FunctionDeclaration") {
                    // ?????????????????????
                    childPath.skip();
                    // ???????????????????????????binding
                    const id = childPath.node.id.name;
                    this.registerBinding(id, childPath);
                }
                if (type == "Identifier") {
                    if (!childPath.findParent(p => p.node.type == "VariableDeclarator" || p.node.type == "FunctionDeclaration")) {
                        const id = childPath.node.name;
                        const binding = this.getBinding(id);
                        if (binding) {
                            binding.referenced = true;
                            binding.referencePaths.push(childPath);
                        }
                    }
                }
            }
        });
        this.tempBindings = {};
    }

    registerBinding(id, path) {
        this.bindings[id] = new Binding(id, path);
    }

    getOwnBinding(id) {
        return this.bindings[id];
    }

    getBinding(id) {
        // ?????????????????????????????????????????????
        let res = this.getOwnBinding(id);
        // ????????????????????????????????????
        if (res === undefined && this.parent) {
            res = this.parent.getBinding(id);
        }
        return res;
    }

    hasBinding(id) {
        return !!this.getBinding(id);
    }
}

export
    default traverse;