export function initTerminal() {
    const terminalBody = document.querySelector('.terminal-body');
    const promptUser = "user@leonos:~$";
    let currentDir = ["~"];

    const fs = {
        "~": {
            type: "dir",
            children: {
                dossier1: {
                    type: "dir",
                    children: {}
                },
                dossier2: {
                    type: "dir",
                    children: {
                        "secret.txt": {
                            type: "file",
                            content: "Unir lbh gevqr frnepuvat sbe 424rire va YrbaBF?"
                        }
                    }
                },
                "README.md": {
                    type: "file",
                    content: "An old rotating code reveals the truth to those who turn it the right way..."
                }
            }
        }
    };

    function getDirNode(pathArr) {
        let node = fs["~"];
        for (let i = 1; i < pathArr.length; i++) {
            if (node.type !== "dir" || !node.children[pathArr[i]]) return null;
            node = node.children[pathArr[i]];
        }
        return node;
    }

    // List of supported commands
    const commands = {
        cls: cls_command,
        clear: cls_command,

        cd: cd_command,

        ls: ls_command,
        dir: ls_command,

        cat: cat_command,
        
        exit: exit_command,
        quit: exit_command
    };

    // CLS
    function cls_command() {
        terminalBody.innerHTML = '';
    }

    // CD
    function cd_command(args) {
        if (!args) return printLine("Usage: cd <dossier>");
        if (args === "~") {
            currentDir = ["~"];
            return;
        }
        if (args === "..") {
            if (currentDir.length > 1) currentDir.pop();
            return;
        }
        const target = args.split("/").filter(Boolean);
        let newPath = [...currentDir, ...target];
        let node = getDirNode(newPath);
        if (node && node.type === "dir") {
            currentDir = newPath;
        } else {
            printLine(`cd: ${args}: No folder with this name`);
        }
    }

    // LS
    function ls_command() {
        const node = getDirNode(currentDir);
        if (!node || node.type !== "dir") {
            printLine("Error: Missing folder");
            return;
        }
        const list = Object.entries(node.children)
            .map(([name, obj]) => obj.type === "dir" ? name + "/" : name)
            .join("  ");
        printLine(list || "(empty)");
    }

    // CAT
    function cat_command(args) {
        if (!args) return printLine("Usage: cat <fichier>");
        const path = args.split("/").filter(Boolean);
        let node = getDirNode(currentDir);

        for (let i = 0; i < path.length - 1; i++) {
            if (node && node.type === "dir" && node.children[path[i]]) {
                node = node.children[path[i]];
            } else {
                printLine(`cat: ${args}: Aucun fichier ou dossier de ce nom`);
                return;
            }
        }

        const fileName = path[path.length - 1];
        if (node && node.type === "dir" && node.children[fileName] && node.children[fileName].type === "file") {
            printLine(node.children[fileName].content || "");
        } else {
            printLine(`cat: ${args}: Aucun fichier de ce nom`);
        }
    }

    // EXIT
    function exit_command() {
        closeWindow('terminal');
    }

    // Display a line in the terminal
    function printLine(text = "") {
        const line = document.createElement('div');
        line.className = "terminal-line";
        line.textContent = text;
        terminalBody.appendChild(line);
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    // New line after the prompt
    function newPrompt() {
        const line = document.createElement('div');
        line.className = "terminal-line";
        const prompt = document.createElement('span');
        prompt.className = "terminal-prompt";
        prompt.textContent = promptUser.replace("~", currentDir.join("/").replace(/^~\/?/, "~"));

        const input = document.createElement('input');
        input.className = "terminal-input";
        input.type = "text";
        input.autofocus = true;
        input.spellcheck = false;

        const cursor = document.createElement('span');
        cursor.className = "terminal-cursor";

        line.appendChild(prompt);
        line.appendChild(input);
        line.appendChild(cursor);
        terminalBody.appendChild(line);
        input.focus();

        // handle the command validation
        input.addEventListener('keydown', function(e) {
            if (e.key === "Enter") {
                const value = input.value.trim();
                line.removeChild(input);
                cursor.remove();
                line.textContent = prompt.textContent + " " + value;

                handleCommand(value);
                setTimeout(newPrompt, 50);
            }
        });
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    // Handle the command
    function handleCommand(input) {
        if (!input) return;
        const [cmd, ...argsArr] = input.split(" ");
        const args = argsArr.join(" ");
        if (commands[cmd]) {
            commands[cmd](args);
        } else {
            printLine(`'${cmd}' is not recognized as an internal or external command, an executable program or a command file.`);
        }
        printLine();
    }

    // Initialisation
    terminalBody.innerHTML = '';
    printLine("Welcome on LéonOS Terminal !");
    newPrompt();
}