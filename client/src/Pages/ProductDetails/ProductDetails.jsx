import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import styles from "./ProductDetails.module.css";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/Loading/Loading";
import axios from "axios";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { calculateNutriScore, renderNutrientInfo } from "./Logic";
import { Link } from "react-router-dom";
import NutriBox from "../../components/NutriBox/NutriBox";
import AiInsights from "../../components/AiInsights/AiInsights";
import { IoChevronBackOutline } from "react-icons/io5";
import { IoHomeOutline } from "react-icons/io5";
import { useLocation } from "react-router-dom";
import { FaArrowRightLong } from "react-icons/fa6";
import { MdDoNotDisturbOn } from "react-icons/md";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { MdBookmarkAdd } from "react-icons/md";
import { MdBookmarkAdded } from "react-icons/md";
// import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const backendURL = import.meta.env.VITE_BACKEND_URL;

const ProductDetails = () => {
  const { id } = useParams(); // Get the barcode from the URL
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const [nutriVal, setNutriVal] = useState("A");
  const [user, setUser] = useState({});
  const [ailoading, setAiloading] = useState(true);
  const [aiRec, setAiRec] = useState("");
  const [fullData, setFullData] = useState({});
  const [isInCart, setIsInCart] = useState(false);

  const productNameFromQuery = searchParams.get("name") || "";
  console.log("Location state", location.state);
  const productJson = location.state?.ocr ?? "notFound";
  const history = location.state?.fromHistory ?? false;

  console.log(productJson);
  console.log(history);

  const handleAi = () => {
    console.log("AI Insights Clicked!");

    console.log("Navigating to /suggestion with:", fullData);
    if (fullData) {
      navigate("/suggestion", { state: { detailed: fullData } });
    } else {
      console.error("fullData is not available yet!");
    }
  };

  const handleAdd = async () => {
    try {
      console.log("Adding product to cart:", id);
      const res = await axios.post(
        `${backendURL}/add-to-cart`,
        { id },
        { withCredentials: true }
      );

      if (res.data.success) {
        console.log("Product added successfully");
        setIsInCart(true);
      } else {
        console.error("Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  useEffect(() => {
    if (!productDetails) return; // Ensure productDetails exists before fetching user data
    const checkCart = async () => {
      try {
        const res = await axios.get(`${backendURL}/check/${id}`, {
          withCredentials: true,
        });
        setIsInCart(res.data.inCart);
      } catch (error) {
        console.error("Error checking cart:", error);
      }
    };
    checkCart();

    const fetchUserData = async () => {
      try {
        const storedUser = sessionStorage.getItem("userData");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          console.log("Loaded user data from sessionStorage:", userData);

          // Fetch AI insights if not already stored
          const storedAiRec = sessionStorage.getItem(`aiRec-${id}`);
          const storedFullData = sessionStorage.getItem(`fullData-${id}`);

          if (storedAiRec && storedFullData) {
            console.log("Loaded AI insights from sessionStorage");
            setAiRec(storedAiRec);
            setFullData(JSON.parse(storedFullData));
            setAiloading(false);
          } else {
            console.log("Fetching AI insights...");
            fetchAiInsights(userData, productDetails);
          }
          return;
        }

        console.log("Fetching user data...");
        const res = await axios.get(`${backendURL}/me`, {
          withCredentials: true,
        });
        setUser(res.data.me);
        console.log("User data fetched:", res.data.me);

        // Store user data in sessionStorage
        sessionStorage.setItem("userData", JSON.stringify(res.data.me));

        // Fetch AI insights
        console.log("AI loading", ailoading);
        fetchAiInsights(res.data.me, productDetails);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchAiInsights = async (userData, productDetails) => {
      try {
        console.log("Sending data to AI insights...");
        console.log("User data:", userData);
        const res = await axios.post(
          `${backendURL}/ai-insights`,
          {
            userData,
            productDetails,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log("AI insights response:", res.data.reply);
        const aiRecommendation =
          res.data.reply.ultimate_recommendation.overall_suitability.status +
          ": " +
          res.data.reply.ultimate_recommendation.overall_suitability.reason;
        setAiRec(aiRecommendation);
        setFullData(res.data.reply);
        setAiloading(false);

        // Store AI insights in sessionStorage
        sessionStorage.setItem(`aiRec-${id}`, aiRecommendation);
        sessionStorage.setItem(
          `fullData-${id}`,
          JSON.stringify(res.data.reply)
        );
      } catch (error) {
        console.error("Error fetching AI insights:", error);
      }
    };

    fetchUserData();
  }, [productDetails]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      console.log("Barcode:", id);
      const cachedProductData = sessionStorage.getItem(`product-${id}`);

      if (cachedProductData) {
        // If cached data exists, parse and use it
        console.log("Cached product data found");
        const parsedData = JSON.parse(cachedProductData);
        setProductDetails(parsedData);
        setNutriVal(calculateNutriScore(parsedData.nutritional_info_per100g));

        if (!history) {
          try {
            await axios.post(
              `${backendURL}/history`,
              {
                // Ensure userId is available
                product: id, // Use the correct product ID
              },
              { withCredentials: true }
            );
            console.log("History saved successfully!");
          } catch (error) {
            console.error("Error saving history:", error);
          }
        }

        const timer = setTimeout(() => {
          setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
      }

      try {
        if (productNameFromQuery.length > 0) {
          // Step 1: If product name is in the query, use it to search
          const res = await axios.post(`${backendURL}/chat`, {
            prompt: productNameFromQuery,
            barcode: id,
          });
          console.log("This one ", res.data.reply);
          const detailedProduct = res.data.reply;
          console.log("Detailed Product:", detailedProduct);
          sessionStorage.setItem(
            `product-${id}`,
            JSON.stringify(detailedProduct)
          );
          setProductDetails(detailedProduct);

          const score = calculateNutriScore(
            detailedProduct.nutritional_info_per100g
          );
          setNutriVal(score); // Update Nutri-Score here
          console.log("NutriScore", score);

          if (!history) {
            try {
              await axios.post(
                `${backendURL}/history`,
                {
                  // Ensure userId is available
                  product: id, // Use the correct product ID
                },
                { withCredentials: true }
              );
              console.log("History saved successfully!");
            } catch (error) {
              console.error("Error saving history:", error);
            }
          }

          setLoading(false);
          navigate(`/product/${id}`, { replace: true }); // to remove the namequery
        } else if (productJson !== "notFound") {
          console.log("Got the details from OCR", productJson);
          sessionStorage.setItem(`product-${id}`, JSON.stringify(productJson));
          setProductDetails(productJson);
          const score = calculateNutriScore(
            productJson.nutritional_info_per100g
          );

          setNutriVal(score);
          console.log("NutriScore", score);
          if (!history) {
            try {
              await axios.post(
                `${backendURL}/history`,
                {
                  // Ensure userId is available
                  product: id, // Use the correct product ID
                },
                { withCredentials: true }
              );
              console.log("History saved successfully!");
            } catch (error) {
              console.error("Error saving history:", error);
            }
          }
          setLoading(false);
        } else {
          // Step 2: If no product name in the query, check the database
          console.log(
            "Product name from query is empty. Checking the database..."
          );

          const dbResponse = await axios.get(`${backendURL}/products/${id}`);
          console.log("Response from /products API:", dbResponse);
          // console.log("Response from /products API:", dbResponse);

          if (dbResponse.data.message !== "Product not found") {
            // Product found in the database
            console.log("Product found in database:", dbResponse.data);
            const detailedProduct = dbResponse.data; // Assuming the response contains the product data

            // Set the product details from the database
            sessionStorage.setItem(
              `product-${id}`,
              JSON.stringify(detailedProduct)
            );
            setProductDetails(detailedProduct);

            // Calculate Nutri-Score from the database details
            const score = calculateNutriScore(
              detailedProduct.nutritional_info_per100g
            );
            setNutriVal(score);
            if (!history) {
              try {
                await axios.post(
                  `${backendURL}/history`,
                  {
                    // Ensure userId is available
                    product: id, // Use the correct product ID
                  },
                  { withCredentials: true }
                );
                console.log("History saved successfully!");
              } catch (error) {
                console.error("Error saving history:", error);
              }
            }
            console.log("NutriScore:", score);
          } else {
            // Step 3: If not found in the database, fetch from OpenFoodFacts
            console.log(
              "Product not found in the database. Fetching from OpenFoodFacts API"
            );
            const response = await fetch(
              `https://world.openfoodfacts.org/api/v0/product/${id}.json`
            );
            const data = await response.json();
            console.log(data);
            console.log("Nmae is ", data.product.product_name);
            if (data.product && data.product.product_name.length > 0) {
              const prodId =
                data.product.product_name +
                " " +
                (data.product.brands?.length > 0 ? data.product.brands : "");

              // Fetch detailed product data from the custom API
              console.log(prodId);
              const res = await axios.post(`${backendURL}/chat`, {
                prompt: prodId,
                barcode: id,
              });
              console.log("This one ", res.data.reply);
              const detailedProduct = res.data.reply;
              console.log("Detailed Product:", detailedProduct);
              sessionStorage.setItem(
                `product-${id}`,
                JSON.stringify(detailedProduct)
              );
              setProductDetails(detailedProduct);

              const score = calculateNutriScore(
                detailedProduct.nutritional_info_per100g
              );
              setNutriVal(score);
              if (!history) {
                try {
                  await axios.post(
                    `${backendURL}/history`,
                    {
                      // Ensure userId is available
                      product: id, // Use the correct product ID
                    },
                    { withCredentials: true }
                  );
                  console.log("History saved successfully!");
                } catch (error) {
                  console.error("Error saving history:", error);
                }
              } // Update Nutri-Score here
              console.log("NutriScore", score);
            } else {
              setLoading(false);
              setError(true); // No product found for the scanned barcode
            }
          }
        }

        ////////// 1 sec delay //////////////////////////////////////
        const timer = setTimeout(() => {
          setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
      } catch (err) {
        setError(true);
      }
    };

    fetchProductDetails();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loading height={80} width={80} loop={true} autoplay={true} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <button className={styles.backButton} onClick={() => navigate("/scan")}>
          Back
        </button>
        <h1>Internal Server Error. Try Again!</h1>
      </div>
    );
  }

  // Ensure ingredients is always an array
  const ingredientsArray = Array.isArray(productDetails.ingredients)
    ? productDetails.ingredients
    : typeof productDetails.ingredients === "string"
    ? productDetails.ingredients.split(", ")
    : [];

  return (
    <div className={styles.container}>
      <div className={styles.floatDiv}>
        <div className={styles.buttonDiv}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            <IoChevronBackOutline size={24} color={"green"} />
          </button>
          <p>HS</p>
          <div className={styles.arrangeocr}>
            <button className={styles.backButton} onClick={() => navigate("/")}>
              <IoHomeOutline size={24} color={"green"} />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.mainInfo}>
        <h1 className={styles.maintitle}>{productDetails.product_name}</h1>
        <div className={styles.infobar}>
          <p>
            <strong>Barcode:</strong> {id}
          </p>
          <div>
            {productDetails.accuracy === 70 ? (
              <div className={styles.box}>
                <div className={styles.add}>
                  <MdDoNotDisturbOn size={17} color="grey" />
                </div>

                {!isInCart ? (
                  <div className={styles.add} onClick={handleAdd}>
                    <p>Add</p>
                    <MdBookmarkAdd size={17} color="green" />
                  </div>
                ):(
                  <div className={styles.add}>
                    <MdBookmarkAdded size={17} color="green" />
                  </div>
                )
                }
              </div>
            ) : (
              <div className={styles.box}>
                <div className={styles.add}>
                  <RiVerifiedBadgeFill size={17} color="green" />
                </div>
                {!isInCart ? (
                  <div className={styles.add} onClick={handleAdd}>
                    <p>Add</p>
                    <MdBookmarkAdd size={17} color="green" />
                  </div>
                ):(
                  <div className={styles.add}>
                    <MdBookmarkAdded size={17} color="green" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <p className={styles.info}>
          <strong>Brand:</strong> {productDetails.brand || "N/A"}
        </p>
        <p className={styles.info}>
          <strong>Category:</strong> {productDetails.category || "N/A"}
        </p>
        <p className={styles.info}>
          <strong>Description:</strong> {productDetails.description || "N/A"}
        </p>
        <p className={styles.info}>
          <strong>Ingredients: </strong>
          {ingredientsArray.length > 0 ? ingredientsArray.join(", ") : "N/A"}
          <small
            style={{ fontSize: "10px", color: "grey", fontStyle: "italic" }}
          >
            {" "}
            (approx)
          </small>
        </p>
        <p className={styles.info}>
          <strong>Weight:</strong> {productDetails.weight || "N/A"}
        </p>
      </div>
      <div className={styles.nutriScoreDiv}>
        <Link to={`/nutriscore/${nutriVal}`} style={{ textDecoration: "none" }}>
          <NutriBox val={nutriVal} />
        </Link>
        {productDetails.accuracy === 70 && (
          <>
            <p className={styles.briefdesc}>
              For the most accurate information, switch to OCR scan
            </p>
            <div
              className={styles.ocrDirect}
              onClick={() => navigate(`/ocr?barcode=${id}`)}
            >
              {/* <button className={styles.ocrButton}> */}
              {/* <DotLottieReact
                src="https://lottie.host/70ee9cbb-bbec-4e68-afd1-2aad435585cd/K33ejSXf2O.json"
                loop
                autoplay
              /> */}
              <button className={styles.ocrButton}>
                <div className={styles.ocrimg}></div>
                <p>Ocr</p>
              </button>
              {/* </button> */}
              <FaArrowRightLong color="white" size={23} />
            </div>
          </>
        )}
      </div>
      <div className={styles.aiInsightsBox}>
        <h2 className={styles.Aititle}>AI-Powered Suggestions</h2>
        <p className={styles.briefdesc}>
          Get smart recommendations tailored to your needs with help of our AI
          Models.
        </p>
        <AiInsights val={ailoading} rec={aiRec} onClick={!ailoading ? handleAi : undefined} />
      </div>

      <div className={styles.nutriInfo}>
        <h2 className={styles.title}>
          Nutritional Information
          <span style={{ fontSize: "9px", color: "grey", fontStyle: "italic" }}>
            (per 100g/serve)
          </span>
        </h2>
        <div className={styles.nutriInfoTable}>
          {renderNutrientInfo(
            "Calories",
            productDetails.nutritional_info_per100g?.calories,
            "calories",
            productDetails.category
          )}
          {renderNutrientInfo(
            "Fat",
            productDetails.nutritional_info_per100g?.fat,
            "fat",
            productDetails.category
          )}
          {renderNutrientInfo(
            "Saturated Fat",
            productDetails.nutritional_info_per100g?.saturated_fat,
            "saturated_fat",
            productDetails.category
          )}
          {renderNutrientInfo(
            "Trans Fat",
            productDetails.nutritional_info_per100g?.trans_fat,
            "trans_fat",
            productDetails.category
          )}
          {renderNutrientInfo(
            "Carbohydrates",
            productDetails.nutritional_info_per100g?.carbohydrates,
            "carbohydrates",
            productDetails.category
          )}
          {renderNutrientInfo(
            "Sugar",
            productDetails.nutritional_info_per100g?.sugar,
            "sugar",
            productDetails.category
          )}
          {renderNutrientInfo(
            "Protein",
            productDetails.nutritional_info_per100g?.protein,
            "protein",
            productDetails.category
          )}
          {renderNutrientInfo(
            "Fiber",
            productDetails.nutritional_info_per100g?.fiber,
            "fiber",
            productDetails.category
          )}
          {renderNutrientInfo(
            "Cholesterol",
            productDetails.nutritional_info_per100g?.cholesterol,
            "cholesterol",
            productDetails.category
          )}
          {renderNutrientInfo(
            "Sodium",
            productDetails.nutritional_info_per100g?.sodium,
            "sodium",
            productDetails.category
          )}
        </div>
      </div>
      <div className={styles.note}>
        <p className={styles.info4}>
          <IoMdInformationCircleOutline style={{ fontSize: "24px" }} />{" "}
          <i>
            The Ingredients and Nutritional Information are approximate and may
            vary. For accurate results, refer to the product packaging.
          </i>
        </p>
      </div>
    </div>
  );
};

export default ProductDetails;
