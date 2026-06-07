
import React from "react";
import Lottie from "react-lottie";
import animationData from "../../assets/bar-loader.json";

function Loading({ height = 400, width = 400, loop = true, autoplay = true }) {
    const defaultOptions = {
      loop: loop,  // Set to true if you want the animation to loop
      autoplay: autoplay,  // Set to true to start the animation automatically
      animationData: animationData,  // Import the animation data (JSON)
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",  // Optional: Adjust the aspect ratio
      },
    };
  
    return <Lottie options={defaultOptions} height={height} width={width} />;
  }
  
  export default Loading;