import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './FoodDetails.module.css';
import Loading from '../Loading/Loading';

function FoodDetails() {
  const { id } = useParams(); // Get the meal ID from the URL
  const navigate = useNavigate();
  const [mealDetails, setMealDetails] = useState(null); // Start with null to force fetching

  useEffect(() => {
    const fetchMealDetails = async () => {
      try {
        const response = await axios.get(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        );
        setMealDetails(response.data.meals[0]); // Save the fetched meal details
      } catch (error) {
        console.error('Error fetching meal details:', error);
      }
    };

    fetchMealDetails(); // Fetch details when the component is mounted or when `id` changes
  }, [id]);

  if (!mealDetails) {
    return <div className={styles.loadingDiv}><Loading height={80} width={80} loop={true} autoplay={true}/></div>; // Show a loading message until data is fetched
  }

  return (
    <div className={styles.foodDetails}>
      <img src={mealDetails.strMealThumb} alt={mealDetails.strMeal || 'Food Image'} />
      <h1>{mealDetails.strMeal || 'No Title Available'}</h1>
      <p>{mealDetails.strInstructions || 'Instructions not available for this meal.'}</p>
      <div className={styles.ingredientsList}>
        <h3>Ingredients:</h3>
        <ul>
          {Array.from({ length: 20 }).map((_, index) => {
            const ingredient = mealDetails[`strIngredient${index + 1}`];
            const measure = mealDetails[`strMeasure${index + 1}`];
            return ingredient ? (
              <li key={index}>
                {ingredient} - {measure || 'N/A'}
              </li>
            ) : null;
          })}
        </ul>
      </div>
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        Back
      </button>
    </div>
  );
}

export default FoodDetails;
