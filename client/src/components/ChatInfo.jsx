import React, { useState }  from 'react';
import styled from 'styled-components';


const ChatInfo = ({socket, channels, users, listOfChannels}) => {
    // State for the input box for a typing in a new channel, probably could be a ref
    const [channelTyped, setChannelTyped] = useState('');
    // Join a new channel when typed in
    const handleNewChannelEntered = (e) => {
        e.preventDefault();
        setChannelTyped('');
        let channelAtCorrectText;
        let doesArrayExist = [...listOfChannels].reduce((total, currentItem) => {
            if (currentItem.toLowerCase() === channelTyped.toLowerCase()) {
                channelAtCorrectText = currentItem;
                return ++total;
            }
            return total;
        }, 0)
        doesArrayExist > 0 ? switchChannelFromEntered(channelAtCorrectText) : socket.emit('changeChannel', channelTyped);
    }
    // If the user types in a channel they're already in this gets called
    const switchChannelFromEntered = (channelTo) => {
        socket.emit('switchChannel', channelTo);
    }
    return (
        <ChatInfoContainer>
            <UserList>
                <h3>Current Users:</h3>
                    {users}
            </UserList>
            <ChatList>
                <h3>ChatRooms:</h3>
                    {channels}
                <form onSubmit={handleNewChannelEntered} >
                    <p>Join a new Room:</p>
                    <input value={channelTyped} type="text" onChange={e => setChannelTyped(e.target.value)}></input>
                    <input type='submit'></input>
                </form>
            </ChatList>
        </ChatInfoContainer>
    );
}

const ChatInfoContainer = styled.div`
    display: flex;
    flex-direction: column;
    grid-area: chatInfo;
`

const UserList = styled.div`
    height: 50%;
    border: 1px solid black;
    overflow-y: scroll;
    background: rgb(238,174,202);
    background: radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%);
`

const ChatList = styled.div`
    height: 50%;
    border: 1px solid black;
    border-top: none;
    overflow-y: scroll;
    background: rgb(238,174,202);
    background: radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%);
`

export default ChatInfo;