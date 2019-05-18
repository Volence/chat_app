import React, { useEffect } from 'react';
import styled from 'styled-components';


let chatArea = React.createRef();
const ChatText = ({displayText}) => {
  // scroll to the bottom of the text area (as it overflows)
  const scrollToBottom = () => {
    chatArea.current.scrollTop = chatArea.current.scrollHeight;
  }

  useEffect(() => {
    scrollToBottom();
  })

    return (
      <ChatTextList ref={chatArea}>
        {displayText}
      </ChatTextList>
    );
}

const ChatTextList = styled.ul`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  margin: 0;
  text-align: left;
  overflow-y: scroll;
  padding: 0;
  grid-area: mainChat;
  background: rgb(85,147,255);
  overflow-x: hidden;
  // background: linear-gradient(29deg, rgba(85,147,255,1) 0%, rgba(230,80,255,1) 18%, rgba(87,225,255,1) 100%);
  background-color: rgba(87,225,255,1);
`;



export default ChatText;