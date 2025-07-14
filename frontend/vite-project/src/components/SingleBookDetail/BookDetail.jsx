import React from "react";
import "./book-detail.css"; // Make sure this path is correct

const BookDetail = () => (
  <div>
    

    {/* BREADCRUMBS & TITLE */}
    <section className="breadcrumb">
      <a href="#" className="breadcrumb__link">Books</a>
      <span className="breadcrumb__sep">/</span>
      <a href="#" className="breadcrumb__link">Fiction</a>
    </section>
    <section className="book-header">
      <h1 className="book-title">The Secret Garden</h1>
      <p className="book-author">By Frances Bennett</p>
    </section>

    {/* COVER & DETAILS */}
    <section className="book-main">
      <img src="depth-6-frame-05.png" alt="The Secret Garden cover" className="book-cover" />
      <div className="book-details">
        <h2 className="details-heading">Publication Details</h2>
        <dl className="details-list">
          <div className="detail-item">
            <dt>Publisher</dt>
            <dd>HarperCollins</dd>
          </div>
          <div className="detail-item">
            <dt>Publication Date</dt>
            <dd>1911</dd>
          </div>
          <div className="detail-item">
            <dt>Language</dt>
            <dd>English</dd>
          </div>
          <div className="detail-item">
            <dt>Pages</dt>
            <dd>331</dd>
          </div>
          <div className="detail-item">
            <dt>ISBN</dt>
            <dd>978-0062318960</dd>
          </div>
        </dl>
      </div>
    </section>

    {/* ABOUT */}
    <section className="about">
      <h2>About the Book</h2>
      <p>
        The Secret Garden tells the story of Mary Lennox, a spoiled and neglected young girl who is sent to live with her uncle in a large, isolated manor in the English countryside after her parents' death. Initially, Mary is unhappy and difficult, but her discovery of a hidden, overgrown garden and her friendship with Dickon, a local boy who understands nature, lead to her transformation. As Mary and Dickon work together to restore the garden, they also help Mary’s sickly cousin, Colin, to regain his health and happiness. The novel explores themes of personal growth, the healing power of nature, and the importance of friendship and compassion.
      </p>
    </section>

    {/* CUSTOMER REVIEWS SUMMARY */}
    <section className="reviews-summary">
      <h2>Customer Reviews</h2>
      <div className="rating-overview">
        <div className="rating-score">4.5</div>
        <div className="stars">
          <img src="vector-04.svg" alt="star" className="star" />
          <img src="vector-05.svg" alt="star" className="star" />
          <img src="vector-06.svg" alt="star" className="star" />
          <img src="vector-07.svg" alt="star" className="star" />
          <img src="vector-08.svg" alt="star" className="star" />
        </div>
        <div className="review-count">1,250 reviews</div>
      </div>
      <ul className="rating-breakdown">
        <li><strong>5 stars:</strong> 40%</li>
        <li><strong>4 stars:</strong> 30%</li>
        <li><strong>3 stars:</strong> 15%</li>
        <li><strong>2 stars:</strong> 10%</li>
        <li><strong>1 star:</strong> 5%</li>
      </ul>
    </section>

    {/* INDIVIDUAL REVIEWS */}
    <section className="reviews-list">
      <h2>Top Reviews</h2>
      <article className="review">
        <img src="depth-7-frame-015.png" alt="Reviewer avatar" className="reviewer-avatar" />
        <div className="review-content">
          <header>
            <h3 className="reviewer-name">Sophia Carter</h3>
            <time dateTime="2023-05-15" className="review-date">May 15, 2023</time>
          </header>
          <div className="review-stars">
            <img src="vector-09.svg" alt="star" className="star" />
            <img src="vector-10.svg" alt="star" className="star" />
            <img src="vector-11.svg" alt="star" className="star" />
            <img src="vector-12.svg" alt="star" className="star" />
            <img src="vector-13.svg" alt="star" className="star" />
          </div>
          <p className="review-text">
            This book is a timeless classic that I absolutely loved. The story of Mary’s transformation and the magic of the secret garden are truly captivating. Highly recommend!
          </p>
          <div className="review-helpful">
            <button>15 found this helpful</button>
            <button>2 found this helpful</button>
          </div>
        </div>
      </article>
      {/* Add more <article className="review"> blocks for other reviews */}
    </section>

    {/* SIMILAR BOOKS */}
    <section className="similar-books">
      <h2>Similar Books</h2>
      <div className="similar-list">
        <div className="similar-item">
          <img src="depth-7-frame-024.png" alt="A Little Princess cover" />
          <h3>A Little Princess</h3>
          <p>By Frances Bennett</p>
        </div>
        <div className="similar-item">
          <img src="depth-7-frame-025.png" alt="Anne of Green Gables cover" />
          <h3>Anne of Green Gables</h3>
          <p>By Lucy Montgomery</p>
        </div>
        <div className="similar-item">
          <img src="depth-7-frame-026.png" alt="The Railway Children cover" />
          <h3>The Railway Children</h3>
          <p>By Edith Nesbit</p>
        </div>
      </div>
    </section>
  </div>
);

export default BookDetail;
