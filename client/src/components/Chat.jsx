import React, {useState, useEffect} from 'react';
import ChatText from './ChatText';
import ChatTypingArea from './ChatTypingArea.jsx';
import ChatInfo from './ChatInfo';
import styled from 'styled-components';
import moment from 'moment';

let missingChannelNotifications = {};
let itemNumber = 1;
const isImage = (value) => true === (/\.(gif|jpe?g|tiff|png)$/i).test(value);
const chat = ({currentChatroom, nickName, socket}) => { 
    const switchChannel = (e) => {
        e.preventDefault();
        let channelToEmit = e.currentTarget.textContent;
        if (channelToEmit.includes(' ')) {
            channelToEmit = channelToEmit.split(' ')[0];
        };
        channelToEmit = channelToEmit.trim();
        socket.emit('switchChannel', channelToEmit);
    }
    
    // List of users in a chat
    const [users, setUsers] = useState([]);
    // List of channels to be represented in the dom
    const [channels, setChannels] = useState([<ChannelNameActive channel={currentChatroom} onClick={switchChannel}>{currentChatroom}</ChannelNameActive>]);
    // List of channels the user is connected to
    const [listOfChannels, setListOfChannels] = useState([currentChatroom]);
    // All text sent to client
    const [currentTextList, setCurrentTextList] = useState({});
    // Text represented in the DOM
    const [displayText, setDisplayText] = useState([]);
    // Current Channel the user is in
    const [chatRoom, setChatRoom] = useState(currentChatroom);

    const updateUserListJSX = (users) => {
        // Set a special style and make the current user displayed first
        let userListJSX = [<UserName key={itemNumber++}>{nickName}</UserName>];
        // add the rest of the users to the list except the current user (they're already first)
        users.forEach(user => {
            if (user !== nickName && user) userListJSX.push(<UserNames key={itemNumber++}>{user}</UserNames>);
        })
        // Update state of user list
        setUsers([...userListJSX]);
    }

    const updateChannelList = (chanList) => {
        // update the channel list
        setListOfChannels([...chanList]);
    }

    const updateChannelListJSX = (chanList, currentChan, missingMessages = '') => {
        // Set special styles for the channel they're in and set it to the first position
        let channelListJSX = [<ChannelNameActive channel={currentChan} onClick={switchChannel} key={[currentChan, 0]}>{currentChan}</ChannelNameActive>];
        missingChannelNotifications[currentChan] = 0;
        // add the rest of the channels to the list except the one that was joined (it's at the top)
        chanList.forEach(channel => {
            if (channel !== currentChan && channel) channelListJSX.push(<ChannelName channel={channel} onClick={switchChannel} key={channel}>{channel} <RedText>{missingChannelNotifications[channel] < 1 ? null : missingChannelNotifications[channel] + '!'}</RedText></ChannelName>);
        })
        // update the display of channels on the dom
        setChannels([...channelListJSX]);
    }

    const updateChatText = (nickName, msg, timeStamp, room) => {
        // if this is a new room, make a blank array, else grab the text from the room
        let roomTextJSX = (currentTextList[room] === undefined) ? [] : [...currentTextList[room]];
        // grab the whole object
        let allTextJSX = currentTextList;
        // If there's not timestamp it's probably a user joining, set a timestamp
        if(!timeStamp) {
            roomTextJSX.push(<ChatTextItem key={msg + itemNumber++}>{msg} <small>(at {moment().format('YYYY-MM-DD hh:mm:ss a')})</small></ChatTextItem>);
        } else {
        // if there is, either handle it as an image or as text
            if(isImage(msg)) { 
                roomTextJSX.push(<ListImage><p><b>{nickName}</b> <small>(sent at {moment(timeStamp).local().format('YYYY-MM-DD hh:mm:ss a')}): </small></p> <ChatImageItem src={msg} alt="uploaded" key={msg + itemNumber++}></ChatImageItem></ListImage>) 
            } else { 
                if (roomTextJSX[roomTextJSX.length-1].props.user === nickName) {
                    let prevItem = roomTextJSX.pop();
                    let oldMessage = prevItem.key.split(',');
                    let firstMessage = oldMessage.shift()
                    let oldMessagesToDisplay = oldMessage.map(x => <p>{x}</p>);
                    roomTextJSX.push(<ChatTextItem key={[firstMessage, oldMessage, msg]} user={nickName}><p><b>{nickName}</b> <small>(sent at {moment(timeStamp).local().format('YYYY-MM-DD hh:mm:ss a')}): </small>{firstMessage}</p>{oldMessagesToDisplay}{msg}</ChatTextItem>);
                } else {
                    roomTextJSX.push(<ChatTextItem key={msg} user={nickName}><p><b>{nickName}</b> <small>(sent at {moment(timeStamp).local().format('YYYY-MM-DD hh:mm:ss a')}): </small>{msg}</p></ChatTextItem>);
                }
            }
        }
        // add the new item to the whole object
        allTextJSX[room] = [...roomTextJSX];
        // update the whole text object
        setCurrentTextList(allTextJSX);
        // update the display to show the current updated text
        let currentRoom = chatRoom;
        setDisplayText(allTextJSX[currentRoom]);
        if((chatRoom) && (chatRoom !== room)) {
            let tempChannelJSX = [...channels];
            tempChannelJSX.forEach(eachChannel => {
                if (eachChannel.props.channel === room) {
                    let indexOfChannel = tempChannelJSX.indexOf(eachChannel);
                    missingChannelNotifications[eachChannel.props.channel]++;
                    tempChannelJSX[indexOfChannel] = <ChannelName channel={eachChannel.props.channel} onClick={switchChannel} key={[eachChannel.props.channel]}>{eachChannel.props.channel} <RedText>{missingChannelNotifications[eachChannel.props.channel] + '!'}</RedText></ChannelName>
                    setChannels([...tempChannelJSX]);
                }
            })
        }
    }

    // When recieving a message from activeUserList, to display current list of users in a channel
    useEffect(() => {
        socket.on('activeUserList', (users) => {
            updateUserListJSX(users);
        });
        return () => {
            socket.off('activeUserList');
        }
    }, [users]);

    // When recieving data on a new channel joined or switched to a different channel
    useEffect(() => {
        socket.on('updateChannels', (chanList, currentChan) => {
            setChatRoom(currentChan);
            updateChannelListJSX(chanList, currentChan);
            updateChannelList(chanList);
            setDisplayText(currentTextList[currentChan]);
        });
        return () => {
            socket.off('updateChannels');
        }
    }, [channels, listOfChannels]);

    useEffect(() => {
        socket.on('updatechat', (nickName, msg, timeStamp, room) => {
            updateChatText(nickName, msg, timeStamp, room);
        });
        return () => {
            socket.off('updatechat');
        }
    }, [currentTextList, chatRoom, channels]);

   // Used to switch between channels already joined

    return (
        <MainBody>
            <ChatText displayText={displayText}/>
            <ChatTypingArea socket={socket} nickName={nickName} chatRoom={chatRoom}/>
            <ChatInfo socket={socket} listOfChannels={listOfChannels} users={users} channels={channels}/>
        </MainBody>
    );
}

const MainBody = styled.div`
    display: grid;
    grid-gap: 0;
    grid-template-columns: 9fr  1fr;
    grid-template-rows: 21fr 1fr;
    grid-template-areas:
    "mainChat chatInfo"
    "chatTextInput chatInfo";
    height: 100%;
`
const ChannelName = styled.p`
    margin: .4rem .4rem;
    &:hover {
        cursor: pointer;
    }
`
const ChannelNameActive = styled.p`
    margin: .4rem .4rem;
    font-weight: bold;
    color: #8b0000;
    &:hover {
        cursor: pointer;
    }
`

const UserName = styled.p`
    color: #8b0000;
    font-weight: bold;
    margin: .4rem .4rem;
`
const UserNames = styled.p`
    margin: .4rem .4rem;
`
const ChatTextItem = styled.li`
  width: 75%;
  padding: 1rem;
  margin: 1rem auto;
  max-width: 99%;
  list-style-type: none;
  padding-left: 1rem;
  background: rgba(255, 255, 255, .8);
  box-shadow: 0px 0px 15px black; 
  border-radius: 4px;
`;

const ListImage = styled.li`
    width: 75%;
    margin: 1rem auto;
    padding: 1rem;
    background: rgba(255, 255, 255, .8);
    list-style-type: none;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-end;
    height: auto;
    min-height: fit-content;
    max-width: 100%;
    box-shadow: 0px 0px 15px black;
    border-radius: 4px;
`;

const ChatImageItem = styled.img`
  width: auto;
  height: auto;
  max-width: 50%;
`

const RedText = styled.b`
    color: red;
`


export default chat;