import styles from "./Progress.module.css";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const Progress = ({ progress }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { triggerOnce: true });
  const radius = 50;
  const strokeWidth = 10;
  const circumference = Math.PI * radius;
  const data = {
    A: {
        rating: "Excellent ✨",
        progress: 100,
        color: "#00823F",
        nutritionalBenefits: [
            "Rich in fiber, protein, and healthy fats",
            "Low in added sugars, saturated fats, and sodium",
            "Made with whole, minimally processed ingredients"
        ],
        recommendation: [
            "A great choice! Packed with essential nutrients for a balanced diet.",
            "No changes needed—pair with whole foods for even better nutrition!"
        ],
        takeaway: "An excellent option—supports overall health with natural, nutrient-rich ingredients!"
    },
    B: {
        rating: "Good ✅",
        progress: 80,
        color: "#86BC2B",
        nutritionalBenefits: [
            "A good source of fiber and protein",
            "May contain moderate amounts of sugar and sodium",
            "Mostly made from natural ingredients with minimal processing"
        ],
        recommendation: [
            "A solid choice! Provides good nutrition with slight room for improvement.",
            "Pairing with fresh fruits and vegetables can enhance its benefits."
        ],
        takeaway: "A good option—offers balanced nutrition but can be improved with minor adjustments."
    },
    C: {
        rating: "Average 〽️",
        progress: 65,
        color: "#FECC00",
        nutritionalBenefits: [
            "Might provide moderate fiber and protein",
            "Could contain higher levels of sugar and sodium",
            "Likely includes some processed ingredients"
        ],
        recommendation: [
            "An average choice. Offers some nutrition but isn't the healthiest option.",
            "Consider balancing it with whole foods and less processed alternatives."
        ],
        takeaway: "An average option—decent but could benefit from healthier ingredient choices."
    },
    D: {
        rating: "Below Average ⚠️",
        progress: 40,
        color: "#EE8200",
        nutritionalBenefits: [
            "May be lower in fiber and protein",
            "Could have high amounts of added sugars and sodium",
            "Might contain artificial additives or highly processed ingredients"
        ],
        recommendation: [
            "Below average. Not the best choice for optimal nutrition.",
            "Consider swapping for a more nutrient-dense alternative."
        ],
        takeaway: "A below-average option—better choices are available for improved health."
    },
    E: {
        rating: "Poor 🚫",
        progress: 20,
        color: "#E73C09",
        nutritionalBenefits: [
            "Likely low in fiber and protein",
            "May have excessive sugar, sodium, or unhealthy fats",
            "Often made with refined and heavily processed ingredients"
        ],
        recommendation: [
            "Not recommended. Could lack essential nutrients while being high in unhealthy components.",
            "Switching to a more natural, whole-food alternative is highly advised."
        ],
        takeaway: "A poor option—significantly lacks nutritional value and may negatively impact health."
    }
};


const selectedData = data[progress];

  const dashArray = circumference;
  const dashOffset = circumference * (1 - (isInView ? selectedData.progress : 0) / 100);
  

console.log(selectedData);

  return (
    <div ref={ref} className={styles.progressBox}>
      <div className={styles.progress}>
        <div className={styles.section1}>
          <svg width="140" height="120" viewBox="0 0 120 60">
            {/* Background Arc */}
            <path
              d="M10,50 A40,40 0 0,1 110,50"
              fill="none"
              stroke="#e6e6e6"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            {/* Animated Progress Arc */}
            <motion.path
              d="M10,50 A40,40 0 0,1 110,50"
              fill="none"
              stroke={selectedData.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </svg>
          <div className={styles.progressText}>
            <p>{progress}</p>
          </div>
        </div>
        
        <div className={styles.depthInfo}>
            <strong>Nutritional Benefits: 🌿</strong>
            <li style={{ color: selectedData.color }}>{selectedData.nutritionalBenefits[0]}</li>
<li style={{ color: selectedData.color }}>{selectedData.nutritionalBenefits[1]}</li>
<li style={{ color: selectedData.color }}>{selectedData.nutritionalBenefits[2]}</li>

        </div>
      </div>

      <div className={styles.progressInfo}>
        <p> {selectedData.rating} </p>
        <p>{selectedData.takeaway}</p>
        <small>Recommendation</small>
        <p>{selectedData.recommendation[1]}</p>
      </div>
    </div>
  );
};

export default Progress;
