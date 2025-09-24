"use client";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [facingMode, setFacingMode] = useState("user");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const runDetection = async () => {
    const doesExist = await navigator.mediaDevices.getUserMedia({ video: true }).then(() => true).catch(() => false);
    if (!doesExist) console.log("Camera not found")
    if (navigator.mediaDevices.getUserMedia && navigator.mediaDevices) {
      const webCamPromise = await navigator.mediaDevices.getUserMedia({
        audio: false, video: {
          facingMode: `${facingMode}`
        }
      }).then((stream) => {
        videoRef.current.srcObject = stream;
        return new Promise((resolve, reject) => {
          videoRef.current.onloadedmetadata = () => {
            resolve();
          };
        });
      })

      const modelPromise = cocoSsd.load();
      Promise.all([modelPromise, webCamPromise]).then((values) => {
        detectFrame(videoRef.current, values[0])
      });
    }
    const detectFrame = (video, model) => {
      model.detect(video).then(predictions => {
        renderPredictions(predictions);
        requestAnimationFrame(() => {
          detectFrame(video, model);
        });
      });
    }
  }

  const renderPredictions = (predictions) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";

    predictions.forEach(prediction => {
      const [x, y, width, height] = prediction['bbox'];
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);
      ctx.fillStyle = "#00FFFF";
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10);
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);

      ctx.fillStyle = "#000000";
      ctx.fillText(prediction.class, x, y);
    });
  }

  useEffect(() => {
    runDetection();
  }, [])


  return (
    <div className="relative h-screen flex justify-center items-center bg-zinc-800">
      <video
        className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 border-4 border-white border-dashed rounded-lg p-2"
        autoPlay
        width={500}
        height={350}
        ref={videoRef} />

      <canvas
        width={300}
        height={300}
        className="absolute left-1/2 top-1/2 transform -translate-x-2/3 -translate-y-1/2"
        ref={canvasRef}></canvas>

      <div className="absolute top-10 left-10 flex flex-col gap-4">
        <button className="bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600 transition"
          onClick={() => setFacingMode(facingMode === "user" ? "environment" : "user")}>
          Switch Camera
        </button>
        <button 
        onClick={() => window.location.href = '/recog'}
        className="bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600 transition">Image Recognition</button>
      </div>
    </div>
  );
}
