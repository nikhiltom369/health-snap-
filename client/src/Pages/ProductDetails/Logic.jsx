import styles from "./ProductDetails.module.css";
export const calculateNutriScore = (data) => {
  const negativePoints = {
    calories: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000], // Stricter penalties
    sugar: [2, 5, 8, 11, 15, 20, 25, 30, 35, 40], // More penalties for sugar
    saturated_fat: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 
    sodium: [90, 180, 270, 360, 450, 540, 630, 720, 810, 900], 
  };

  const positivePoints = {
    fiber: [0.9, 1.9, 2.8, 3.7, 4.7], 
    protein: [1.6, 3.2, 4.8, 6.4, 8], 
  };

  const getPoints = (value, range) => {
    if (value === null || value === undefined || isNaN(value) || value <= 0) return 0; // Ensure 0 gives 0 points
    return range.findIndex((threshold) => value <= threshold) + 1 || range.length;
  };

  // Calculate negative points
  const caloriesPoints = getPoints(data.calories, negativePoints.calories);
  const sugarPoints = getPoints(data.sugar, negativePoints.sugar);
  const saturatedFatPoints = getPoints(data.saturated_fat, negativePoints.saturated_fat);
  const sodiumPoints = getPoints(data.sodium, negativePoints.sodium);

  const totalNegativePoints = caloriesPoints + sugarPoints + saturatedFatPoints + sodiumPoints;

  // Calculate positive points
  const fiberPoints = getPoints(data.fiber, positivePoints.fiber);
  const proteinPoints = getPoints(data.protein, positivePoints.protein);

  const totalPositivePoints = totalNegativePoints >= 11 ? fiberPoints : fiberPoints + proteinPoints;

  // Final Nutri-Score calculation
  const finalScore = totalNegativePoints - totalPositivePoints;

  // Assign Nutri-Score grade
  if (finalScore <= 0) return "A";
  if (finalScore <= 2) return "B";
  if (finalScore <= 10) return "C";
  if (finalScore <= 18) return "D";
  return "E";
};


  

export const classifyNutrient = (value, type) => {
    if (value === "N/A" || value === null || value === undefined) return "N/A";

    switch (type) {
      case "calories":
        return value <= 100 ? "Low" : value <= 200 ? "Medium" : "High";
      case "fat":
        return value <= 5 ? "Low" : value <= 15 ? "Medium" : "High";
      case "saturated_fat":
        return value <= 1 ? "Low" : value <= 5 ? "Medium" : "High";
      case "trans_fat":
        return value <= 1 ? "Low" : "High";
      case "carbohydrates":
        return value <= 15 ? "Low" : value <= 40 ? "Medium" : "High";
      case "sugar":
        return value <= 5 ? "Low" : value <= 10 ? "Medium" : "High";
      case "protein":
        return value <= 5 ? "Low" : value <= 15 ? "Medium" : "High";
      case "fiber":
        return value <= 2 ? "Low" : value <= 5 ? "Medium" : "High";
      case "cholesterol":
        return value <= 20 ? "Low" : value <= 50 ? "Medium" : "High";
      case "sodium":
        return value <= 140 ? "Low" : value <= 300 ? "Medium" : "High";
      default:
        return "N/A";
    }
  };


  export const renderNutrientInfo = (nutrient, value, type, category) => {
    const classification = classifyNutrient(value, type);
    let color = "gray"; // Default color

    if(category === "Others") color = "gray";
    else{
      if (classification === "Low") color = "yellow";
      else if (classification === "Medium") color = "orange";
      else if (classification === "High") color = "red";
    }
    

    if(type === "calories") value = value + "kcal";
    else if(type === "cholesterol" || type === "sodium") value = value + "mg";
    else value = value + "g";

    return (
      <div className={styles.info2}>
      <div className={styles.together}>
        <div className={styles.imageDiv} style={{backgroundImage:`url(/NutriImages/${type}.png)`}}></div>
        <p><strong>{nutrient } : </strong> {category !== "Others" ? value : "N/A"}</p>
        
      </div>
      <div className={styles.info3}>
        <div>{category !== "Others" ? classification : "N/A"}</div>
        <p
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: color,
        }}
        ></p>
      </div>
      </div>
    );
  };