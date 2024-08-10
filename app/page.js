'use client'// This is a special directive for Next.js to indicate that this component is a client-side component.
import { Box, Stack, TextField,Button } from "@mui/material";
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
  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction="column"
        width="600px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={3}
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
                bgcolor={message.role === 'assistant' ? '#546e7a':'#26a69a' }
                color="white"
                borderRadius={16}
                p={3}
              >
                //Imported component to make the content output streamed and uncluttered
               <ReactMarkdown>{message.content}</ReactMarkdown>
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField 
          label="message"
          fullWidth
          value={message}
          onChange={(e)=>setMessage(e.target.value)}/>
          <Button variant="contained" onClick={sendMessage}>Send</Button>

        </Stack>
      </Stack>
    </Box>
  );
}