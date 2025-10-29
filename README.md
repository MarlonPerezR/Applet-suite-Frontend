
# 🌐 Applet Suite Frontend

🧩 Description

Applet Suite Frontend is a React web project that showcases small and useful apps like a unit converter, a weather viewer, a chatbot, and more.
It features a clean and easy-to-use design and connects to a simple Spring Boot backend API.
This project was created for learning and demonstration purposes and does not use a database.

---
## 🎥 Project Presentation Video


---
## 🧱 Project Structure
```
Frontend/
├── build/                            # Production build (generated after npm run build)
├── node_modules/                     # Project dependencies
├── public/                           # Static public files (index.html, favicon, etc.)
│   └── index.html
│
├── src/                              # Main React source code
│   ├── components/                   # Applets and main components
│   │   ├── AppletBuscadorPeliculas.js
│   │   ├── AppletCalculadora.js
│   │   ├── AppletChatbot.js
│   │   ├── AppletClima.js
│   │   ├── AppletConversor.js
│   │   ├── AppletGeneradorColores.js
│   │   ├── AppletGeneradorPasswords.js
│   │   └── AppletReproductor.js
│   │
│   ├── App.css                       # Main styling file
│   ├── App.test.js                   # Unit tests for main components
│   ├── Applets.css                   # Styles specific to applets
│   ├── index.css                     # Global styles
│   ├── index.js                      # React entry point
│   ├── logo.svg                      # App logo
│   ├── reportWebVitals.js            # Performance tracking
│   └── setupTests.js                 # Jest setup file
│
├── .gitignore                        # Files and folders ignored by Git
├── package.json                      # Project dependencies and scripts
├── package-lock.json                 # Exact dependency versions
└── README.md                         # Project documentation
```


## How to Run the Project

1️⃣ Install dependencies
Make sure you have Node.js and npm installed, then run:

_npm install_

2️⃣ Start the development server

_npm start_

Open http://localhost:3000 in your browser to see the project.
The page will reload automatically when you make changes.

⚠️ Note: To make the project work correctly, you also need to run the backend available here: https://github.com/MarlonPerezR/Applet-suite-Backend

---
## Build for Production
To create an optimized version of the project for deployment:
npm run build 
This will create a build folder with all the static files ready for hosting on Vercel or another platform.

---
## 🛠️ Technologies Used
React – Frontend framework

JavaScript (ES6+) – Programming language

HTML5 / CSS3 – Interface and layout

Spring Boot – Backend  (You can see it in the Applet-suite-Backend repository)

Vercel – Frontend deployment 

Render – Backend deployment

---
## 👥 Developed By

Marlon Pérez R.

https://portfolio-mu-fawn-47.vercel.app/

https://github.com/MarlonPerezR

https://www.linkedin.com/in/marlonpérez/

---
## 📄 License

This project is for personal use. © 2025 Marlon Pérez - All rights reserved.
