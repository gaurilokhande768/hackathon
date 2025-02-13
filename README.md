
# 📊 Live Display Data Transmission System

## 📋 Overview
This project simulates a 12-digit display where each digit randomly changes in real-time. The changes are captured and stored on a remote server and a live database with minimal latency. A real-time dashboard visualizes the display changes dynamically. The project uses the following tech stack:
- **Redis**
- **MongoDB**
- **Socket.IO**
- **React.js**
- **HTTP**
- **Express**
- **TailwindCSS**

## 🔧 Requirements
1. **Display Simulation**: Simulate a 12-digit display where each digit changes randomly between 0 to 9 in real-time.
2. **Real-time Data Capture**: Capture each change in live data and store it on a remote server and a live database with minimal latency.
3. **Web/Mobile Dashboard**: Create a real-time dashboard to visualize the display changes dynamically.
4. **Efficient Transmission**: Implement an optimized data transmission mechanism to avoid excessive network load.
5. **Failure Handling**: Ensure data integrity and recovery mechanisms in case of server failure or network disconnection.

## 📥 Installation
1. **Clone the repository:**
   ```sh
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install server dependencies:**
   ```sh
   cd server
   npm install
   ```

3. **Install client dependencies:**
   ```sh
   cd client
   npm install
   ```

## 🚀 Usage
1. **Start the server:**
   ```sh
   cd server
   npm start
   ```

2. **Start the client:**
   ```sh
   cd client
   npm start
   ```

## 💻 Tech Stack
- **Backend:**
  - **Express.js**: Web framework for Node.js to build the server.
  - **Socket.IO**: Library for real-time web applications.
  - **Redis**: In-memory data structure store, used for capturing real-time data changes.
  - **MongoDB**: NoSQL database, used to store live data.

- **Frontend:**
  - **React.js**: JavaScript library for building user interfaces.
  - **TailwindCSS**: Utility-first CSS framework for styling.

## 🌐 API
### `GET /api/display`
- Description: Get the current display values.
- Response: 
  ```json
  {
    "data": [digit1, digit2, ..., digit12]
  }
  ```

## 🔒 Authentication
- Implement secure authentication for remote data access.

## 👥 Contributors
- [Om Kuthe](https://github.com/OmKuthe)
- [Anurag Borkar](https://github.com/anuragborkar2005)
- [Gauri Lokhande](https://github.com/gaurilokhande768)
```

I hope you find this updated version more engaging! 😊 Happy coding! 🚀
