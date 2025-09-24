"use client"
import "@tensorflow/tfjs"
import * as mobilenet from "@tensorflow-models/mobilenet"
import { useState } from "react"

const Page = () => {
    const [imageUrl, setImageUrl] = useState(null)
    const [loading, setLoading] = useState(false)
    const [predictions, setPredictions] = useState([])
    const handleImageChange = async (e) => {
        const file = e.target.files[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setImageUrl(url)
        } else {
            return alert("No file selected")
        }
    }
    const handleClassify = async () => {
        try {
            setLoading(true)
            const img = document.querySelector("#img")
            const model = await mobilenet.load()
            const newPredictions = await model.classify(img)
            setPredictions(newPredictions)
        } catch (error) {
            console.log(error.message)
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="min-h-screen flex flex-col items-center justify-around gap-10 bg-zinc-900">


            <div>
                <label >
                    <span
                        className="cursor-pointer border-2 border-cyan-500 px-4 py-2 rounded-md inline-block hover:scale-105 transition-all duration-200">Upload Image</span>
                    <input type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageChange}
                    />
                </label>
                {imageUrl
                    && <>
                        <img
                            className="rounded-lg shadow-lg border-4 border-cyan-500 border-dashed p-4"
                            id="img"
                            src={imageUrl} alt="Uploaded" width={420} />
                        <button
                            className="cursor-pointer border-2 border-emerald-500 px-4 py-2 rounded-md inline-block hover:scale-105 transition-all duration-200"
                            onClick={handleClassify}
                        >
                            {loading ? "Classifying..." : "Classify Image"}
                        </button>
                    </>}

            </div>
            {
                predictions && predictions.map((pred, index) => (
                    <div key={index} className="text-white border-b last:border-0 border-zinc-700 pb-2">
                        <p>Class: {pred.className}</p>
                      <p>Probability: {(pred.probability * 100).toFixed(2)}%</p>
                    </div>
                ))
            }
        </div>
    )
}

export default Page

