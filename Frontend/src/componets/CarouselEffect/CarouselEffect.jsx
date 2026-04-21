import classes from "./CarouselEffect.module.css";
import { useNavigate } from "react-router-dom";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import img from "../CarouselEffect/Images/images.js";

function CarouselEffect() {
  const navigate = useNavigate();
  const buttonClicked = () => {
    navigate("/login")
  }
  const slides = [
    {
      image: img[0],
      title: "Welcome to Digital Library",
      text: "Discover thousands of books anytime, anywhere",
    },
    {
      image: img[3],
      title: "Read. Learn. Grow.",
      text: "Your knowledge journey starts here",
    },
    {
      image: img[4],
      title: "Smart Library System",
      text: "Manage books, categories and downloads easily",
    },
  ];

  return (
    <div className={classes.carouselWrapper}>
      <Carousel
        autoPlay
        infiniteLoop
        showIndicators={false}
        showThumbs={false}
        showStatus={false}
      >
        {slides.map((slide, index) => (
          <div key={index} className={classes.slide}>
            <img src={slide.image} alt="slide" className={classes.image} />

            {/* DARK OVERLAY */}
            <div className={classes.overlay}></div>

            {/* TEXT CONTENT */}
            <div className={classes.textBox}>
              <h2>{slide.title}</h2>
              <p>{slide.text}</p>
              <button onClick={buttonClicked}>Explore Now</button>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
}

export default CarouselEffect;
