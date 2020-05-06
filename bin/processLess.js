const { parse } = require('gonzales-pe');
const fs = require('fs');
const chalk = require('chalk');

function replaceAtomHost(content) {
    if (content.includes('atom://file-icons/')) {
        content = content.replace('atom://file-icons/', '@{ICON_PATH}/');
    }

    return content;
}

function replaceUrlHost(ast) {
    ast.traverseByType('uri', (node) => {
        node.traverse(item => {
            if (item.is('string')) {
                item.content = replaceAtomHost(item.content)
            }
        });
    });

    return ast;
}

function replaceDeclaration(ast) {
    ast.traverseByType('declaration', (decl) => {
        let isVariable = false;

        decl.traverse((item) => {
            if (item.type === 'property') {
                item.traverse((childNode) => {
                    if (childNode.content === 'custom-font-path') {
                        isVariable = true;
                    }
                });
            }

            if (isVariable) {
                if (item.type === 'value') {
                    const node = item.content[0];

                    node.content = replaceAtomHost(node.content)
                }
            }
            return item;
        });
    });

    return ast;
}

function processFonts(lessFile) {
    const content = fs.readFileSync(lessFile).toString();

    if (content && content.length > 0) {

        let astTree;

        try {
            astTree = parse(content, {
                syntax: 'less'
            })
        } catch (e) {
            console.log(chalk.red(`parse error: ${e}`));
            return;
        }

        try {
            astTree = replaceUrlHost(astTree);
            astTree = replaceDeclaration(astTree);

            return astTree;
        } catch (e) {
            console.log(chalk.red(`transform error: ${e}`));
        }
    }
}

module.exports = function (file) {
    const ast = processFonts(file);

    if (ast) {
        fs.writeFileSync(file, ast.toString());
    }
}
