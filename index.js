const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Todo = require('./models/todo');

const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static("public")); 
app.use('/css', express.static (__dirname + '/css'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const dburl = "mongodb://127.0.0.1:27017/tododb"
const options = {
  
    serverSelectionTimeoutMS: 5000, // econds timeout for server selection
    socketTimeoutMS: 45000 // 45 seconds timeout for socket connection
};

mongoose.connect(dburl, options)
    .then(() => {
        console.log('MongoDB connected successfully');

        // Seed initial todos if the collection is empty
        return Todo.find();
    })
    .then(todos => {
        if (todos.length === 0) {
            const groupTodo = [
                { text: 'You are' },
                { text: 'Entering the' },
                { text: 'Matrix' }
            ];
            return Todo.insertMany(groupTodo);
        }
    })
    .then(() => {
        console.log('Initial todos seeded successfully');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

    let lastDeletedTodo = null; // Initialize lastDeletedTodo variable

    app.get('/', async (req, res) => {
        try {
            const todos = await Todo.find({});
            res.render('index', { newListItem: todos, lastDeletedTodo: lastDeletedTodo }); // Pass lastDeletedTodo to the template
        } catch (err) {
            console.error('Error fetching todos:', err);
            res.status(500).send('Error fetching todos');
        }
    });
    
app.post('/', async (req, res) => {
    const task = req.body.todoValue;
    if (task) {
        const todo = new Todo({ text: task });
        try {
            await todo.save();
            console.log('Todo saved successfully');
        } catch (err) {
            console.error('Error saving todo:', err);
            res.status(500).send('Error saving todo');
        }
    }
    res.redirect('/');
});

app.post('/delete', async (req, res) => {
    const todoId = req.body.checkbox; // Retrieve the _id of the todo item to be deleted

    try {
        // Use Mongoose to find and delete the todo item by its _id
        const deletedTodo = await Todo.findOneAndDelete({ _id: todoId });
        if (!deletedTodo) {
            console.log('Todo not found');
            res.status(404).send('Todo not found');
            return;
        }
        console.log('Todo deleted successfully');
        res.redirect('/'); // Redirect back to the homepage after deletion
    } catch (err) {
        console.error('Error deleting todo:', err);
        res.status(500).send('Error deleting todo');
    }
});

app.post('/deleteAll', async (req, res) => {
    try {
        // Use Mongoose to delete all todos
        await Todo.deleteMany({});
        console.log('All todos deleted successfully');
        res.redirect('/'); // Redirect back to the homepage after deletion
    } catch (err) {
        console.error('Error deleting all todos:', err);
        res.status(500).send('Error deleting all todos');
    }
});

// Route handler for undoing the last deletion
app.post('/undoDelete', async (req, res) => {
    try {
        if (lastDeletedTodo) {
            // Restore the last deleted todo item back to the database
            const restoredTodo = new Todo(lastDeletedTodo); // Create a new instance of the Todo model
            await restoredTodo.save();
            console.log('Todo restored successfully:', restoredTodo);
            lastDeletedTodo = null; // Reset lastDeletedTodo after restoration
        }
        res.redirect('/'); // Redirect back to the homepage after undo
    } catch (err) {
        console.error('Error undoing deletion:', err);
        res.status(500).send('Error undoing deletion');
    }
});

// Update a todo item
app.put('/update/:id', async (req, res) => {
    const todoId = req.params.id;
    const newText = req.body.updatedText;

    try {
        const updatedTodo = await Todo.findByIdAndUpdate(todoId, { text: newText }, { new: true });

        if (!updatedTodo) {
            return res.status(404).send('Todo not found');
        }

        console.log('Todo updated successfully:', updatedTodo);
        res.redirect('/');
    } catch (err) {
        console.error('Error updating todo:', err);
        res.status(500).send('Error updating todo');
    }
});

app.listen(port, () => {
    console.log('Example app listening on port ' + port);
});

//   todoArr.push(task);
// const todo = new Todo({
    //     text: req.body.todoValue
    // });

    // todo.save()
    // .then(result => {
    //     res.redirect('/');
    // })
    // .catch(err => {
    //     console.error('Error saving todo:', err);
    //     res.status(500).send('Error saving todo');
    // });