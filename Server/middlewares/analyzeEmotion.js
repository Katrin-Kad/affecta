const fetch = require("node-fetch");

const analyzeEmotion = (text) => {
  return async () => {
    const response = await fetch(`${process.env.SERVER_URL}/analyze`, {
      method: "POST",
      body: JSON.stringify({ text }),
      headers: { "Content-Type": "application/json" }
    });
    const data = await response.json();
    return data;
  };
};

module.exports = analyzeEmotion;
