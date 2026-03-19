# Eldritch Frontend

## Overview

**Eldritch** is a browser-based **multiplayer horror quiz RPG**, built as part of a **collaborative full-stack project**.

The frontend is built using **Phaser**, transforming a traditional web app into a **real-time, game-like experience**. Players battle eldritch monsters by answering questions, either solo or as part of a team.

This project demonstrates how a frontend can go beyond forms and pages — into **interactive systems, real-time gameplay, and immersive UI design**.

---

## 👥 Team Project

This was developed as part of a **group project**, where we collaborated on:

- designing the overall game architecture  
- integrating frontend and backend systems  
- building real-time multiplayer interactions  
- maintaining shared standards for code and structure  

### Frontend deals with

- 🎮 Phaser-based game scenes and rendering  
- ⚔️ Encounter / battle system UI  
- 🧠 Real-time event handling (rounds, results, transitions)  
- 🎭 Player and monster animation systems  
- 💬 Team speech bubble system and UX polish  
- 🔄 Multiplayer flow integration with backend events  

---

## 🎮 Gameplay Experience

Players:

- choose a character  
- enter solo or multiplayer mode  
- answer timed questions  
- deal damage through correct answers  
- take damage through incorrect answers  
- progress through multiple stages  
- fight increasingly difficult monsters  

---

## 🧱 Tech Stack

### Core
- JavaScript  
- Phaser  
- Vite  

### Real-Time Integration
- WebSockets (event-driven gameplay)  
- Custom API layer for:
  - room management  
  - round lifecycle  
  - answer submission  
  - game state updates  

### Frontend Systems
- Scene-based architecture  
- Modular UI components  
- Animation / FX systems  
- Local storage (player/session data)  

---

## 🧩 Frontend Responsibilities

The frontend acts as the **game client**, responsible for everything the player sees and interacts with.

### Key Systems

#### 🎬 Scene Management
- Home / title screen  
- Character selection  
- Multiplayer lobby  
- Battle / encounter scene  
- Victory / defeat screens  

#### ⚔️ Encounter System
- Dynamic monster rendering  
- Player sprite management  
- Question + answer UI  
- Health bar updates  
- Countdown timer  
- Stage transitions  

#### 🔌 Real-Time Event Handling
- `onRoundStarted`  
- `onRoundResult`  
- `onGameEnded`  
- lobby updates  

#### ✨ Visual Feedback
- Monster hit effects  
- Player damage animations  
- Idle animations  
- Stage overlays  
- Speech bubbles for team reactions  

---

## 🌟 Key Features

- 🎮 Fully interactive Phaser game in the browser  
- 👥 Real-time multiplayer gameplay  
- 🧠 Quiz-driven combat system  
- ⏱️ Timed decision making  
- 💥 Animated battle feedback  
- 🧾 Modular, scalable frontend structure  

---

## 🏗️ Architecture Approach

The frontend is structured to separate concerns:

- **Scenes** → high-level flow  
- **UI modules** → rendering & layout  
- **FX modules** → animations  
- **Controllers** → game logic coordination  
- **API layer** → backend communication  

This made the project easier to maintain and debug, especially when handling real-time multiplayer events.

---

## 🧠 Challenges & Solutions

### Real-time Synchronisation
Handling multiple players required careful control of:

- event timing  
- state updates  
- animation completion  

**Solution:**
- introduced controlled flow (`clientReady`)  
- managed pending states and transitions safely  

---

### Game Feel vs Performance
Balancing:

- responsiveness  
- animation polish  
- gameplay speed  

**Solution:**
- asynchronous FX handling  
- fallback timers for safety  
- non-blocking animations  

---

### Browser-Based Game Design
Building a game in a web environment required:

- scene lifecycle control  
- event-driven architecture  
- structured rendering logic  

---

## 🚀 What This Shows

This project highlights my ability to:

- build **interactive, non-traditional frontends**  
- work with **real-time systems and async flows**  
- design **modular and scalable UI architecture**  
- collaborate effectively in a **team environment**  
- combine **technical skill with creative design**  

---

## 🔮 Future Improvements

- Leaderboard system  
- Player progression / stats  
- Mobile optimisation  
- Reconnection handling  
- Enhanced animations and polish  

---

## 🛠️ Running Locally

```bash
npm install
npm run dev
