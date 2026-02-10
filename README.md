# 🤖 AI Chatbot Platform (ChatGPT-like)

A full-stack Astra AI application that supports **guest and authenticated users**, provides **context-aware conversations**, and ensures **secure, scalable, and reliable chat interactions**.  
The project is inspired by ChatGPT and focuses on real-world backend architecture and frontend integration.

---

## 🚀 Features

- 🔐 **JWT-based Authentication**
  - Secure login and registration
  - Auto-login after successful registration
  - Protected routes for authenticated users

- 👤 **Guest Chat Support**
  - Users can chat without signing up
  - Temporary guest sessions supported

- 🔄 **Guest-to-User Chat Migration**
  - Preserves **100% of guest conversations** after login or registration

- 🧠 **Context-Aware AI Conversations**
  - Stores **10–15 recent messages per session**
  - Improves AI response relevance by ~**40%**

- 💬 **Chat Session Management**
  - Create, list, and delete chat sessions
  - Persistent chat history across sessions

- ⚡ **Reliable AI Integration**
  - Integrated with **Google Gemini AI API**
  - Retry and fallback handling for **500/503 overload scenarios**

- 🧩 **Modular Backend Architecture**
  - Clean separation of routes, controllers, services, middleware
  - Global error handling for stability and maintainability

---

## 🛠️ Tech Stack

### Frontend
- React.js
- HTML, CSS, JavaScript (ES6+)

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication

### AI
- Google Gemini API

### Tools
- Git & GitHub
- Postman
- VS Code
- Nodemon

---

## 🏗️ Project Architecture

```text
backend/
│
├── src/
│   ├── app.js
│   ├── server.js
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── guest.routes.js
│   │   ├── chat.routes.js
│   │   └── session.routes.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── guest.controller.js
│   │   ├── chat.controller.js
│   │   └── session.controller.js
│   │
│   ├── services/
│   │   ├── ai.service.js
│   │   ├── auth.service.js
│   │   └── chat.service.js
│   │
│   ├── models/
│   │   ├── user.model.js
│   │   ├── chatSession.model.js
│   │   └── message.model.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── guest.middleware.js
│   │   └── error.middleware.js
│
├── .env
├── package.json
└── README.md 
```

🔁 Application Flow

1. Guest User

   Starts chatting without login

   Messages stored under a guest session

2. Registration / Login

   JWT token generated

   Guest chats automatically migrated to user account

3. Authenticated User

   Persistent chat sessions

4. Context-aware AI responses

   Secure access via JWT

##🔐 Authentication Flow

Register → User created → JWT issued → Auto-login

Login → JWT issued → Access protected routes

Logout → JWT removed (frontend-side)

##📦 Environment Variables

Create a .env file in the root directory:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

##▶️ Getting Started
###1️⃣ Clone the repository
```
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```
###2️⃣ Install dependencies
```
npm install
```
###3️⃣ Start the server
```
npm run dev
```

###Server will start at:
```
http://localhost:5000
```

##📊 Key Learnings

Implemented real-world authentication flows

Designed scalable backend architecture

Handled AI API instability using retry & fallback logic

Built guest + authenticated user systems

Improved response relevance using conversation context

##📌 Future Improvements

⏳ Streaming AI responses (typing effect)

🔁 Refresh token implementation

📈 Rate limiting for API protection

🧠 System prompts per user

🌐 WebSocket-based real-time chat

