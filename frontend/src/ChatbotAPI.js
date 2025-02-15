import axios from 'axios';
export const getQuestionsList = async () => {
  let arr = {
    data: [],
    success: false,
    message: ''
  };

  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/chatbot-questions`
    );
    const data = await res.json();
    arr.data = [...data.questions];
    arr.message = 'Fetch questions successfully !!!';
    arr.success = true;
  } catch (err) {
    arr.message = err;
  } finally {
    // eslint-disable-next-line no-unsafe-finally
    return arr;
  }
};

export const queryQuestion = async (
  queries,
  user,
  sessionId,
  setSessionId,
  setHistory,
  chatHistory
) => {
  try {
    const session_id = sessionId;
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/chatbot`, {
      query: queries,
      username: user,
      session_id: sessionId,
      chat_history: chatHistory
    });

    const data = res.data?.response;
    console.log('result: ', res.data);
    console.log('session_id: ', res.data?.session_id);
    setSessionId(res.data?.session_id);

    const getHistory = async () => {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/history`, {
        username: user
      });
      return res;
    };

    try {
      setHistory((await getHistory()).data.history);
    } catch (error) {
      alert(error);
    }
    return data;
  } catch (err) {
    throw new Error(err);
  }
};

const API = {
  GetChatbotResponse: async message => {
    return new Promise(function (resolve) {
      setTimeout(function () {
        if (message.query === 'default') {
          resolve(
            `Welcome, ${
              message.user.match(/"([^"]*)"/)[1]
            } to Tech Store chatbot !\n`
          );
        } else if (message.query === 'info') {
          resolve('Will help assist you with informations');
        } else if (message.query === 'equipements') {
          resolve('Info on (Laptops, Phone, Cost, quantity ...)');
        } else {
          // check if its a greeting
          if (message.query.includes('-greeting')) {
            resolve(
              'Hey, ' +
                message?.user +
                ' some quick questions are there to help you below'
            );
          } else {
            resolve(message.query);
          }
        }
      }, 2000);
    });
  }
};

export default API;
