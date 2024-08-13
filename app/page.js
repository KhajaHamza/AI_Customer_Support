'use client'// This is a special directive for Next.js to indicate that this component is a client-side component.
import { Box, Stack, TextField,Button,Typography } from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Hi! I am your Tech Assistant! How can I assist you today?'
  }]);
  const [message, setMessage] = useState('');

  // This function is called when the user clicks the "Send" button.
  const sendMessage=async()=>{
    setMessage('')// Clear the input field after sending the message
    setMessages((messages)=>[
      ...messages,// Keep all existing messages
      {role:"user",content:message},// Add the user's message
      {role:"assistant",content:''}// Prepare a blank message for the assistant's response
    ])
// Send the user's message to the backend API to get a response from the assistant
    const response=fetch('/api/chat',{
      method:"POST",
      headers:{
        'Content-Type':'application/json'// Tell the server we're sending JSON data
      },
      body:JSON.stringify([...messages,{role:'user',content:message}]),// Send all messages including the new one
    }).then(async(res)=>{
      
      const reader=res.body.getReader()// Get the response body as a readable stream
      const decoder=new TextDecoder()// Decoder to convert the stream of bytes into text
      let result=' '
      return reader.read().then(function processText({done,value}){
        if(done){
          return result
        }
        // Decode the incoming chunk of text
        const text=decoder.decode(value||new Int8Array(),{stream:true})
        setMessages((messages)=>{
          let lastMessage=messages[messages.length-1]
          let otherMessages=messages.slice(0,messages.length-1)
          return([
            ...otherMessages,
            {
              ...lastMessage,
              content:lastMessage.content+text,
            },
          ])
        })
        return reader.read().then(processText)
      })
    })
  }
  return( <Box
  width="100vw"
  height="100vh"
  display="flex"
  flexDirection="column"
  justifyContent="center"
  alignItems="center"
  sx={{ backgroundColor: '#e3f2fd' }} // Light blue background color
>
  
  <Typography //Engineering Logo
    variant="h4"
    sx={{
      color: '#1e88e5', // Darker blue for logo text
      mb: 2, // Margin bottom to separate from chatbox
      fontWeight: 'bold',
    }}
  >
    EngineerEase
  </Typography>

  <Stack
    direction="column"
    width="600px"
    height="700px"
    border="1px solid #1e88e5" // Border color matching the logo
    p={2}
    spacing={3}
    sx={{ backgroundColor: '#ffffff' }}
  >
    <Stack
      direction="column"
      spacing={2}
      flexGrow={1}
      overflow="auto"
      maxHeight="100%"
    >
      {messages.map((message, index) => (
        <Box
          key={index}
          display="flex"
          justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
        >
          <Box
            bgcolor={message.role === 'assistant' ? '#546e7a' : '#1e88e5'} // Grey for assistant, blue for user
            color="white"
            borderRadius={16}
            p={3} // Padding inside the box is set to 3 (theme spacing unit)
          >
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </Box>
        </Box>
      ))}
    </Stack>
    <Stack direction="row" spacing={2}>
      <TextField 
        label="Message"
        fullWidth
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={sendMessage}>
        Send
      </Button>
    </Stack>
  </Stack>
</Box>
);
}
