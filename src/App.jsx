import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./App.css";
import gifCat from "./gif.gif";
import cat from "./cat.png";
import miau from "./miau.mp3";
import pump from "./pump.png";

const CatChat = () => {
  const [userMessage, setUserMessage] = useState('');
  const [catResponse, setCatResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [apiData, setApiData] = useState(null);

  const accessKey = 'A1qQaAA9kdfnn4Mmn44bpoieIYHKkdghFKUD1978563llakLLLKdfslphgarcorc3haeogmmMNn243wf';

  // Cat audio array
  const audios = [miau, miau, miau, miau, miau];

  // Function to play a random audio
  const playRandomAudio = () => {
    const randomAudioSrc = audios[Math.floor(Math.random() * audios.length)];
    const audio = new Audio(randomAudioSrc);
    audio.play().catch((error) => {
      console.error("Error playing audio:", error);
    });
    return audio;
  };

  // Fetch API data on component mount
  useEffect(() => {
    const fetchApiData = async () => {
      try {
        const response = await axios.get('https://interca.onrender.com/api/purchaseData', {
          headers: {
            'x-access-key': accessKey,
          },
        });
        console.log("API data received:", response.data);
        setApiData(response.data);
      } catch (error) {
        console.error("Error fetching API data:", error);
      }
    };

    fetchApiData();
  }, []);

  const handleResponse = async () => {
    setIsLoading(true);
    setIsResponding(false);

    try {
      const response = await axios.post('https://catapitalk-a1f349c48de5.herokuapp.com/api/ask', {
        question: userMessage,
      });

      const answer = response.data.answer;
      setCatResponse(formatMessageText(answer));

      const responseLength = answer.length;
      const playCount = Math.ceil(responseLength / 50);

      setTimeout(() => {
        setIsResponding(true);
        for (let i = 0; i < playCount; i++) {
          const audio = playRandomAudio();
          const gifDuration = 2000;

          setTimeout(() => setIsResponding(false), gifDuration);
          
          // Parar a animação ao fim do áudio
          audio.onended = () => setIsResponding(false);
        }
      }, 500);

    } catch (error) {
      console.error("Error fetching AI response:", error);
      setCatResponse("The cat is thinking too much and couldn’t respond.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleResponse();
    setUserMessage('');
  };

  const copyTokenCa = () => {
    if (apiData?.tokenCA) {
      navigator.clipboard.writeText(apiData.tokenCA);
      alert('Copied!');
    }
  };

  // Function to format text using <strong> tags for bolding text between **asterisks**
  function formatMessageText(text) {
    return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  }

  return (
    <div className="chat-container">
      <div className="cat-image">
        <img 
          src={isResponding ? gifCat : cat} 
          alt="Chat Cat" 
          className="cat"
        />
      </div>
      <div className="loading">
        {isLoading && <span className="loading-text">Thinking...</span>}
      </div>
      <div className="response">
        {/* Using dangerouslySetInnerHTML to render formatted HTML */}
        <p dangerouslySetInnerHTML={{ __html: catResponse }} className="terminal-text"></p>
      </div>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Say something to the cat..." 
          value={userMessage} 
          onChange={(e) => setUserMessage(e.target.value)} 
        />
      </form>

      {/* Div to display API data */}
      {apiData ? (
        <div className="infos">
          <div className="tokenName">{apiData.tokenName}</div>
          <div className="links">
            <a href={apiData.twitterLink} target="_blank" rel="noopener noreferrer" className="link">X/Twitter</a>
            <a href={apiData.link} target="_blank" rel="noopener noreferrer" className="link pump"><img src={pump} alt="Pump Link" /></a>
            <a href={apiData.telegramLink} target="_blank" rel="noopener noreferrer" className="link">Telegram</a>
          </div>
          <div className="tokenCa">
            <span className="ca">CA: {apiData.tokenCA}</span>
            <div onClick={copyTokenCa} className="copy-button">COPY</div>
          </div>
        </div>
      ) : (
        <p className="error-message">Token data has not loaded yet.</p>
      )}
    </div>
  );
};  

export default CatChat;
