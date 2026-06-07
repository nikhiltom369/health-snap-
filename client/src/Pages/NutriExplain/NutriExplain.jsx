import React, { useState } from "react";
import styles from "./NutriExplain.module.css";
import NutriBox from "../../components/NutriBox/NutriBox";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { IoChevronBackOutline } from "react-icons/io5";
import { IoHomeOutline } from "react-icons/io5";
import Progress from "../../components/Progress/Progress";

function NutriExplain() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className={styles.NutriExplainDiv}>
      <div className={styles.floatDiv}>
        <div className={styles.buttonDiv}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            <IoChevronBackOutline size={24} color={"green"} />
          </button>
          <p>HS</p>
          <button className={styles.backButton} onClick={() => navigate("/")}>
            <IoHomeOutline size={24} color={"green"} />
          </button>
        </div>
      </div>
      <NutriBox val={id} />
      <Progress progress={id} />
      <div className={styles.tipsBox}>
        
        <h2>How is it calculated?</h2>
        <p>
          The nutritional score is calculated by evaluating both the positive
          and negative aspects of the food item. Positive points are awarded for
          beneficial nutrients such as fiber, protein, and vitamins. Negative
          points are given for less desirable components like sugar, saturated
          fat, and sodium. The final score is a balance of these positive and
          negative points, resulting in a grade from A to E.
        </p>
      </div>
    </div>
  );
}

export default NutriExplain;
