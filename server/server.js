//Initiallising node modules
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

// A class to hold all the data for users and make some methods to do certain things to their data
class User {
   constructor(id) {
      this.id = id;
      this.nickname = '';
      this.channels = [];
   }

   leaveChannel(chan) {
      let channelIndex = this.channels.indexOf(chan);
      channelIndex != -1 ? this.channels.splice(channelIndex, 1) : null;
   }
}

// A class to hold all data for a channel
class Channel {
   constructor(name) {
      this.channelName = name;
      this.users = {};
   }

   removeUser(userID) {
      delete this.users[userID]
   }
}

const deleteChannel = (channels, channel) => delete channels[channel.channelName];

const users = {}; // All users that join the server
const channels = {} // All channels currently in use

io.on('connection', function(socket){
   mongoose.connect('mongodb://localhost/FirstDatabase', {useNewUrlParser: true});
   mongoose.connection.once('open', function() {
      console.log('Mongoose has connected properly');
   }).on('error', function(err){
      console.log('Connection error', err);
   })
   users[socket.id] = new User(socket.id);
   socket.on('disconnect', function(){
      // Handles updating list of nicknames when a client closes connection
      let listOfNames = [];
      // For every channel a user is in, remove that user from the channel, 
      // let the channel know the user left the channel, update channel list, 
      // and check if no user is in a channel(if so, delete it)
      users[socket.id].channels.forEach(channel => {
         channels[channel].removeUser(socket.id);
         io.in(channel).emit('updatechat', 'SERVER: '+ '', users[socket.id].nickname + ' has left #'+ channel, '', channel);
         for (let val in channels[channel].users) {
            listOfNames.push(channels[channel].users[val]);
         }
         if (Object.keys(channels[channel].users).length === 0) deleteChannel(channels, channels[channel]);
      })
      io.emit('activeUserList', listOfNames);
      delete users[socket.id];
   });
   // Check if a nickname is in use or any other possible problems with it
   socket.on('nickNameTest', function(nickname) {
      for (let userID in users) {
         if (users[userID].nickname.toLowerCase() === nickname.toLowerCase()) {
            socket.emit('nickNameValidation', 'Sorry that nickname is taken! Please choose another');
            return;
         } else if (nickname == 'chuck') {
            socket.emit('nickNameValidation', 'Sorry that\'s a really fucking stupid name please choose another');
            return;
         }
      }
      socket.emit('nickNameValidation', false);
   });
   // Handle a message being sent out
   socket.on('message', function (nickname, msg, timeStamp, room) {
      io.in(room).emit('updatechat', nickname, msg, timeStamp, room);
   });
   // Initializing the chat
   socket.on('chat-select-initialize', function(room, nickname) {
      // If the channel  that the user is joining doesn't exist, create a new one
      if (!channels[room]) channels[room] = new Channel(room);
      socket.nickname = nickname;
      // Set the users[socket.id]'s info
      users[socket.id].nickname = nickname;
      users[socket.id].channels.push(room);
      // Sets up the channel they're joining
      channels[room].users[socket.id] = nickname;
      // Handles setting out the list of nicknames for a chat
      let listOfNames = [];
      // let userForDB = new UserModel({
         //    nickname: nickname,
         //    channels: [room]
         // })
         // userForDB.save().then(function(){
      //    console.log('is it true?', !userForDB.isNew);
      // })
      for (let val in channels[room].users) {
         listOfNames.push(channels[room].users[val]);
      }
      socket.join(room);
      // Send out updated userlist
      io.in(room).emit('activeUserList', listOfNames);
      socket.emit('updateChannels', users[socket.id].channels, room);
      io.in(room).emit('updatechat', '','SERVER: '+ nickname + ' has connected to #'+ room, '', room);
    });

    // Handling changing a channel if you enter a new one
    socket.on('changeChannel', function(newRoom) {
      socket.join(newRoom);
      channels[newRoom] ? null : channels[newRoom] = new Channel(newRoom);
      users[socket.id].channels[newRoom] ? isInRoom = true : users[socket.id].channels.push(newRoom);
      channels[newRoom].users[socket.id] = users[socket.id].nickname;
      let listOfNames = [];
      for (let user in channels[newRoom].users) {
         listOfNames.push(channels[newRoom].users[user]);
      }
      io.in(newRoom).emit('activeUserList', listOfNames);
      // Both of these are needed because if one event listener says to go off they both go off in different components
      io.in(newRoom).emit('updatechat', '','SERVER: '+ users[socket.id].nickname + ' has connected to #'+ newRoom, '', newRoom);
      socket.emit('updateChannels', users[socket.id].channels, newRoom);
   });
   // Handling switching to a channel you're already in
   socket.on('switchChannel', function(newRoom) {
      let listOfNames = [];
      for (let val in channels[newRoom].users) {
         listOfNames.push(channels[newRoom].users[val]);
      }
      socket.emit('activeUserList', listOfNames);
      socket.emit('updateChannels', users[socket.id].channels, newRoom);
   });
 });
 

//GET API
app.get("/", function(req , res) {
   //res.send('you have connected');
   res.sendFile(__dirname + '/index.html');
});

 //Setting up server
server.listen(4000, function (err) {
   if (err) throw err
   console.log(`Listening on port ${server.address().port}`)
});