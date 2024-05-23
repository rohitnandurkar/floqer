// src/ChatInterface.tsx
import React, { useState } from 'react';
import { Input, Button, List } from 'antd';
import axios from 'axios';

interface Message {
  sender: 'user' | 'bot';
  content: string;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { sender: 'user', content: inputValue };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    setInputValue('');

    const botReply = await fetchBotReply(inputValue);

    const botMessage: Message = { sender: 'bot', content: botReply };
    setMessages((prevMessages) => [...prevMessages, botMessage]);
  };

  const fetchBotReply = async (message: string) => {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    const apiUrl = 'https://api.openai.com/v1/engines/davinci-codex/completions';

    try {
      const response = await axios.post(apiUrl, {
        prompt: message,
        max_tokens: 150,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      return response.data.choices[0].text.trim();
    } catch (error) {
      console.error('Error fetching bot reply:', error);
      return 'Sorry, there was an error getting a response from the bot.';
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <List
        bordered
        dataSource={messages}
        renderItem={(item) => (
          <List.Item style={{ textAlign: item.sender === 'user' ? 'right' : 'left' }}>
            <List.Item.Meta
              description={item.sender === 'user' ? 'You' : 'Bot'}
              title={item.content}
            />
          </List.Item>
        )}
        style={{ marginBottom: 20, maxHeight: '400px', overflowY: 'scroll' }}
      />
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onPressEnter={sendMessage}
        placeholder="Type your message"
        style={{ marginBottom: 10 }}
      />
      <Button type="primary" onClick={sendMessage}>
        Send
      </Button>
    </div>
  );
};

export default ChatInterface;
