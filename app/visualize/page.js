"use client";
import { useEffect } from "react";
import HomePage from "../page";

export default function Visualize() {
  useEffect(() => {
    console.log("hi");
    console.log(HomePage.musicFile);
  });
  return <div></div>;
}
