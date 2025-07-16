import { Link } from 'react-router-dom';
import './Home.css';
import { useAuth } from '../../utils/AuthContext/AuthContext';

export default function Home() {
  const { token } = useAuth();
  return (
      {/* ============ HERO BANNER ============ */}
      <section className="hero" style={{ backgroundImage: "url('depth-6-frame-04.png')" }}>
        <div className="hero__content">
          <h1 className="hero__title">Discover Your Next Great Read</h1>
          <p className="hero__subtitle">
            Explore our curated collection of books, tailored just for you. Dive into new worlds and stories that await.
          </p>
        </div>
      </section>

      <main>
        {/* ============ RECOMMENDED ============ */}
        <section className="section">
          <h2 className="section__heading">Recommended For You</h2>

          <div className="book-grid">
            {/* Book card */}
            <article className="book">
              <img src="depth-7-frame-05.png" alt="The Enchanted Forest cover" className="book__img" />
              <h3 className="book__title">The Enchanted Forest</h3>
              <p className="book__blurb">A magical journey through an enchanted forest.</p>
            </article>

            <article className="book">
              <img src="depth-7-frame-06.png" alt="The Secret of the Old Mill cover" className="book__img" />
              <h3 className="book__title">The Secret of the Old Mill</h3>
              <p className="book__blurb">Unraveling the mystery of an old mill.</p>
            </article>

            <article className="book">
              <img src="depth-7-frame-07.png" alt="Beyond the Stars cover" className="book__img" />
              <h3 className="book__title">Beyond the Stars</h3>
              <p className="book__blurb">Exploring the vastness of space and beyond.</p>
            </article>

            <article className="book">
              <img src="depth-7-frame-08.png" alt="Love in the Time of Cholera cover" className="book__img" />
              <h3 className="book__title">Love in the Time of Cholera</h3>
              <p className="book__blurb">A timeless tale of love and longing.</p>
            </article>

            <article className="book">
              <img src="depth-7-frame-09.png" alt="The Silent Witness cover" className="book__img" />
              <h3 className="book__title">The Silent Witness</h3>
              <p className="book__blurb">A thrilling story of a silent witness.</p>
            </article>
          </div>
        </section>

        {/* ============ POPULAR ============ */}
        <section className="section">
          <h2 className="section__heading">Popular Books</h2>

          <div className="tabs">
            <button className="tabs__btn tabs__btn--active">Most Purchased</button>
            <button className="tabs__btn">Highest Rated</button>
          </div>

          <div className="book-grid book-grid--large">
            <article className="book">
              <img src="depth-7-frame-012.png" alt="The Lost Expedition cover" className="book__img book__img--large" />
              <h3 className="book__title">The Lost Expedition</h3>
              <p className="book__blurb">An epic adventure to uncover a lost civilization.</p>
            </article>

            <article className="book">
              <img src="depth-7-frame-013.png" alt="Echoes of the Past cover" className="book__img book__img--large" />
              <h3 className="book__title">Echoes of the Past</h3>
              <p className="book__blurb">A captivating historical fiction set in ancient times.</p>
            </article>

            <article className="book">
              <img src="depth-7-frame-014.png" alt="The Modern Nomad cover" className="book__img book__img--large" />
              <h3 className="book__title">The Modern Nomad</h3>
              <p className="book__blurb">A contemporary story about a nomad's journey.</p>
            </article>
          </div>
        </section>

        {/* ============ NEW ARRIVALS ============ */}
        <section className="section">
          <h2 className="section__heading">New Arrivals</h2>

          <div className="book-grid">
            <article className="book">
              <img src="depth-7-frame-015.png" alt="The Dragon's Legacy cover" className="book__img" />
              <h3 className="book__title">The Dragon's Legacy</h3>
              <p className="book__blurb">The beginning of a new fantasy saga.</p>
            </article>

            <article className="book">
              <img src="depth-7-frame-016.png" alt="The Vanishing Act cover" className="book__img" />
              <h3 className="book__title">The Vanishing Act</h3>
              <p className="book__blurb">A puzzling mystery with unexpected twists.</p>
            </article>

            <article className="book">
              <img src="depth-7-frame-017.png" alt="The Quantum Leap cover" className="book__img" />
              <h3 className="book__title">The Quantum Leap</h3>
              <p className="book__blurb">A groundbreaking science fiction novel.</p>
            </article>
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="footer">
        <nav className="footer__links">
          <a href="#" className="footer__link">About&nbsp;Us</a>
          <a href="#" className="footer__link">Contact</a>
          <a href="#" className="footer__link">Privacy&nbsp;Policy</a>
          <a href="#" className="footer__link">Terms&nbsp;of&nbsp;Service</a>
        </nav>
        <p className="footer__copy">© 2025&nbsp;BookHub. All rights reserved.</p>
      </footer>
  );
}
