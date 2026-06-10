import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { connectDB, db } from "./db.js";
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import verifyToken from "./middleware/verifyToken.js";
import moment from "moment";

dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

const Ai = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(Ai);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });


const app = express();
const port = process.env.PORT || 3000;

const frontendURL = process.env.FRONTEND_URL;
const isProduction = process.env.NODE_ENV === "production";

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || origin.startsWith("http://localhost")) {
        callback(null, true);
      } else {
        callback(null, frontendURL);
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

connectDB(); // Connect to the MongoDB database

const upload = multer({ storage: multer.memoryStorage() });

// const credentials = JSON.parse(
//   Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, "base64").toString()
// );

// const client = new ImageAnnotatorClient({ credentials });

const generateAuthToken = (user) => {
  const payload = {
    userId: user._id, // You can include additional data in the payload if needed
  };

  // Sign the JWT with a secret key (make sure to keep this key safe and private)
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" }); // Expires in 1 hour
};

app.get("/test", (req, res) => {
  // test code for backend preventing from sleep
  res.send("Hello World!");
});
// Endpoint to handle POST requests
app.get("/products/:id", async (req, res) => {
  const barcode = req.params.id;
  console.log("Barcode:", barcode);

  try {
    const snapshot = await db.collection("products").where("barcode", "==", barcode).get();
    if (!snapshot.empty) {
      console.log("Product found in the database");
      res.json(snapshot.docs[0].data());
    } else {
      console.log("Product not found in the database");
      res.json({ message: "Product not found" });
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).send("Error fetching product from the database");
  }
});

app.post("/chat", async (req, res) => {
  console.log(req.body); // Log the entire body to see if it arrives correctly

  const productName = req.body.prompt; // This should work
  const barcode = req.body.barcode; // This should work

  console.log("Barcode:", barcode); // Log barcode to check its value
  console.log("Product Name:", productName);

  if (!productName) {
    return res.status(400).send("Prompt is required");
  }

  try {
    const prompt = `Please provide the details of the following product in the JSON format:
        Product Name: ${productName}
        the ${productName} may have spelling mistakes , correct it accordingly.
        Ensure the spelling of the brand is correct by searching internet.
        Ensure the product name only consist of name of the product and not any other details.
        {
          "product_name": "<Product Name>",
          "brand": "<Brand Name>",
          "category": "<Category>",
          "description": "<Description>"
          "ingredients": ["<Ingredient 1>", "<Ingredient 2>", "<Ingredient 3>", ... all possible ingredients  - means put all falvouring , acidity regulators and more .],
          "nutritional_info_per100g": 
          {
            "calories": "<Calories>",
            "fat": "<Fat>",
            "saturated_fat": "<Saturated Fat>",
            "trans_fat":"<Trans Fat>",
            "carbohydrates": "<Carbohydrates>",
            "sugar": "<Sugar>",
            "protein": "<Protein>",
            "fiber": "<Fiber>",
            "cholesterol": "<Cholesterol>",
            "sodium": "<Sodium>",
          }
          "weight": "<Show the weights available in the market>"
        }
        IMP-The nutritional_info_per100g should be PER 100G OF PRODUCT.
        Please do not include any text or explanation, only return the JSON object.dont include the json beginning text and backticks.
        Also put up all the nutritional info and all the ingredients possible - means put all falvouring , acidity regulators and more .
        Dont put any SI units in the nutritional info.
        weight should not be in array format and be with si units ex :"available in w1g , w2g etc.. " Include etc as well.
        Category should be from these only "Snacks","Spreads", "Sweets", "Beverages", "Dairy", "Ready-to-Eat", "Breakfast", "Bakery", "Frozen Foods", "Condiments", "Canned Goods", "Protein", "Cooking Essentials","Others".
        
        `;
    // Call the OpenAI API using the library
    const result = await model.generateContent(prompt);
    let rawResponse = result.response.text();
    rawResponse = rawResponse.replace(/```json|```/g, "").trim();
    // console.log("Raw response:", rawResponse);
    let productData = null;
    //////////////////////////////////////////////////////////////////////
    try {
      // Try parsing the response as JSON
      productData = JSON.parse(rawResponse);

      // Now you have the product details in productData
      console.log(productData);
    } catch (error) {
      console.error("Error parsing product details:", error);
    }

    //////////////////////////////////////////////////////////////////////
    productData.accuracy = 70; // Add the accuracy to the product data
    productData.barcode = barcode;
    await db.collection("products").add(productData);
    console.log("Product saved to the database");

    // Send the API response back to the client
    res.json({
      reply: productData, // Extract the generated response
    });
  } catch (error) {
    console.error("Error interacting with AI:", error);
    res.status(500).send("Error interacting with the AI API");
  }
});


app.post(
  "/detect",
  upload.fields([{ name: "nutriImage" }, { name: "ingredImage" }]),
  async (req, res) => {
    console.log("Request received at /detect!");

    const realBarcode = req.body.barcode;
    console.log("Barcode:", realBarcode);

    if (!req.files || !req.files.nutriImage || !req.files.ingredImage) {
      return res.status(400).json({ error: "Files not received!" });
    }

    try {
      // Convert buffers to base64 for Gemini
      const nutriBase64 = req.files.nutriImage[0].buffer.toString("base64");
      const ingredBase64 = req.files.ingredImage[0].buffer.toString("base64");

      // Prompt for Nutrition JSON
      const nutriPrompt = `Extract nutritional info from this image.
Convert it into JSON:
{
  "nutritional_info_per100g": {
    "calories": "<Calories>",
    "fat": "<Fat>",
    "saturated_fat": "<Saturated Fat>",
    "trans_fat": "<Trans Fat>",
    "carbohydrates": "<Carbohydrates>",
    "sugar": "<Sugar>",
    "protein": "<Protein>",
    "fiber": "<Fiber>",
    "cholesterol": "<Cholesterol>",
    "sodium": "<Sodium>"
  }
}
Return exactly and only this JSON structure. If you cannot read the image, or it is not a label, return the JSON with all values as 0. Use numeric values only, no units. It should be per 100g of the product. No extra text or markdown.`;

      // Prompt for Ingredients JSON
      const ingredPrompt = `Extract ingredients from this image.
Convert it into JSON:
{
  "ingredients": ["<Ingredient 1>", "<Ingredient 2>", ...]
}
Use Title Case for ingredients. Return exactly and only this JSON structure. If you cannot read the image, return {"ingredients": []}. No extra text or markdown.`;

      // Send both images + prompts to Gemini in parallel
      // Send requests sequentially to avoid strict concurrency limits (429 errors)
      const nutriResult = await model.generateContent({
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: req.files.nutriImage[0].mimetype,
                  data: nutriBase64,
                },
              },
              { text: nutriPrompt },
            ],
          },
        ],
      });

      const ingredResult = await model.generateContent({
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: req.files.ingredImage[0].mimetype,
                  data: ingredBase64,
                },
              },
              { text: ingredPrompt },
            ],
          },
        ],
      });

      let rawnutriResponse = nutriResult.response.text().trim();
      let rawingredResponse = ingredResult.response.text().trim();

      // Remove markdown code block fences if present
      rawnutriResponse = rawnutriResponse.replace(/```json|```/g, "");
      rawingredResponse = rawingredResponse.replace(/```json|```/g, "");

      let realNutriData = null;
      let realIngredData = null;

      try {
        realNutriData = JSON.parse(rawnutriResponse);
        realIngredData = JSON.parse(rawingredResponse);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        console.error("Raw Nutri:", rawnutriResponse);
        console.error("Raw Ingred:", rawingredResponse);
        return res.status(422).json({ error: "Could not read the labels clearly. Please try again with better lighting and a closer shot." });
      }

      // Save to DB
      const snapshot = await db.collection("products").where("barcode", "==", realBarcode).get();
      if (!snapshot.empty) {
        const docId = snapshot.docs[0].id;
        const productData = snapshot.docs[0].data();
        productData.nutritional_info_per100g = realNutriData.nutritional_info_per100g;
        productData.ingredients = realIngredData.ingredients;
        productData.accuracy = 90;

        await db.collection("products").doc(docId).set(productData, { merge: true });
        res.json({
          message: "Product updated successfully",
          product: productData,
        });
      } else {
        // Create a new product if no barcode matches or barcode is null
        const newBarcode = (!realBarcode || realBarcode === "null") ? `ocr_${Date.now()}` : realBarcode;
        const newProduct = {
          barcode: newBarcode,
          nutritional_info_per100g: realNutriData.nutritional_info_per100g || {},
          ingredients: realIngredData.ingredients || [],
          accuracy: 90,
          product_name: "Unknown Product (Scanned via OCR)",
          brand: "Unknown Brand",
          description: "Details extracted via AI OCR"
        };
        await db.collection("products").add(newProduct);

        res.json({
          message: "Product created from OCR",
          product: newProduct
        });
      }
    } catch (error) {
      console.error(error);
      const isRateLimit = error.status === 429 || error.message?.includes("429") || error.statusText === 'Too Many Requests';
      if (isRateLimit) {
        return res.status(429).json({ error: "AI rate limit reached. Please wait 60 seconds and try again." });
      }
      res.status(500).json({ error: "Error processing images with Gemini API. " + (error.message || "") });
    }
  }
);

// app.post(
//   "/detect",
//   upload.fields([{ name: "nutriImage" }, { name: "ingredImage" }]),
//   async (req, res) => {
//     console.log("Request received at /detect!");

//     const realBarcode = req.body.barcode;
//     console.log("Barcode:", realBarcode);

//     console.log("Files:", req.files); // Log uploaded files

//     if (!req.files || !req.files.nutriImage || !req.files.ingredImage) {
//       return res.status(400).json({ error: "Files not received!" });
//     }
//     // do the OCR processing here

//     try {
//       // Perform text detection on nutriImage
//       const [nutriResult] = await client.textDetection(
//         req.files.nutriImage[0].buffer
//       );
//       const nutriDetections = nutriResult.textAnnotations;

//       // Perform text detection on ingredImage
//       const [ingredResult] = await client.textDetection(
//         req.files.ingredImage[0].buffer
//       );
//       const ingredDetections = ingredResult.textAnnotations;

//       // If text was detected in both images
//       if (nutriDetections.length > 0 && ingredDetections.length > 0) {
//         let nutriText = nutriDetections[0].description;
//         let ingredText = ingredDetections[0].description;

//         console.log("Text from Nutri Image:", nutriText);
//         console.log("Text from Ingredients Image:", ingredText);

//         // Generate the prompt for AI model using both texts

//         const nutriPrompt = `Nutri Text : ${nutriText} 

//       convert this into JSON of 
//       // Every field should have a numeric value. If the value is not present, use 0.
//       {
//         "nutritional_info_per100g": {
//           "calories": "<Calories>",
//           "fat": "<Fat>",
//           "saturated_fat": "<Saturated Fat>",
//           "trans_fat": "<Trans Fat>",
//           "carbohydrates": "<Carbohydrates>",
//           "sugar": "<Sugar>",
//           "protein": "<Protein>",
//           "fiber": "<Fiber>",
//           "cholesterol": "<Cholesterol>",
//           "sodium": "<Sodium>"
//         }
//       }

//       // only fill numeric values with no si unts in case of nutritional info.
//       // It should be per 100g of the product.
//       Return JSON only.`;

//         const ingredPrompt = `Ingred Text : ${ingredText}

//       convert this into JSON of
//       {
//         "ingredients": ["<Ingredient 1>", "<Ingredient 2>", "<Ingredient 3>", ... all possible ingredients  - means put all falvouring , acidity regulators and more .]
//       }
//       // only use Title Case for the ingredients.
//       // only return the JSON object. dont include the json beginning text and backticks.`;

//         // Generate content with AI model
//         const nutriResult = await model.generateContent(nutriPrompt);
//         const ingredResult = await model.generateContent(ingredPrompt);
//         let rawnutriResponse = nutriResult.response.text();
//         let rawingredResponse = ingredResult.response.text();

//         rawnutriResponse = rawnutriResponse.replace(/```json|```/g, "").trim();
//         rawingredResponse = rawingredResponse
//           .replace(/```json|```/g, "")
//           .trim();

//         console.log("Raw response from Nutri Image:", rawnutriResponse);
//         console.log("Raw response from Ingredients Image:", rawingredResponse);

//         let realNutriData = null;
//         let realIngredData = null;
//         try {
//           // Try parsing the response as JSON
//           realNutriData = JSON.parse(rawnutriResponse);
//           realIngredData = JSON.parse(rawingredResponse);
//           console.log("Parsed JSON of Nutri Data:", realNutriData);
//           console.log("Parsed JSON of Ingred Data:", realIngredData);
//         } catch (error) {
//           console.error("Error parsing JSON:", error);
//         }
//         if (realNutriData && realIngredData) {
//           try {
//             const product = await Product.findOne({ barcode: realBarcode });

//             if (product) {
//               product.nutritional_info_per100g =
//                 realNutriData.nutritional_info_per100g;
//               product.ingredients = realIngredData.ingredients;
//               product.accuracy = 90;

//               await product.save();
//               console.log("Product updated in the database");

//               res.json({
//                 message: "Product updated successfully",
//                 product: product,
//               });
//             } else {
//               console.log("Product not found in the database");
//               res.json({ message: "Product not found" });
//             }
//           } catch (error) {
//             console.error("Error fetching product:", error);

//             res.status(500).send("Error fetching product from the database");
//           }
//         } else {
//           return res.status(404);
//         }
//       } else {
//         res.status(404).send("No text detected in one or both images.");
//       }
//     } catch (error) {
//       console.error(error);
//       res.status(500).send("Error processing the images or AI generation.");
//     }
//   }
// );

// app.post(
//   "/detect",
//   upload.fields([{ name: "nutriImage" }, { name: "ingredImage" }]),
//   async (req, res) => {
//     console.log("Request received at /detect!");

//     const realBarcode = req.body.barcode;
//     console.log("Barcode:", realBarcode);

//     if (!req.files || !req.files.nutriImage || !req.files.ingredImage) {
//       return res.status(400).json({ error: "Files not received!" });
//     }

//     try {
//       // Convert images to base64
//       const nutriBase64 = req.files.nutriImage[0].buffer.toString("base64");
//       const ingredBase64 = req.files.ingredImage[0].buffer.toString("base64");

//       // Build Gemini prompt
//       const prompt = `
// You are given two images: one is a nutrition label, and the other is an ingredients label from a food product.
// 1. Extract the nutritional information per 100g from the nutrition label image and return it as JSON in this format (numeric values only, no units, use 0 if missing):

// {
//   "nutritional_info_per100g": {
//     "calories": "<Calories>",
//     "fat": "<Fat>",
//     "saturated_fat": "<Saturated Fat>",
//     "trans_fat": "<Trans Fat>",
//     "carbohydrates": "<Carbohydrates>",
//     "sugar": "<Sugar>",
//     "protein": "<Protein>",
//     "fiber": "<Fiber>",
//     "cholesterol": "<Cholesterol>",
//     "sodium": "<Sodium>"
//   }
// }

// 2. Extract all ingredients from the ingredients label image and return as JSON in this format (Title Case, include all possible ingredients, including additives):

// {
//   "ingredients": ["<Ingredient 1>", "<Ingredient 2>", ...]
// }

// Return only the two JSON objects, nothing else, no explanations or markdown.
// `;

//       // Prepare Gemini API call
//       const result = await model.generateContent({
//         contents: [
//           {
//             role: "user",
//             parts: [
//               { text: prompt },
//               {
//                 inlineData: {
//                   data: nutriBase64,
//                   mimeType: req.files.nutriImage[0].mimetype,
//                 },
//               },
//               {
//                 inlineData: {
//                   data: ingredBase64,
//                   mimeType: req.files.ingredImage[0].mimetype,
//                 },
//               },
//             ],
//           },
//         ],
//       });

//       let responseText = result.response.text();
//       // Remove markdown/code block if present
//       responseText = responseText.replace(/```json|```/g, "").trim();

//       // Try to extract both JSON objects from the response
//       let nutriData = null;
//       let ingredData = null;
//       try {
//         // Try to parse two JSON objects from the response
//         const matches = responseText.match(/\{[\s\S]*?\}/g);
//         if (matches && matches.length >= 2) {
//           nutriData = JSON.parse(matches[0]);
//           ingredData = JSON.parse(matches[1]);
//         }
//       } catch (err) {
//         console.error("Error parsing Gemini response:", err);
//       }

//       if (nutriData && ingredData) {
//         try {
//           const product = await Product.findOne({ barcode: realBarcode });

//           if (product) {
//             product.nutritional_info_per100g = nutriData.nutritional_info_per100g;
//             product.ingredients = ingredData.ingredients;
//             product.accuracy = 90;

//             await product.save();
//             console.log("Product updated in the database");

//             res.json({
//               message: "Product updated successfully",
//               product: product,
//             });
//           } else {
//             console.log("Product not found in the database");
//             res.json({ message: "Product not found" });
//           }
//         } catch (error) {
//           console.error("Error fetching product:", error);
//           res.status(500).send("Error fetching product from the database");
//         }
//       } else {
//         res.status(422).json({ error: "Could not extract data from images." });
//       }
//     } catch (error) {
//       console.error(error);
//       res.status(500).send("Error processing the images or AI generation.");
//     }
//   }
// );

app.post("/register", async (req, res) => {
  try {
    const { username, password, name, ...otherDetails } = req.body;

    // Check if user already exists
    const existingUserSnapshot = await db.collection("users").where("username", "==", username).get();
    if (!existingUserSnapshot.empty) {
      console.log("Username already exists!");
      return res.json({ message: "Username already exists!" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save new user
    await db.collection("users").add({
      username,
      password: hashedPassword,
      name,
      ...otherDetails,
    });

    res.json({ message: "verified" });
  } catch (error) {
    console.error("Error Registering User:", error);
    res.json({ message: "Server Error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the user exists
    const userSnapshot = await db.collection("users").where("username", "==", username).get();
    if (userSnapshot.empty) {
      return res.json({ message: "User not found!" });
    }
    const userDoc = userSnapshot.docs[0];
    const user = userDoc.data();

    // Compare the hashed password with the entered password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ message: "Invalid Username or Password!" });
    }

    // If password matches, you can generate a JWT and send it
    const token = generateAuthToken({ _id: userDoc.id }); // Mock user object for JWT
    res.cookie("token", token, {
      httpOnly: isProduction, // Prevents client-side access
      secure: isProduction, // Secure in production (HTTPS only)
      sameSite: isProduction ? "None" : "Lax", // Helps prevent CSRF attacks
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    });

    console.log("token", token);

    res.json({ message: "Login successful", token }); // Respond with token
  } catch (error) {
    console.error("Error Logging in:", error);
    res.json({ message: "Server Error" });
  }
});

app.get("/me", verifyToken, async (req, res) => {
  console.log("✅ Received request at /me");
  try {
    console.log("User ID:", req.user.userId);
    const userDoc = await db.collection("users").doc(req.user.userId).get();
    if (!userDoc.exists) throw new Error("User not found");
    res.json({ me: userDoc.data() });
  } catch (error) {
    console.log("Error finding user");
    res.json({ message: "User not found" });
  }
});

app.put("/update-user", verifyToken, async (req, res) => {
  try {
    await db.collection("users").doc(req.user.userId).set(req.body, { merge: true });
    const userDoc = await db.collection("users").doc(req.user.userId).get();
    if (!userDoc.exists) return res.json({ message: "User not found" });

    res.json({ updatedUser: userDoc.data() });
  } catch (error) {
    console.error("Error updating user:", error);
    res.json({ message: "Failed to update user data" });
  }
});

app.post("/logout", (req, res) => {
  res.cookie("token", "", {
    httpOnly: isProduction,
    secure: isProduction, // Only send over HTTPS
    sameSite: "None",
    expires: new Date(0), // Expire the cookie immediately
  });

  res.json({ message: "Logged out successfully" });
});

app.post("/history", verifyToken, async (req, res) => {
  try {
    console.log("Reached history route");

    const userId = req.user.userId;
    const { product } = req.body; // Barcode
    console.log("Scanned Barcode:", product);

    const productSnapshot = await db.collection("products").where("barcode", "==", product).get();

    if (productSnapshot.empty) {
      return res.json({ message: "Product not found in database" });
    }

    const productId = productSnapshot.docs[0].id;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingHistorySnapshot = await db.collection("history")
      .where("user", "==", userId)
      .where("product", "==", productId)
      .where("timestamp", ">=", startOfDay)
      .where("timestamp", "<=", endOfDay)
      .get();

    if (!existingHistorySnapshot.empty) {
      console.log("Existing history entry found for today. Deleting...");
      const batch = db.batch();
      existingHistorySnapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }

    await db.collection("history").add({
      user: userId,
      product: productId,
      timestamp: new Date()
    });

    res.json({ message: "History updated successfully!" });
  } catch (error) {
    console.error("Error saving history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/history", verifyToken, async (req, res) => {
  console.log("gotcha");
  try {
    console.log("Fetching history...");
    const userId = req.user.userId;
    console.log("userId", userId);

    const historySnapshot = await db.collection("history")
      .where("user", "==", userId)
      .orderBy("timestamp", "desc")
      .get();

    if (historySnapshot.empty) {
      return res.json({ message: "No history found" });
    }

    const history = [];
    for (const doc of historySnapshot.docs) {
      const data = doc.data();
      const productDoc = await db.collection("products").doc(data.product).get();
      // Ensure timestamp is converted to JS Date correctly depending on how Firestore stores it
      const timestamp = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
      history.push({ ...data, timestamp, product: productDoc.exists ? productDoc.data() : null });
    }

    const groupedHistory = {};

    history.forEach((entry) => {
      const date = moment(entry.timestamp).format("YYYY-MM-DD");
      if (!groupedHistory[date]) {
        groupedHistory[date] = [];
      }
      groupedHistory[date].push(entry);
    });

    console.log("Grouped History:", groupedHistory);
    res.json({ history: groupedHistory });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/history", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const historySnapshot = await db.collection("history").where("user", "==", userId).get();
    const batch = db.batch();
    historySnapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    res.json({ message: "History cleared successfully" });
  } catch (error) {
    res.json({ error: "Failed to clear history" });
  }
});

app.post("/ai-insights", async (req, res) => {
  console.log(req.body);

  const userDetails = req.body.userData;
  const productData = req.body.productDetails;

  try {
    const prompt = `This is the user Details : ${JSON.stringify(userDetails, null, 2)} and this is the product details : ${JSON.stringify(productData, null, 2)}
      Please provide the insights of the product in the JSON format:
      {
      "Product": {
        "name": "",
        "brand": "",
        "category": "",
        "description": ""
      },
      "ultimate_recommendation": {
        "overall_suitability": {
          "status": "",
          "reason": ""
        },
        "better_alternatives": {
          "status": "",
          "alternatives": [item1,item2,item3 .. all the alternatives],
          "note": ""
        },
        "if_you_still_want_to_consume": {
          "status": "",
          "recommendation": ""
        }
      },
      "health_analysis": {
        "concerns": {
          "item1": {
            "status": "",
            "reason": ""
          },
          "item2": {
            "status": "",
            "reason": ""
          },
          "item3": {
            "status": "",
            "reason": ""
          },"item4": {},"item5":{}.......include all the concerns
        },
        "positives": {
          "item1": {
            "status": "",
            "reason": ""
          },
          "item2": {
            "status": "",
            "reason": ""
          },"item3": {},"item4":{}.......include all the positives
        }
      },
      "nutritional_analysis": {
      The value shoulb be with si units only.
        "calories": {
          "value": "",
          "impact": ""
        },
        "fat": {
          "value": "",
          "impact": ""
        },
        "saturated_fat": {
          "value": "",
          "impact": ""
        },
        "trans_fat": {
          "value": "",
          "impact": ""
        },
        "carbohydrates": {
          "value": "",
          "impact": ""
        },
        "sugar": {
          "value": "",
          "impact": ""
        },
        "protein": {
          "value": "",
          "impact": ""
        },
        "fiber": {
          "value": "",
          "impact": ""
        },
        "cholesterol": {
          "value": "",
          "impact": ""
        },
        "sodium": {
          "value": "",
          "impact": ""
        }
      },
      "ingredient_analysis": {
        "ingri1": {
          "status": "",
          "ingredients": ["ing1", "ing2", "ing3"],
          "impact": ""
        },
        "ingri2": {
          "status": "",
          "ingredients": ["ing1", "ing2", "ing3"],
          "impact": ""
        },
        "ingri3": {
          "status": "",
          "ingredients": ["ing1", "ing2", "ing3"],
          "impact": ""
        },"ingri4": {},"ingri5":{}.......include all the ingredients
      }
    }
    The productDetails and userDetails should be taken correctly , no mistakes to be made,The content provided should be small.

    `;
    console.log("Prompt:", prompt);
    // Call the OpenAI API using the library
    const result = await model.generateContent(prompt);
    let rawResponse = result.response.text();
    rawResponse = rawResponse.replace(/```json|```/g, "").trim();
    // console.log("Raw response:", rawResponse);
    let aiAnalysedData = null;
    //////////////////////////////////////////////////////////////////////
    try {
      // Try parsing the response as JSON
      aiAnalysedData = JSON.parse(rawResponse);

      // Now you have the product details in productData
      console.log(aiAnalysedData);
    } catch (error) {
      console.error("Error parsing product details:", error);
    }

    //////////////////////////////////////////////////////////////////////

    // Send the API response back to the client
    res.json({
      reply: aiAnalysedData, // Extract the generated response
    });
  } catch (error) {
    console.error("Error interacting with AI:", error);
    res.status(500).send("Error interacting with the AI API");
  }
});

app.get("/check/:barcode", verifyToken, async (req, res) => {
  try {
    console.log("Checking cart...");
    const userId = req.user.userId;
    const barcode = req.params.barcode;

    const productSnapshot = await db.collection("products").where("barcode", "==", barcode).get();

    if (productSnapshot.empty) {
      return res.json({ inCart: false, message: "Product not found" });
    }
    const productId = productSnapshot.docs[0].id;

    const userCartDoc = await db.collection("carts").doc(userId).get();

    if (!userCartDoc.exists) {
      return res.json({ inCart: false });
    }

    const userCart = userCartDoc.data();
    const isInCart = userCart.products && userCart.products.some(item => item.product === productId);

    res.json({ inCart: isInCart });
  } catch (error) {
    console.error("Error checking cart:", error);
    res.json({ message: "Server error" });
  }
});

app.post("/add-to-cart", verifyToken, async (req, res) => {
  try {
    console.log("Adding to cart...");
    const userId = req.user.userId;
    const barcode = req.body.id;

    const productSnapshot = await db.collection("products").where("barcode", "==", barcode).get();

    if (productSnapshot.empty) {
      return res.json({ success: false, message: "Product not found" });
    }
    const productId = productSnapshot.docs[0].id;

    const cartRef = db.collection("carts").doc(userId);
    const cartDoc = await cartRef.get();

    if (!cartDoc.exists) {
      await cartRef.set({ userId, products: [{ product: productId, addedAt: new Date() }] });
      return res.json({ success: true });
    }

    const userCart = cartDoc.data();
    const products = userCart.products || [];
    const isInCart = products.some(item => item.product === productId);

    if (!isInCart) {
      products.push({ product: productId, addedAt: new Date() });
      await cartRef.update({ products });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/getcart", verifyToken, async (req, res) => {
  try {
    console.log("Fetching cart...");
    const userId = req.user.userId;

    const cartDoc = await db.collection("carts").doc(userId).get();

    if (!cartDoc.exists) {
      return res.json({ products: [] });
    }

    const cartData = cartDoc.data();
    const populatedProducts = [];

    if (cartData.products) {
      for (const item of cartData.products) {
        const productDoc = await db.collection("products").doc(item.product).get();
        if (productDoc.exists) {
          populatedProducts.push({
            product: { _id: productDoc.id, ...productDoc.data() },
            addedAt: item.addedAt
          });
        }
      }
    }

    res.json({ products: populatedProducts });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.json({ message: "Server error" });
  }
});

app.delete("/deletecart/:id", verifyToken, async (req, res) => {
  try {
    console.log("Removing product from cart...");
    const { id } = req.params; // Firestore product document ID
    console.log("Product ID:", id);

    const cartRef = db.collection("carts").doc(req.user.userId);
    const cartDoc = await cartRef.get();

    if (!cartDoc.exists) {
      return res.json({ message: "Cart not found" });
    }

    const cartData = cartDoc.data();
    const originalLength = cartData.products ? cartData.products.length : 0;

    cartData.products = (cartData.products || []).filter(item => item.product !== id);

    if (cartData.products.length === originalLength) {
      return res.json({ message: "Product not present in cart" });
    }

    await cartRef.update({ products: cartData.products });

    console.log("Product removed successfully");
    res.json({ message: "Product removed successfully", cart: cartData });

  } catch (error) {
    console.error("Error deleting product:", error);
    res.json({ error: "Failed to remove product" });
  }
});

app.post("/cmpresult", async (req, res) => {

  const data = req.body.products;
  console.log("data", data);

  try {
    const prompt = `Generate a JSON response that compares multiple food products ${data} based on their nutritional value. The JSON should follow this structure:

    {
  "comparison": {
    "products": [
      {
        "name": "Product Name",
        "category": "Category",
        "score": Number,
        "reason": "A brief analysis of the product's nutritional value, including its benefits and drawbacks.",
        "additional_points": [
          "Key point 1 about the product’s health impact.",
          "Key point 2 about ingredients, nutrients, or concerns.",
          "Key point 3 related to its consumption and effects."
        ]
      }
    ],
    "best_product": "The product with the best overall score and nutritional value.",
    "overall_reason": "An overall summary of why the best product was chosen compared to others."
  }
}
  Provide a comparison of given different food products. Ensure the analysis includes health concerns like sugar, sodium, artificial ingredients, and beneficial nutrients like fiber or protein.The content should be very less.
    `;
    console.log("Prompt:", prompt);
    // Call the OpenAI API using the library
    const result = await model.generateContent(prompt);
    let rawResponse = result.response.text();
    rawResponse = rawResponse.replace(/```json|```/g, "").trim();
    // console.log("Raw response:", rawResponse);
    let cmpData = null;
    //////////////////////////////////////////////////////////////////////
    try {
      // Try parsing the response as JSON
      cmpData = JSON.parse(rawResponse);

      // Now you have the product details in productData
      console.log(cmpData);
    } catch (error) {
      console.error("Error parsing product details:", error);
    }

    //////////////////////////////////////////////////////////////////////

    // Send the API response back to the client
    res.json({
      result: cmpData, // Extract the generated response
    });
  } catch (error) {
    console.error("Error interacting with AI:", error);
    res.status(500).send("Error interacting with the AI API");
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running correctly on port :${port}`);
});
