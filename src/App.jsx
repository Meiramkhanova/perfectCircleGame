import React, { useEffect, useState, useRef } from "react";

function App() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDrawingTooClose, setIsDrawingTooClose] = useState(false);
  const centralPoint = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const [drawingStartTime, setDrawingStartTime] = useState(null);
  const [hasError, sethasError] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const context = canvas.getContext("2d");
    context.scale(2, 2);
    context.linecap = "round";
    context.strokeStyle = "#a3e635";
    context.lineWidth = 5;
    contextRef.current = context;

    // Найдем центр холста
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Отобразим центральную точку
    context.beginPath();
    context.arc(centerX, centerY, 10, 0, 2 * Math.PI);
    context.fillStyle = "white";
    context.fill();
  }, []);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
    handleDrawStart();
  };

  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) {
      return;
    }

    const { offsetX, offsetY } = nativeEvent;
    const distance = Math.sqrt(
      Math.pow(offsetX - centralPoint.x, 2) +
        Math.pow(offsetY - centralPoint.y, 2)
    );

    if (distance < 50) {
      setIsDrawingTooClose(true);
      return;
    }
    setIsDrawingTooClose(false);

    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();

    const drawingEndTime = Date.now();
    const drawingTime = drawingEndTime - drawingStartTime;

    if (drawingTime > 5200) {
      sethasError(true);
      return;
    }

    sethasError(false);
  };

  const handleDrawStart = () => {
    setDrawingStartTime(Date.now());
  };

  // Define the radius of the circle
  const radius = 100;
  const tolerance = 10;

  // Counters for perfect and total points
  let numPerfectPoints = 0;
  let totalPoints = 0;
  // Loop through each point on the circle
  for (let angle = 0; angle < 360; angle++) {
    const radians = (angle * Math.PI) / 180;
    const x = centralPoint.x + radius * Math.cos(radians);
    const y = centralPoint.y + radius * Math.sin(radians);
    const distance = Math.sqrt(
      Math.pow(x - centralPoint.x, 2) + Math.pow(y - centralPoint.y, 2)
    );
    if (distance < tolerance) {
      numPerfectPoints++;
    }
    totalPoints++;
  }

  // Calculate the percentage of the circle that is perfect
  const percentPerfect = (numPerfectPoints / totalPoints) * 100;

  return (
    <>
      <canvas
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        ref={canvasRef}
      />
      {isDrawingTooClose && (
        <div
          style={{
            color: "white",
            position: "absolute",
            top: centralPoint.y - -50, // верхний край текста на 50 пикселей выше центральной точки
            left: centralPoint.x - 15, // левый край текста на 100 пикселей левее центральной точки
            textAlign: "center", // выравнивание текста по центру
            width: 50,
          }}
        >
          Too close to dot
        </div>
      )}
      {hasError && (
        <div
          style={{
            color: "white",
            position: "absolute",
            top: centralPoint.y - -70, // верхний край текста на 70 пикселей выше центральной точки
            left: centralPoint.x - 30, // левый край текста на 30 пикселей левее центральной точки
            textAlign: "center", // выравнивание текста по центру
            width: 100,
          }}
        >
          Too slow
        </div>
      )}
      <div>{percentPerfect}% perfect</div>
    </>
  );
}

export default App;
