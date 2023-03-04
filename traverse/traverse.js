import {
    visitorKeys
}
from "../ast/ast.js";
import types from "../types/types.js";

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
}

export
default traverse;