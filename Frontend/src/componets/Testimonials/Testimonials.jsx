import styles from "./Testimonials.module.css";

function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Abel Tesfaye",
      review:
        "This digital library is amazing! I found all the books I needed بسهولة.",
      rating: 5,
    },
    {
      id: 2,
      name: "Sara Johnson",
      review:
        "Very easy to use and the categories are well organized. Highly recommended!",
      rating: 4,
    },
    {
      id: 3,
      name: "Daniel Kim",
      review:
        "Downloading books is super fast and smooth. Great experience overall.",
      rating: 5,
    },
  ];

  return (
    <section className={styles.container} id="testimonials">
      <h2 className={styles.title}>What Our Users Say</h2>

      <div className={styles.grid}>
        {testimonials.map((item) => (
          <div key={item.id} className={styles.card}>
            <div className={styles.stars}>{"⭐".repeat(item.rating)}</div>

            <p className={styles.review}>"{item.review}"</p>

            <h4 className={styles.name}>- {item.name}</h4>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
