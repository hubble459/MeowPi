let table;

function openTab(element, tabName) {
    let i, tabContent, tabLinks;

    // Get all elements with class="tab-content" and hide them
    tabContent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }

    // Get all elements with class="tab-links" and remove the class "active"
    tabLinks = document.getElementsByClassName("tab-links");
    for (i = 0; i < tabLinks.length; i++) {
        tabLinks[i].className = tabLinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    element.className += " active";

    switch (tabName) {
        case 'services':
            loadServices();
            break;
    }
}

function gotoTab(index) {
    document.getElementsByClassName("tab-links").item(index).click();
}

function clickService(service) {
    isWindows((yes) => {
        let stopCommand;
        let startCommand;
        if (yes) {
            stopCommand = "taskkill /f /pid " + service.pid;
            startCommand = "net start " + service.id;
        } else {
            let pass = prompt("Sudo password");
            let sudo = "echo " + pass + " | sudo -S";
            stopCommand = sudo + " service " + service.name + " stop";
            startCommand = sudo + " service " + service.name + " start";
        }
        if (service.state === 'Running') {
            let confirmed = confirm("Are you sure you want to stop " + service.name + '?');
            if (confirmed) {
                fetch("http://localhost:80/command?command=" + stopCommand)
                    .then(response => response.text())
                    .then(text => {
                        if (text === 'true') {
                            alert("Service [" + service.name + "] stopped")
                        } else {
                            alert("Failed to stop service")
                        }
                        console.log(text);
                    });
            }
        } else {
            let confirmed = confirm("Are you sure you want to start " + service.name + '?');
            if (confirmed) {
                fetch("http://localhost:80/command?command=" + startCommand)
                    .then(response => response.text())
                    .then(text => {
                        if (text === 'true') {
                            alert("Service [" + service.name + "] started")
                            table.innerHTML = '';
                            loadServices();
                        } else {
                            alert("Failed to start service")
                        }
                    });
            }
        }
    });
}

function isWindows(fun) {
    fetch("http://localhost:80/isWindows")
        .then(response => response.text())
        .then(text => {
            fun(text === 'true');
        });
}

function loadServices(force) {
    if (table === undefined) {
        table = document.getElementsByClassName("table").item(0);
    }

    if (table.innerHTML.length <= 5
        || force !== undefined && force instanceof Boolean && force) {
        table.innerHTML = '';
    }
    if (table.innerHTML.length === 0) {
        table.innerHTML += '<tr>\n' +
            '            <th>Name</th>\n' +
            '            <th>State</th>\n' +
            '            <th>PID</th>\n' +
            '            <th></th>\n' +
            '            <th></th>\n' +
            '        </tr>'
        // todo localhost = r.pi on port 80
        fetch('http://localhost:80/services')
            .then(data => data.json())
            .then(services => {
                let i = 0;
                for (let service of services) {
                    let tr = document.createElement("tr");

                    if (i++ % 2 === 0) {
                        tr.style.backgroundColor = "#69696969"
                    }

                    let td1 = document.createElement("td");
                    let td2 = document.createElement("td");
                    let td3 = document.createElement("td");
                    let td4 = document.createElement("td");
                    let td5 = document.createElement("td");

                    td1.innerText = service.name;
                    td1.style.color = 'lightseagreen'
                    td2.innerText = service.state;
                    if(service.state === 'Running') {
                        td2.style.color = 'steelblue';
                    } else {
                        td2.style.color = 'maroon';
                    }
                    td3.innerText = service.pid;

                    let inputEl = document.createElement("input");
                    inputEl.className = 'btn';
                    inputEl.type = 'button';
                    inputEl.value = service.state === 'Running' ? 'Stop' : 'Start'
                    inputEl.addEventListener("click", function () {
                        clickService(service);
                    })

                    td4.appendChild(inputEl);
                    td5.innerHTML = '<input class="btn" type=\'button\' value=\'Restart\'/>';

                    tr.appendChild(td1);
                    tr.appendChild(td2);
                    tr.appendChild(td3);
                    tr.appendChild(td4);
                    tr.appendChild(td5);

                    table.appendChild(tr);
                }
            });
    }
}
