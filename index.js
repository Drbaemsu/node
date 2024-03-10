const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const MODEL_NAME = "gemini-1.0-pro-vision-latest";
const API_KEY = "AIzaSyD8Pm6y0UJaZnktPRculohQhso7XxAtusE"; // Replace with your actual API key

// Increase the limit for JSON body parser
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true })); // Replace with your actual API key

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/generate", async (req, res) => {
  try {
    const image = req.body.image; // 클라이언트로부터 이미지를 받음

    if (!image) {
      throw new Error("Image is missing");
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
      temperature: 0.4,
      topK: 32,
      topP: 1,
      maxOutputTokens: 4096,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      // ... 다른 safety 설정들
    ];

    const parts = [
      {
        text: "첨부된 이미지는 ... 이슈가 될 문구를 제시해 주세요.",
      },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: image, // 클라이언트로부터 받은 이미지 데이터
        },
      },
    ];

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
      safetySettings,
    });

    console.log("Server Response:", result.response.text()); // 서버 응답 로깅
    res.json({ response: result.response.text() });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
