import React from "react";
import styles from "./Scanner.module.css"; // Import the CSS module

const Scanner = () => {
  return (
    <div className={styles.box}>
      <div className={`${styles.animBox} ${styles.center} ${styles.spacer}`}>
        <div></div>
        <div className={styles.scanner}></div>
      </div>
      <div className={styles.spacer}></div>
    </div>
  );
};

export default Scanner;
