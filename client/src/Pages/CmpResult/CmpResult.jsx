import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./CmpResult.module.css";
import { IoChevronBackOutline, IoHomeOutline } from "react-icons/io5";
import { PiRankingDuotone } from "react-icons/pi";
import BarChart from "../../components/BarChart/BarChart";
import { useState ,useEffect} from "react";
import Loading from "../../components/Loading/Loading";
import axios from 'axios';

const backendURL = import.meta.env.VITE_BACKEND_URL;

const CmpResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedProductsString = location.state?.data;
  console.log("Received Data", selectedProductsString);

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComparisonData = async () => {
      try {
        const response = await axios.post(`${backendURL}/cmpresult`, {
          products : selectedProductsString
        });
        console.log("result",response.data.result.comparison);
        setResult(response.data.result);
      } catch (error) {
        console.error("Error fetching comparison data:", error);
        setError("Failed to fetch comparison results.");
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonData();
  }, [selectedProductsString]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loading height={80} width={80} loop={true} autoplay={true} />
      </div>
    );
  }

  return (
    <div className={styles.resultBox}>
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
      <div className={styles.resultContainer}>
        <h2 className={styles.title}>Comparison Result</h2>
        <div className={styles.final}>
          <div className={styles.bestProduct}>
            {result.comparison.best_product}
            <PiRankingDuotone size={24} color="green" />
          </div>
          <div className={styles.overallReason}>
            <strong>Overall Reason:</strong> {result.comparison.overall_reason}
          </div>
        </div>

        <BarChart data={result.comparison.products} />
        <h2 style={{fontWeight:"500"}}>Product Insights</h2>
        <p style={{fontSize:"x-small",color:"grey",fontWeight:"500",marginLeft:"5px"}}>Differences between the products.</p>
        <div className={styles.compareBox}>
          {result.comparison.products.map((product) => (
            <div key={product.name} className={styles.productBox}>
              <div className={styles.productTitle}>{product.name}</div>
              <div className={styles.productCategory}>{product.category}</div>
              <div className={styles.productScore}>Score: {product.score}</div>
              <div className={styles.productReason}>
                <strong>Reason:</strong> {product.reason}
              </div>
              <div className={styles.productAdditionalPoints}>
                <strong>Additional Points:</strong>
                <ul>
                  {product.additional_points.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CmpResult;
