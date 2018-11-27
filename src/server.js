require('./environment/environment');
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const validator = require("express-validator");
const path = require("path");
const socket = require("socket.io");
const { Chats } = require("./model/chats.model")

const {
    auth
} = require("./route/authentication.route");
const {
    users
} = require("./route/users.route");
const {
    traceing
} = require("./route/trace.route");
const {
    lastSeenCheck
} = require("./utility/cron");
var fs = require('fs')
var https = require('https')
const port = process.env.PORT

var app = express();

app.use(bodyParser.json())
app.use(cors())
app.use(validator())

lastSeenCheck();
app.use(express.static(path.join(__dirname, '/public')))


app.use('/', traceing, auth, users)

let server = app.listen(port, () => {
    console.log(`Server started at ${port}`);
})
// let server=https.createServer({
//     key: fs.readFileSync('server.key'),
//     cert: fs.readFileSync('server.cert')
//   }, app).listen(port, () => {
//     console.log(`Server started at ${port}`);
// })

let io = socket(server)
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('join', data => {
        socket.join(data.room);
        Chats.find({}).then(rooms => {
            count = 0;
            rooms.forEach((room) => {
                if (room.room == data.room) {
                    count++;
                }
            });
            // Create the chatRoom if not already created
            if (count == 0) {
                let chats = new Chats({ username: data.username, room: data.room, messages: [] })
                chats.save().then(res => {
                    console.log(res)
                });
            }
        })
    });

    socket.on('new-message', data => {
        io.in(data.room).emit('new-message', data);
        Chats.findOneAndUpdate({ room: data.room }, { $push: { messages: { timestamp: data.timestamp, message: data.message } } }, { new: true })
            .then(res => {
                console.log(res);
                if (!res) {
                    return false;
                }
            }).catch(err => {
                console.log(err)
            });
    })
    socket.on('typing', data => {
        data['isTyping'] = true
        socket.broadcast.in(data.room).emit('typing', data);
    })
})