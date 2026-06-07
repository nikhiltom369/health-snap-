import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Suggestion.module.css";
import { IoChevronBackOutline, IoHomeOutline } from "react-icons/io5";

const Suggestion = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const data = location.state?.detailed; // Extract data from navigation state

    if (!data) {
        return <p>Loading data...</p>;
    }

    const colors = ["white", "green"];
    const fontcolors = ["black", "white"];

    return (
        <div className={styles.suggestionBox}>
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

            <h2 className={styles.title}>{data.Product.name}</h2>
            <p style={{ fontSize: "smaller", paddingLeft: "10px", fontWeight: "500" }}>
                <span>{"Brand : " + data.Product.brand}</span> <br />
                <span>{"Category : " + data.Product.category}</span>
            </p>

            {/* Ultimate Recommendation */}
            <section className={styles.final}>
                <p className={styles.finalRec}>
                    <strong>{data.ultimate_recommendation.overall_suitability.status}</strong>
                    : {data.ultimate_recommendation.overall_suitability.reason}
                </p>
                <label className={styles.miniLabel}>Better Alternatives available</label>
                <p className={styles.alternate}>
                    <strong>{data.ultimate_recommendation.better_alternatives.status + " "}</strong>
                     {data.ultimate_recommendation.better_alternatives.alternatives.join(", ")}
                </p>
                <label className={styles.miniLabel}>Still want it</label>
                <p className={styles.limit}>
                    <strong>{data.ultimate_recommendation.if_you_still_want_to_consume.status  + " "}</strong>
                     {data.ultimate_recommendation.if_you_still_want_to_consume.recommendation}
                </p>
            </section>

            {/* Ingredient Analysis */}
            <section className={styles.ingriBox}>
                <h2 className={styles.subtitle}>Ingredient Analysis
                    <img className={styles.ingriImg} src="./Suggestion/ingredients.png" alt="accept" />
                </h2>
                {Object.entries(data.ingredient_analysis).map(([key, value]) => (
                    <div key={key} className={styles.concernBox}>
                        <strong>{value.status}</strong>
                        <div className={styles.special}>{value.ingredients.join(" ,  ")}</div>
                        <div style={{ paddingLeft: "10px" }}>{value.impact}</div>
                    </div>
                ))}
            </section>

            {/* Nutritional Analysis */}
            <section className={styles.nutriBox}>
                <h2 className={styles.subtitle2}>Nutritional Analysis</h2>
                <p className={styles.tip}>Here is a detailed breakdown of the nutritional content:</p>
                <div className={styles.nutriScroll}>
                    {Object.entries(data.nutritional_analysis).map(([key, value], index) => (
                        <div
                            key={key}
                            className={styles.eachNutri}
                            style={{ backgroundColor: colors[index % colors.length],color:fontcolors[index % fontcolors.length] }}
                        >
                            <div>
                                <strong>{key}</strong>
                            </div>
                            <div>{value.impact}</div>
                            <div>{value.value}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Health Concerns */}
            <div className={styles.healthBox}>
                <section className={styles.concern}>
                    <h2 className={styles.subtitle}>Health Concerns
                        <img src="./Suggestion/cancel.png" alt="cancel" />
                    </h2>
                    {Object.entries(data.health_analysis.concerns).map(([key, value]) => (
                        <div key={key} className={styles.concernBox}>
                            <div className={styles.concernheader}>
                                <strong>{key}</strong>
                                <span className={styles.risk}>{value.status}</span>
                            </div>
                            <div className={styles.reason}>{value.reason}</div>
                        </div>
                    ))}
                </section>

                {/* Health Positives */}
                <section className={styles.positive}>
                    <h2 className={styles.subtitle}>Health Positives
                        <img src="./Suggestion/accept.png" alt="accept" />
                    </h2>
                    {Object.entries(data.health_analysis.positives).map(([key, value]) => (
                        <div key={key} className={styles.concernBox}>
                            <div className={styles.concernheader}>
                                <strong>{key}</strong>
                                <span className={styles.good}>{value.status}</span>
                            </div>
                            <div className={styles.reason}>{value.reason}</div>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
};

export default Suggestion;
