import { typingSentences } from './data.js';

let buttonElement = document.querySelector('.start-btn');
let targetTextElement = document.querySelector('.target-text');
let typingAreaElement = document.querySelector('.typing-area');
let overallResultElement = document.querySelector('.overall-result');
let gameAverageScoreElement = document.querySelector('.game-average-score');
let currentGameResultElement = document.querySelector('.current-game-result');

    let scoreList = JSON.parse(localStorage.getItem('scores')) || [];
    renderScore();
    renderSentence();
    
    const savedText = localStorage.getItem('typedText') || '';
    typingAreaElement.value = savedText;
    const savedState = localStorage.getItem('isStarted');
    const savedEndTime = Number(localStorage.getItem('end'));
    let timeOutId;
    let isStarted = false;
    if(savedState && savedEndTime) {
      if (Date.now()<savedEndTime) {
        typingAreaElement.disabled = false;
        typingAreaElement.focus();
        buttonElement.innerText = 'Started Typing';
        buttonElement.classList.add('selected-button');
        isStarted = true;
        runTimer(savedEndTime);
      }
      else {
        localStorage.removeItem('isStarted');
        localStorage.removeItem('end');
        typingAreaElement.disabled = true;
        resetButton();
        isStarted = false;
      }
    }
    
    buttonElement.addEventListener('click', startTyping);
    function startTyping() {
      if (isStarted) return;
      localStorage.setItem('isStarted', 'true');
      typingAreaElement.disabled = false;
      typingAreaElement.focus();
      isStarted = true;
      displayTarget();
      const endTime = Date.now()+60000;
      localStorage.setItem('end', endTime);
      runTimer(endTime);
      changeButton();
    }
     
    function runTimer(end) {
      timeOutId = setTimeout( () => {
        alert('Time out');
        typingAreaElement.blur();
        typingAreaElement.disabled = true;
        localStorage.removeItem('end');
        getText();
      }, end-Date.now());
    }

    typingAreaElement.addEventListener('input', () => {
      localStorage.setItem('typedText', typingAreaElement.value);
    });
    function changeButton() {
      buttonElement.classList.add('selected-button');
      buttonElement.innerText = 'Started Typing';
    }

    function getText() {
      clearTimeout(timeOutId);
      const userText = typingAreaElement.value;
      const targetText = localStorage.getItem('sentence');
      console.log('USER:', userText);
      console.log('TARGET:', targetText);

      calculateScore(userText, targetText);
    }
    function calculateScore(userText, targetText) {
      const userWords = userText.split(' ');
      const targetWords = targetText.split(' ');
      console.log(userWords);
      console.log(targetWords);
      let totalTargetWords = targetWords.length;
      let score = 100;
      let pointsPerWord = 100 / totalTargetWords;
      for (let i = 0; i < targetWords.length; i++) {
        let userWord = userWords[i];
        let targetWord = targetWords[i];
        if (!userWord) {
          score -= pointsPerWord;
        }
        else if (userWord === targetWord) {
          continue;
        }
        else if (userWord.toLowerCase() === targetWord.toLowerCase()) {
          score -= (pointsPerWord * 0.1);
        }
        else {
          if (userWords[i + 1] === targetWord || userWords[i + 2] === targetWord || userWords[i + 3] === targetWord) {
            score -= pointsPerWord;
            userWords.splice(i, 0, "");
          }
          else {
            score -= pointsPerWord;
          }
        }
      }
      if (score < 0) score = 0;
      displayScore(score);
    }
    function displayScore(score) {
      currentGameResultElement.innerHTML = `📉 Word-Based Score: ${Math.round(score)}%`;
      addScore(Math.round(score));
      isStarted = false;
      typingAreaElement.value = '';
      typingAreaElement.disabled=true;
      localStorage.removeItem('typedText');
      localStorage.removeItem('isStarted');
      localStorage.removeItem('end');
      localStorage.removeItem('sentence');
      resetButton();
    }
    function resetButton() {
      buttonElement.classList.remove('selected-button');
      buttonElement.innerText = "Let's Start";
      localStorage.setItem('changedButton',buttonElement.innerText);
    }

    function addScore(score) {
      scoreList.push(score);
      localStorage.setItem('scores', JSON.stringify(scoreList));
      renderScore();
    }
    function renderScore() {
      let listHTML = '';
      let sum = 0;
      for (let i = 0; i < scoreList.length; i++) {
        sum += scoreList[i];
        let scoreNumber = scoreList[i];
        listHTML += `<p>Attempt ${i + 1}: ${scoreNumber}%</p>`;
      }
      displayAverage(sum);
      overallResultElement.innerHTML = `Overall Score: ${listHTML}`;
    };
    function displayAverage(sum) {
      gameAverageScoreElement.innerHTML = scoreList.length === 0 ? `Average typing accuracy and speed: 0.00%` :
        `Average typing accuracy and speed: ${(sum / scoreList.length).toFixed(2)}%`;
    };
    function displayTarget() {
      let randomNumber = Math.random() * 30;
      let randomIndex = Math.floor(randomNumber);
      let sentence = typingSentences[randomIndex];
      targetTextElement.innerHTML = sentence;
      localStorage.setItem('sentence', sentence);
    };

    function renderSentence() {
    const savedSentence = localStorage.getItem('sentence');
    if(savedSentence) {
      targetTextElement.innerHTML = savedSentence;
    }
    else {
      displayTarget();
    }
    }

    