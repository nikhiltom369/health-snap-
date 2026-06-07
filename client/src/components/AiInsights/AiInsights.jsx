import React from 'react'
import styles from './AiInsights.module.css'
import { IoIosArrowDown } from "react-icons/io";

function AiInsights({val,rec,onClick}) {
  
return (
    <div className={styles.AiBox} onClick={onClick}>
        <div className={styles.subtitle}>
            <div className={styles.logo}></div>
            <p style={{flex:"1"}}>Ai Insights..</p>
            {!val && <p className={styles.seemore}>more ..</p>}
        </div>
        <div className={styles.Airesult}>
            {val ? 
            <>
            <div className={`${styles.loadingLine} ${styles.long}`}></div>
            <div className={`${styles.loadingLine} ${styles.medium}`}></div>
            <div className={`${styles.loadingLine} ${styles.short}`}></div>
            </>
            :
            <div className={styles.result}>{rec}</div>}
            
        </div>
    </div>
)
}

export default AiInsights