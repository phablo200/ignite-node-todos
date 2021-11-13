const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

const checksExistsUserAccount = (request, response, next) => {
  const { username } = request.headers;

  const user = users.find(item => item.username === username);

  if (!user) {
    return response.status(400).json({ error: 'User not found' });
  }

  request.user = user;
  return next();
};

const verifyExistsTodo = (request, response, next) => {
  const { todos } = request.user;
  const { id } = request.params;

  const existsTodo = todos.find(todo => todo.id === id);
  if (!existsTodo) {
    return response.status(404).json({
      error: 'Todo not found'
    });
  }

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const exists = users.find(item => item.username === username);

  if (exists) {
    return response.status(400).json({
      error: 'User already exists'
    });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);
  response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  request.user.todos.push(todo);

  response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, verifyExistsTodo, (request, response) => {

  const { title, deadline } = request.body;
  const { todos } = request.user;
  const { id } = request.params;

  const updatedTodos = todos.map(todo => {
    if (todo.id === id) {
      return {
        title,
        deadline: new Date(deadline),
        done: todo.done
      };
    }
    return todo;
  });


  request.user.todos = [...updatedTodos];
  response.status(200).send(request.user.todos[0]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, verifyExistsTodo, (request, response) => {
  const { title, deadline } = request.body;
  const { todos } = request.user;
  const { id } = request.params;

  const updatedTodos = todos.map(todo => {
    if (todo.id === id) {
      return {
        ...todo,
        done: true
      };
    }
    return todo;
  });


  request.user.todos = [...updatedTodos];
  response.status(200).send(request.user.todos[0]);
});

app.delete('/todos/:id', checksExistsUserAccount, verifyExistsTodo, (request, response) => {
  const { todos } = request.user;
  const { id } = request.params;

  const updatedTodos = todos.filter(todo => todo.id !== id);
  request.user.todos = [...updatedTodos];

  response.status(204).send();
});

module.exports = app;