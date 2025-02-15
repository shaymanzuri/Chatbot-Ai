import React from 'react';
import { useState, useEffect } from 'react';
import BotMessage from './components/BotMessage';
import UserMessage from './components/UserMessage';
import Messages from './components/Messages';
import Input from './components/Input';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import API, { getQuestionsList, queryQuestion } from './ChatbotAPI';
import axios from 'axios';

import './index.css';
import Header from './components/Header';

const Chatbot = ({ items, setItems, numItems, setNumItems }) => {
  const [leftDrawer, setLeftDrawer] = useState(false);
  const navigate = useNavigate();
  const loggedUser = sessionStorage.getItem('logged_chat_user');
  const [messages, setMessages] = useState([]);
  const [questionList, setQuestionList] = useState([]);
  const [username, setUsername] = useState(
    sessionStorage.getItem('username') || null
  );
  const [history, setHistory] = useState([]);
  const [sessionId, setSessionId] = useState();

  // const [splitSentences,setSplitSentences]= useState([])
  useEffect(() => {
    const getHistory = async () => {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/history`, {
        username: username
      });
      setHistory(res.data.history);
    };
    if (username == null) {
      navigate('/login');
    } else {
      setUsername(JSON.parse(loggedUser)?.username);
      try {
        getHistory();
      } catch (error) {
        alert(error);
      }
    }
  }, []);

  useEffect(() => {
    const getHistory = async () => {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/history`, {
        username: username
      });
      return res;
    };
    if (username == null) {
      navigate('/login');
    } else {
      setUsername(JSON.parse(loggedUser)?.username);
      try {
        setHistory(getHistory().history);
      } catch (error) {
        alert(error);
      }
    }
    const getData = async () => {
      const res = await getQuestionsList();
      if (res.success) {
        setQuestionList([...res.data]);
      }
    };
    getData();
  }, []);
  const loadWelcomeMessage = () => {
    setMessages([
      <BotMessage
        items={items}
        setItems={setItems}
        numItems={numItems}
        setNumItems={setNumItems}
        key="0"
        fetchMessage={async () =>
          await API.GetChatbotResponse({
            user: sessionStorage.getItem('username'),
            query: 'default'
          })
        }
      />
    ]);
  };
  useEffect(() => {
    async function loadWelcomeMessage() {
      setMessages([
        <BotMessage
          items={items}
          setItems={setItems}
          numItems={numItems}
          setNumItems={setNumItems}
          key="0"
          fetchMessage={async () =>
            await API.GetChatbotResponse({
              user: sessionStorage.getItem('username'),
              query: 'default'
            })
          }
        />
      ]);
    }
    loadWelcomeMessage();
  }, []);

  const getHistoryBySessionId = (historyArray, sessionId) => {
    if (!sessionId) {
      return null;
    } else {
      return historyArray
        .filter(item => item.session_id === sessionId)
        .map(item => item.history);
    }
  };
  const send = async text => {
    const chatHistory = getHistoryBySessionId(history, sessionId)
      ? getHistoryBySessionId(history, sessionId)[0]
      : [];
    console.log(
      chatHistory?.length != 0
        ? chatHistory[chatHistory?.length - 1]['response']
        : null
    );

    const rs = await queryQuestion(
      text,
      sessionStorage.getItem('username'),
      sessionId,
      setSessionId,
      setHistory,
      chatHistory?.length != 0
        ? chatHistory[chatHistory?.length - 1]['response']
        : null
    );

    const newMessages = messages.concat(
      <UserMessage key={messages.length + 1} text={text} />,

      <BotMessage
        key={messages.length + 2}
        fetchMessage={async () =>
          await API.GetChatbotResponse({
            user: sessionStorage.getItem('username'),
            query: rs
          })
        }
        items={items}
        setItems={setItems}
        numItems={numItems}
        setNumItems={setNumItems}
      />
    );
    // console.log(splitSentences)
    setMessages(newMessages);
  };

  return (
    <div className="main">
      <div
        style={{
          position: 'absolute',
          left: '20px',
          top: '5px',
          color: 'white'
        }}
      >
        <Button
          style={{ color: 'white', border: '1px solid white' }}
          onClick={() => {
            setLeftDrawer(true);
          }}
        >
          Chat History
        </Button>
        <div></div>
        <SwipeableDrawer
          anchor="left"
          open={leftDrawer}
          onClose={() => {
            setLeftDrawer(false);
          }}
          onOpen={() => {
            setLeftDrawer(true);
          }}
        >
          <div style={{ width: '300px' }}>
            <h3
              style={{
                textAlign: 'center',
                marginTop: '10px',
                marginBottom: '10px'
              }}
            >
              Previous chats
            </h3>
            <Button
              style={{
                color: 'green',
                border: '1px solid green',
                margin: '5px',
                width: '290px'
              }}
              onClick={() => {
                sessionStorage.setItem('NItems', 0);
                setMessages([]);
                setSessionId('');
                loadWelcomeMessage();
              }}
            >
              New Chat
            </Button>
            <Divider />
            {!history ? (
              <p style={{ textAlign: 'center', marginTop: '20px' }}> Empty</p>
            ) : (
              history
                .slice()
                .reverse()
                .map(his => (
                  <div
                    style={{ cursor: 'pointer' }}
                    key={his.session_id}
                    onClick={async () => {
                      setMessages([]);
                      loadWelcomeMessage();
                      setSessionId(his.session_id);
                      const hist = getHistoryBySessionId(
                        history,
                        his.session_id
                      )[0];
                      console.log(hist);
                      let me = [];
                      for (let i = 0; i < hist.length; i++) {
                        const newMessages = me.concat(
                          <UserMessage
                            key={me.length + 1}
                            text={hist[i]['question']}
                          />,
                          <BotMessage
                            key={me.length + 2}
                            fetchMessage={async () =>
                              await API.GetChatbotResponse({
                                user: username,
                                query: hist[i]['response']
                              })
                            }
                            items={items}
                            setItems={setItems}
                            numItems={numItems}
                            setNumItems={setNumItems}
                          />
                        );
                        // console.log(splitSentences)

                        me = [...me, newMessages];
                        setMessages(newMessages);
                      }
                      sessionStorage.setItem('Items', JSON.stringify([]));
                      sessionStorage.setItem('NItems', 0);

                      window.dispatchEvent(new Event('storageUpdate')); // setMessages(getHistoryBySessionId(history, his.session_id))
                    }}
                  >
                    <p style={{ textAlign: 'center', padding: '5px' }}>
                      {his.history[0]['question']}
                    </p>
                    <Divider />
                  </div>
                ))
            )}
          </div>
        </SwipeableDrawer>
      </div>
      <div className="chatbot">
        <Header
          items={items}
          setItems={setItems}
          numItems={numItems}
          setNumItems={setNumItems}
        />
        <Messages messages={messages} />

        <div className="quick_questions">
          {questionList?.map((question, index) => (
            <button
              onClick={() => send(question)}
              className="quick_questions_item"
              key={index}
            >
              {question}
            </button>
          ))}
        </div>
        <Input onSend={send} />
      </div>
    </div>
  );
};

export default Chatbot;
