const tabooCommands =
    [
        "start",
        "tree",
    ];
const history = [];
let hisPos = 1;
const output = document.getElementById("output");
const input = document.getElementById("input");

const connect = function () {
    console.log("Connected");

    let source = new EventSource('/register')

    // Reconnect if the connection fails
    source.addEventListener('error', function (e) {
        console.log('Disconnected.');
        console.log(e.currentTarget.readyState)

        if (e.currentTarget.readyState === EventSource.CLOSED) {
            console.log("Connecting after error")
            connect();
        }
    }, false);

    source.addEventListener('message', function (e) {
        output.innerText += '\n' + e.data;
        window.scrollTo(0, output.scrollHeight)
    }, false);
};

input.addEventListener('keyup', ({key}) => {
    if (key === "Enter") {
        let i = input.value;
        history.push(i);
        output.innerText += '\n> ' + i;
        if (i === 'clear' || i === 'clr' || i === 'cls') {
            output.innerText = '';
        } else if (i === 'connect()') {
            connect()
        } else if (listContains(tabooCommands, i)) {
            output.innerText += '\npls no';
        } else {
            // todo localhost = r.pi on port 80
            fetch('http://localhost:80/ccommand?' + new URLSearchParams({
                command: i,
            }))
                .then(response => response.text())
                .then(text => {
                    console.log(text);
                })
        }
        input.value = '';
        return true;
    } else if (key === 'ArrowUp') {
        let t = history[history.length - hisPos++];
        input.value = t === null || t === undefined ? '' : t;
    } else if (key === 'ArrowDown') {
        let t = history[--hisPos];
        input.value = t === null || t === undefined ? '' : t;
    }
    if (hisPos <= 0) hisPos = 1;
    if (hisPos > history.length) hisPos = history.length;
});

function listContains(list, text) {
    for (let t of list) {
        if (t === text.split(' ')[0]) {
            return true;
        }
    }
    return false;
}

connect();
