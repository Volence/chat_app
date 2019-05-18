import React, { useState, useEffect }  from 'react';
import styled from 'styled-components';
import moment from 'moment';

const isImage = (value) => true === (/\.(gif|jpe?g|tiff|png)$/i).test(value);
const ChatTypingArea = ({socket, nickName, chatRoom}) => {
    // Text being typed
    const [currentText, setCurrentText] = useState('');
    // Image preview box dom representation
    const [imagePreview, setImagePreview] = useState('');
    // which chatroom to send the text to

      // constantly check if the text in chat is an image link, if so make it into a preview at the bottom of the screen
    useEffect(() => {
        isImage(currentText) ? setImagePreview(<AbsolutePreview>Preview:<ChatImageItem src={currentText} alt="preview"></ChatImageItem></AbsolutePreview>) : setImagePreview('');
    }, [currentText, imagePreview]);

    // Handling sending a message
    const sendMessage = (e) => {
        e.preventDefault();
        let timeSent = moment.utc();
        socket.emit('message', nickName, currentText, timeSent, chatRoom);
        setCurrentText('');
    }

    return (
    <TextArea action="#" onSubmit={sendMessage}>
        {imagePreview}
        <TextInput value={currentText} type="text" onChange={e => setCurrentText(e.target.value)} ></TextInput>
        <SubmitButton type="submit" value="Submit" />
    </TextArea>
    );
}
  
const TextArea = styled.form`
    display: flex;
    grid-area: chatTextInput
    position: relative;
`;

const TextInput = styled.input`
    width: 90%;
    height: 100%;
    background: #00d2ff;
    // background: linear-gradient(185deg, rgba(85,255,227,1) 0%, rgba(230,80,255,1) 53%, rgba(87,255,157,1) 70%);
    transition: .4s all;
    padding-left: .4rem;
    border: 2px solid #005eff;
    
    &:focus {
        border: 2px solid #005eff;
    }
`

const SubmitButton = styled.input`
    width: 10%;
    max-width: 10%;
    height: 100%;
    background-color: lightblue;
    border: 1px solid darkblue;
    box-shadow:0px 0px 2px 2px #005eff inset,0px 0px 4px 4px #00d2ff inset,0px 0px 0px 6px #005eff inset, 0px 0px 15px black;
    background: linear-gradient(29deg, rgba(85,147,255,1) 0%, rgba(80,144,255,1) 18%, rgba(87,225,255,1) 100%);
    transition: .4s all;

    &:hover {
        box-shadow:0px 0px 1px 1px #005eff inset,0px 0px 2px 2px #00d2ff inset,0px 0px 0px 3px #005eff inset, 0px 0px 5px black;
        cursor: pointer;
    }
`
const ChatImageItem = styled.img`
  width: auto;
  height: auto;
  max-height: 8rem;
  max-width: 10rem;
`
const AbsolutePreview = styled.div`
    position: absolute;
    top: -9rem;
    right: 1rem;
    opacity: .8;
    display: flex;
    flex-direction: column;
`
export default ChatTypingArea;