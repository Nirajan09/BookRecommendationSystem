import React from "react";
import heroBg from "../../assets/hero-bg-1t.png";
import book1 from "../../assets/top 1 book.png";
import book2 from "../../assets/book 2 image 2.png";
import book3 from "../../assets/book3 img 3.png";

export default function HeroSection() {
  return (
    <section className="relative w-full h-[600px] flex items-center overflow-hidden">
      {/* Background image */}
      <img
        src={heroBg}
        alt="Hero background"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable={false}
        style={{ objectPosition: "center -250px" }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row w-full h-full items-center justify-between px-6 md:px-20">
        {/* Left: Text */}
        <div className="pt-12 md:pt-0 max-w-xl">
          <h1 className="text-4xl md:text-6xl font-black text-black mb-4 leading-tight">
            <span className="font-extrabold">Discover</span>{" "}
            <span className="font-normal">your</span>
            <br />
            <span className="font-normal">favorite</span>{" "}
            <span className="text-orange-400 font-extrabold">books</span>
          </h1>
          <p className="text-lg md:text-xl text-black/80 mt-2">
            Explore the book
          </p>
        </div>

        {/* Right: Book covers */}
        <div className="flex items-end gap-4 mt-10 md:mt-0">
          {/* Main book */}
          <img
            src={book1}
            alt="Book 1"
            className="w-36 md:w-60 h-auto rounded shadow-lg transition-transform duration-300 hover:-translate-y-2"
            style={{ zIndex: 2 }}
          />
          {/* Side books */}
          <div className="flex flex-col gap-4 ml-[-20px] md:ml-[-32px]">
            <img
              src={book2}
              alt="Book 2"
              className="w-20 md:w-28 h-auto rounded shadow-lg transition-transform duration-300 hover:-translate-y-1"
              style={{ zIndex: 1 }}
            />
            <img
              src={book3}
              alt="Book 3"
              className="w-20 md:w-28 h-auto rounded shadow-lg transition-transform duration-300 hover:translate-y-1"
              style={{ zIndex: 1 }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
