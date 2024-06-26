// backend/avatarClient.js

const WebSocket = require('ws');
const fetch = require('node-fetch');

const heygen_API = {
  apiKey: 'MzlkM2Y5MzFiYTgwNDE1N2FmNjE0ZDAxM2FkNzQ0OTctMTcxODUyMDMxMg==', // Replace with your actual API key
  serverUrl: 'https://api.heygen.com',
};

let sessionInfo = null;
let peerConnection = null;

async function createNewSession() {
  try {
    const avatar = 'Tyler-incasualsuit-20220721';
    const voice = 'd7bbcdd6964c47bdaae26decade4a933';

    const response = await fetch(`${heygen_API.serverUrl}/v1/streaming.new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': heygen_API.apiKey,
      },
      body: JSON.stringify({
        quality: 'high',
        avatar_name: avatar,
        voice: {
          voice_id: voice,
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      sessionInfo = data.data;
      return sessionInfo;
    } else {
      throw new Error('Error creating new session');
    }
  } catch (error) {
    console.error('Error creating new session:', error);
    throw error;
  }
}

async function startSession(session_id, sdp) {
  try {
    const response = await fetch(`${heygen_API.serverUrl}/v1/streaming.start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': heygen_API.apiKey,
      },
      body: JSON.stringify({ session_id, sdp }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.data;
    } else {
      throw new Error('Error starting session');
    }
  } catch (error) {
    console.error('Error starting session:', error);
    throw error;
  }
}

async function handleICE(session_id, candidate) {
  try {
    const response = await fetch(`${heygen_API.serverUrl}/v1/streaming.ice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': heygen_API.apiKey,
      },
      body: JSON.stringify({ session_id, candidate }),
    });

    if (!response.ok) {
      throw new Error('Error handling ICE candidate');
    }
  } catch (error) {
    console.error('Error handling ICE candidate:', error);
    throw error;
  }
}

async function sendTaskToAvatar(session_id, text) {
  try {
    const response = await fetch(`${heygen_API.serverUrl}/v1/streaming.task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': heygen_API.apiKey,
      },
      body: JSON.stringify({ session_id, text }),
    });

    if (!response.ok) {
      throw new Error('Error sending task to avatar');
    }
  } catch (error) {
    console.error('Error sending task to avatar:', error);
    throw error;
  }
}

async function closeConnection(session_id) {
  try {
    await fetch(`${heygen_API.serverUrl}/v1/streaming.stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': heygen_API.apiKey,
      },
      body: JSON.stringify({ session_id }),
    });
  } catch (error) {
    console.error('Error closing connection:', error);
  }
}

// Background removal function
function removeBackground(imageData) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];

    if (isCloseToGreen([red, green, blue])) {
      data[i + 3] = 0; // Set alpha to 0 (transparent)
    }
  }
  return imageData;
}

function isCloseToGreen(color) {
  const [red, green, blue] = color;
  return green > 90 && red < 90 && blue < 90;
}

module.exports = {
  createNewSession,
  startSession,
  handleICE,
  sendTaskToAvatar,
  closeConnection,
  removeBackground,
};