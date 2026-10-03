# Book Recommendation System

A full-stack bookstore application for browsing books, managing a cart and wishlist, placing orders, and receiving personalized recommendations. The project combines a Django REST API backend with a React + Vite frontend and includes separate user and admin flows.

## Overview

This application lets users explore a catalog of books, search and filter by title or author, rate books, and add selected titles to a cart or wishlist. The backend exposes authenticated REST endpoints for browsing, checkout, and recommendation generation, while the frontend focuses on user-facing discovery and purchase flows. Admin users can review sales metrics, view low-stock alerts, and manage inventory.

## Features

- User registration and login with Django authentication and token-based API sessions
- Book browsing with search and paginated results
- Book ratings and review submissions
- Cart and wishlist management per authenticated user
- Checkout flow with Stripe, eSewa, and cash-on-delivery options
- Order creation, order status tracking, and order cancellation for pending orders
- Admin dashboard with sales totals, revenue, order counts, best-selling books, and low-stock alerts
- Stock management for admin-added books
- Personalized recommendation endpoint with hybrid user/item recommendation logic and fallback popular-book suggestions
- Responsive frontend built with React and Tailwind CSS

## Tech Stack

### Frontend

- React 19
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- React Hook Form
- Yup
- React Toastify
- Stripe.js / react-stripe-js

### Backend

- Python
- Django 5.2.8
- Django REST Framework
- Django Filters
- Django Token Authentication
- Python packages for data processing and recommendation logic: pandas, numpy, scipy, scikit-learn

### Database

- SQLite for local development (`DEBUG=True`)
- PostgreSQL-compatible database support via `dj_database_url` when `DEBUG=False`

### Infrastructure / Services

- Stripe Payment Intents API
- eSewa payment flow
- Django media uploads via `ImageField` for book covers and profile avatars

## Architecture / Project Structure

```text
BookRecommendationSystem/
├── backend/
│   └── bookhub/
│       ├── accounts/              # Registration, login, user info endpoints
│       ├── adminDashboard/        # Admin statistics API
│       ├── books/                 # Books, ratings, cart, wishlist, dataset imports
│       ├── bookhub/               # Django project configuration
│       ├── media/                 # Uploaded media files
│       ├── orders/                # Order and order-item models/views
│       ├── payment/               # eSewa verification endpoint
│       ├── recommendation/        # Recommendation logic and API
│       ├── stripePayment/         # Stripe PaymentIntent generation
│       ├── userprofile/           # User profile and avatar handling
│       ├── db.sqlite3             # Local SQLite database
│       ├── manage.py
│       ├── requirements.txt
│       └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   ├── .env
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package-lock.json
├── .gitignore
├── README.md
└── .git
```

The Django backend handles authentication, persistence, order processing, recommendation endpoints, and business logic. The React frontend is responsible for page routing, conditional access by user role, cart and checkout flows, and the interactive book discovery experience.

## How It Works

- Users sign up or log in through the frontend, which posts credentials to `/accounts/login/` and stores the returned Django token in localStorage.
- The `AuthContext` provider reads the token and current user profile, while route guards restrict access to admin and user pages based on `is_staff`.
- Book data is served from the backend in paginated lists, with dataset-backed books and admin-created books loaded separately.
- Users can add books to a cart or wishlist; cart items are persisted per user and validated against current stock.
- Orders are created from the cart and checkout form. For cash-on-delivery, the backend creates the order immediately; for Stripe and eSewa, the frontend routes through payment pages before the order is finalized.
- The recommendation endpoint calls a hybrid recommender that combines user-based and item-based collaborative filtering and falls back to popular books when insufficient ratings are available.
- Admins access dashboard stats and stock updates through dedicated endpoints protected by `IsAdminUser`.

## API

The repository uses Django REST Framework with router-based endpoints rather than an OpenAPI specification. Important implemented endpoints include:

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/accounts/register/` | Create a new user account | No |
| POST | `/accounts/login/` | Authenticate a user and return a DRF token | No |
| GET | `/accounts/user/` | Fetch the authenticated user profile | Token |
| GET | `/books/all/` | Search and paginate books by title, author, or ISBN | Token |
| GET | `/books/` | List books from the main router-backed API | Token or public for read-only `BookViewSet` |
| GET | `/books/{id}/` | Fetch a single book record | Token or public for read-only `BookViewSet` |
| POST | `/books/cart/` | Add an item to the authenticated user's cart | Token |
| GET | `/books/cart/` | List cart items for the current user | Token |
| POST | `/books/wishlist/` | Add a book to the authenticated user's wishlist | Token |
| GET | `/books/wishlist/` | List wishlist items for the current user | Token |
| POST | `/books/reviews/` | Create or update a book review rating for the authenticated user | Token |
| POST | `/orders/` | Create a new order from checkout data | Token |
| GET | `/orders/` | Retrieve the authenticated user's orders, or all orders for staff | Token |
| POST | `/orders/{id}/cancel/` | Cancel a pending order | Token |
| POST | `/create-stripe-payment-intent/` | Create a Stripe PaymentIntent using the provided total amount | Token |
| GET | `/recommend/?user_id=<id>` | Get personalized recommendation results for a user | Token |
| GET | `/dashboard-stats/` | Retrieve admin sales and inventory statistics | Admin only |

Example request body for checkout:

```json
{
  "full_name": "Jane Doe",
  "street": "Main Street",
  "ward": "12",
  "province": "Bagmati",
  "city": "Kathmandu",
  "postal_code": "44600",
  "email": "jane@example.com",
  "phone": "9812345678",
  "shipping_method": "standard",
  "payment_method": "stripe",
  "shipping_cost": "50.00",
  "total": "1850.00",
  "items": [
    { "book": 1, "quantity": 1, "price": "1500.00" }
  ]
}
```

## Authentication & Authorization

Authentication is implemented with Django's built-in user model and DRF `TokenAuthentication`.

- Login and registration are handled through `accounts/views.py`.
- On successful login, the backend returns a token that the frontend stores in localStorage.
- Authenticated API calls attach the token in the `Authorization: Token <token>` header.
- Route guards in the frontend enforce access rules:
  - `UserRoute` allows authenticated non-staff users only.
  - `AdminRoute` allows authenticated admin users only.
  - `GuestRoute` prevents authenticated users from revisiting login/register pages.

There is no JWT implementation in the repository, and no custom role-permission system beyond `is_staff` is present.

## Database

The project uses Django ORM models to persist the application data.

Main models and entities:

- `User` from Django's default authentication system
- `Profile` with a user-specific avatar image
- `Book` with title, author, ISBN, price, quantity, publication year, and cover image fields
- `BookRating` storing per-user ratings and optional comments
- `CartItem` linking a user to a book and quantity
- `WishlistItem` linking a user to a favorite book
- `Order` containing shipping and payment details, totals, and order status
- `OrderItem` representing each line item in an order

This project stores local development data in SQLite. Production configuration uses `DATABASE_URL` when `DEBUG=False` and is compatible with PostgreSQL-backed deployments.

## External Services

- Stripe: `stripePayment/views.py` creates a PaymentIntent for checkout using the Stripe API.
- eSewa: `payment/views.py` verifies payment status against the eSewa verification endpoint.
- Media uploads: Django `ImageField` stores book covers and avatars under the backend `media/` directory.

## Environment Variables

Create environment files for the backend and frontend with the following variables. Do not commit real secrets.

```env
# backend/bookhub/.env
SECRET_KEY=
DEBUG=False
DATABASE_URL=
ESEWA_MERCHANT_ID=
ESEWA_MERCHANT_CODE=
ESEWA_VERIFY_URL=
ESEWA_PAYMENT_URL=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
```

```env
# frontend/.env
VITE_BACKEND_URL=http://localhost:8000
VITE_STRIPE_PUBLIC_KEY=
```

Variable usage:

- `SECRET_KEY`: Django secret key used by the backend.
- `DEBUG`: Enables local SQLite debugging when set to `True`.
- `DATABASE_URL`: PostgreSQL connection string for non-debug environments.
- `ESEWA_*`: Required for the eSewa payment verification and redirect flow.
- `STRIPE_SECRET_KEY`: Used to create Stripe PaymentIntents.
- `STRIPE_PUBLISHABLE_KEY`: Exposed to the frontend for Stripe client initialization.
- `VITE_BACKEND_URL`: Base URL for the React frontend to call the Django API.
- `VITE_STRIPE_PUBLIC_KEY`: Publishable Stripe key used in the frontend checkout flow.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Nirajan09/BookRecommendationSystem.git
cd BookRecommendationSystem
```

2. Set up the backend:

```bash
cd backend/bookhub
python -m venv .venv
```

On macOS/Linux:

```bash
source .venv/bin/activate
```

On Windows:

```powershell
.venv\Scripts\activate
```

Then install dependencies:

```bash
pip install -r requirements.txt
```

Create the database and apply migrations:

```bash
python manage.py migrate
```

(Optional) seed the catalog from the included CSV dataset:

```bash
python manage.py load_books
```

3. Set up the frontend:

```bash
cd ../../frontend
npm install
```

## Running the Project

Start the Django backend:

```bash
cd backend/bookhub
python manage.py runserver 0.0.0.0:8000
```

Start the Vite frontend in a second terminal:

```bash
cd frontend
npm run dev
```

The frontend expects the Django API at `VITE_BACKEND_URL` and typically runs on `http://localhost:5173`.

## Deployment

No deployment configuration files are included in this repository. There are no Docker, Render, Heroku, or Vercel configuration files committed here, and no production deployment manifest was found in the project root or backend directories.

The backend settings file references a Render host and a Vercel frontend in CORS configuration, but the repository itself does not contain a deployment setup to reproduce that environment.

## Testing

The repository contains Django `TestCase` placeholder files in several apps, but there is no active test suite or CI workflow committed here. No project-specific test command is configured in the current repository state.

## Future Improvements

The following items are not currently implemented, but would be reasonable additions for this codebase:

- Add a complete automated test suite for authentication, orders, and recommendation logic
- Expand the recommendation engine with stronger evaluation metrics and tuning
- Add a production deployment pipeline with environment-specific configuration
- Improve payment verification and error handling for third-party payment providers
- Add admin inventory controls for bulk imports and book management workflows

## License

No license file was found in this repository.

## Author

Repository owner: Nirajan09

- GitHub: https://github.com/Nirajan09
- Repository: https://github.com/Nirajan09/BookRecommendationSystem

## Project Highlights

- Full-stack architecture with a Django REST API and React frontend
- Token-based authentication with separate user and admin route protection
- Personalized recommendation engine using hybrid collaborative filtering with fallback popular-book results
- Checkout flow supporting Stripe, eSewa, and cash-on-delivery payments
- Admin analytics dashboard for revenue, order tracking, low-stock monitoring, and inventory updates
