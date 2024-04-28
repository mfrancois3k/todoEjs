const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const todoSchema = new Schema({
    text: {
        type: String,
        required: true // Ensure the 'text' field is required and of type String
    }
});



const Todo = mongoose.model('Todo', todoSchema);
module.exports = Todo;


// const itemTodo1 = new Todo( { name: 'Your are' } );
// const itemTodo2 = new Todo( { name: 'Entering the' } );
// const itemTodo3 = new Todo( { name: 'Matrix' } );

// const groupTodo = [itemTodo1, itemTodo2, itemTodo3];

// Todo.insertMany(groupTodo)
//     .then(() => {
//         console.log('Successfully saved todos!');
//     })
//     .catch(err => {
//         console.error('Error saving todos:', err);
//     });


