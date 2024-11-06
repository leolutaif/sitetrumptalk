import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./App.css";
import gifTrump from "./trump.gif";
import trump from "./trump.png";
import audioClip from "./makeamerica.mp3";
import pump from "./pump.png";

const TrumpChat = () => {
  const [userMessage, setUserMessage] = useState('');
  const [trumpResponse, setTrumpResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [apiData, setApiData] = useState(null);

  // Trump audio array
  const audios = [audioClip, audioClip, audioClip, audioClip, audioClip];

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
        const response = await axios.get('https://apitoreturnca.onrender.com/api/purchaseData');
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
      const response = await axios.post('https://apitrumptalk.onrender.com/api/ask', {
        question: userMessage,
      });

      const answer = response.data.answer;
      setTrumpResponse(formatMessageText(answer));

      const responseLength = answer.length;
      const playCount = Math.ceil(responseLength / 50);

      setTimeout(() => {
        setIsResponding(true);
        for (let i = 0; i < playCount; i++) {
          const audio = playRandomAudio();
          const gifDuration = 2000;

          setTimeout(() => setIsResponding(false), gifDuration);

          // Stop animation when audio ends
          audio.onended = () => setIsResponding(false);
        }
      }, 500);

    } catch (error) {
      console.error("Error fetching AI response:", error);
      setTrumpResponse("Trump is thinking too much and couldn’t respond.");
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
      <div className="trump-image">
        <img 
          src={isResponding ? gifTrump : trump} 
          alt="Chat Trump" 
          className="trump"
        />
      </div>
      <div className="loading">
        {isLoading && <span className="loading-text">Thinking...</span>}
      </div>
      <div className="response">
        {/* Using dangerouslySetInnerHTML to render formatted HTML */}
        <p dangerouslySetInnerHTML={{ __html: trumpResponse }} className="terminal-text"></p>
      </div>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Ask Trump something..." 
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
            <span onClick={copyTokenCa}  className="ca">CA: {apiData.tokenCA}</span>
          </div>
        </div>
      ) : (
        <p className="error-message">Token data has not loaded yet.</p>
      )}
    </div>
  );
};  

export default TrumpChat; 
