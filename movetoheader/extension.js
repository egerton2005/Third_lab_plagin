const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

// Сhecks for the presence of a substring in a file
async function getSubIn(filePath, subStr) {
    try {
        // Open document
        const document = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
        
        // Get text file
        const text = document.getText();

        // Check content in 'text' of 'subStr'
        if(text.includes(subStr)){
            return true;
        }
        else{
            return false;
        }
    } catch (error) {
        console.error(`Error reading file: ${error.message}`);
    }
}


function activate(context) {
    // Register of command
    let disposable = vscode.commands.registerCommand('extension.moveTextToHeader', async function () {
        // Get active editor
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        // Get selection text
        const selection = editor.selection;
        let text = editor.document.getText(selection);
        if(text[0] != '/' && text[0] != '#')
            text += ';';
        
        // Find string for checking location
        let i = 0; 
        let j = text.length - 1; 
        let flag = false;
        while(true){
            if(text[i] == '\n' || text[i] == ' ' || text[i] == '\t'){
                i++;
            }
            else{
                flag = true;
            }
            if(text[j] == '\n' || text[j] == ' ' || text[j] == '\t'){
                j--;
                flag = false;
            }
            else if(flag){
                break;
            }
        }
        const textCheckRepeat = text.slice(i, j);

        // Get current docs
        const document = editor.document;
        const filePath = document.fileName;

        const fileName = path.basename(filePath);

        i = 0;
        while(i < fileName.length){
            if(fileName[i] == '.'){
                i++;
                break;
            }
            i++;
        }
        const fileNameWithoutType = fileName.slice(0, i);

        // defind path of file header
        const headerFilePath = path.join(filePath.slice(0, filePath.length - fileName.length) || '',
                                                    fileNameWithoutType + 'h');
        
        if (!fs.existsSync(headerFilePath)) {
            vscode.window.showErrorMessage('The file does not have a Header');
            return;
        }

        const prom = await getSubIn(headerFilePath, textCheckRepeat);
        if(prom){
            vscode.window.showInformationMessage('The selected line occurs in the file', 'Wright down'
                ).then( selection => {
                    if(selection == 'Wright down'){
                        fs.appendFile(headerFilePath, text + '\n', (err) => {
                            if (err) {
                                vscode.window.showErrorMessage('Failed to write to header file: ' + err.message);
                            } 
                            else {
                                // Reporting successful text movement.
                                vscode.window.showInformationMessage('Text moved to ', fileNameWithoutType + 'h');
                            }
                        });
                    }
                });
        }
        else{        
            // Add the selected text to the header file
            fs.appendFile(headerFilePath, text + '\n', (err) => {
                if (err) {
                    vscode.window.showErrorMessage('Failed to write to header file: ' + err.message);
                } 
                else {
                    vscode.window.showInformationMessage('Text moved to ', fileNameWithoutType + 'h');
                }
            });
        }

    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
