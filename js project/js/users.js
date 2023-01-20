const form = document.querySelector('#form');
const todoContainer = document.querySelector("#todo-container")

let date = new Date();
let time = date.getTime();
let counter = time;
let todos = [];




auth.onAuthStateChanged(user => {
    if (user) {
        console.log('user is signed in at users.html');
    } else {
        alert('your login session has expired or you have logged out, login again to continue');
        location = "login.html"
    }
})

function logout() {
    auth.signOut();
    localStorage.removeItem('todos');
}

function saveDate(doc) {
    let todo = {
        id: doc.id,
        text: doc.data().text,
        completed: doc.data().completed
    }
    todos.push(todo)
} 

function renderData(id) {
    let todoObj = todos.find(todo => todo.id === id)

    let parentDiv = document.createElement("li");
    parentDiv.setAttribute('id', todoObj.id)

    let todoDiv = document.createElement("p");
    todoDiv.textContent = todoObj.text.length <= 20
        ? todoObj.text
        : todoObj.slice(0, 20)

    todoObj.completed ? todoDiv.classList.add('completed') : todoDiv

    let trashButton = document.createElement("button");
    trashButton.className = "far fa-trash-alt";
    trashButton.classList.add("delete");
    trashButton.classList.add("button");
    trashButton.classList.add("hover_button");

    let completedButton = document.createElement("button");
    completedButton.className = "fa solid fa-check";
    completedButton.classList.add("finish");
    completedButton.classList.add("button");
    completedButton.classList.add("hover_button");


    let buttonDiv = document.createElement("div");
    buttonDiv.className = "button_div";
    buttonDiv.appendChild(trashButton);
    buttonDiv.appendChild(completedButton);

    parentDiv.appendChild(todoDiv);
    parentDiv.appendChild(buttonDiv);
    todoContainer.appendChild(parentDiv)

    trashButton.addEventListener('click', e => {
        let id = e.target.parentElement.parentElement.getAttribute('id');
        auth.onAuthStateChanged(user => {
            if (user) 
            db.collection(user.uid).doc(id).delete()
        })
    })

    trashButton.addEventListener('click', e => {
        let id = e.target.parentElement.parentElement.getAttribute('id');
        
        auth.onAuthStateChanged(user => {
            let item = db.collection(`${user.uid}`).doc(id)
            item.get().then(doc => {
                item.update({completed: !doc.data().completed})
                todoDiv.classList.toggle('completed')
                todos.map(todo => todo.id === doc.id ? todo.completed = !todo.completed : todo)
            })
        })
    })
}

form.addEventListener('submit', e => {
    e.preventDefault();
    const text = form['todos'].value;
    let id = counter += 1;
    form.reset();

    auth.onAuthStateChanged(user => { // реагирует на изменения в бд
        if (user) {
            db.collection(user.uid).doc("_" + id).set({
                id: '_' + id,
                text,
                completed: false
            }).then(() => {
                console.log('todo added');
            }).catch(err => {
                console.log(err.message);
            })
        }
    })
})

function filterHandler(status) {
    if (status === "completed") {
        todos = JSON.parse(localStorage.getItem('todos')).filter(todo => todo.completed)
    }
    else if (status === 'open')
        todos = JSON.parse(localStorage.getItem('todos')).filter(todo => !todo.comleted)
    else
    todos = JSON.parse(local.getItem('todos'))

    todoContainer.innerHTML = '';
    todos.forEach(todo => renderData(todo.id))
}

auth.onAuthStateChanged(user => { // реагирует на изменения в бд
    if (user) {
        db.collection(user.uid).onSnapshot((snapshot) =>{ // получаем свежие данные бд
            let changes = snapshot.docChanges(); // получаем статус изменения
            changes.forEach(change => {
                if (change.type === "added") {
                    console.log('true')
                    saveDate(change.doc); //сохраняем изменение в todos
                    renderData(change.doc.id) //находит ранее добавленный объект по id
                }
                else if (change.type === "removed") {
                    let li = todoContainer.querySelector(`#${change.doc.id}`);
                    todoContainer.removeChild(li);
                    todos = todos.filter((todo) => todo.id !== change.doc.id);
                }
            });
            localStorage.setItem('todos', JSON.stringify(todos))
        })
    }
})

