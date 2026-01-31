# 📚 Book Recommendation System

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[![Contributors](https://img.shields.io/github/contributors/Nirajan09/BookRecommendationSystem)](https://github.com/Nirajan09/BookRecommendationSystem/graphs/contributors)

[![Repo Size](https://img.shields.io/github/repo-size/Nirajan09/BookRecommendationSystem)](https://github.com/Nirajan09/BookRecommendationSystem)

[![Last Commit](https://img.shields.io/github/last-commit/Nirajan09/BookRecommendationSystem)](https://github.com/Nirajan09/BookRecommendationSystem/commits/main)

A **Full-Stack Book Recommendation System** that provides personalized book suggestions based on user preferences and interactions. This project combines modern frontend frameworks with a robust backend and recommendation logic to deliver an intuitive user experience.

🔗 **Deployed App:** [https://book-recommendation-system-topaz.vercel.app](https://book-recommendation-system-topaz.vercel.app)

---

## 🧠 Overview

The Book Recommendation System helps users discover books tailored to their interests, leveraging both content-based and collaborative recommendation strategies. Users can:

- Search for books by title, author, or genre  
- Receive personalized book recommendations  
- Browse top-rated and popular books  
- Build a reading list or favorites collection  

This project demonstrates a full-stack application with clean architecture, best coding practices, and scalable design.

---

## 🚀 Features

✅ User-friendly interface to search for books  
✅ Real-time recommendations powered by an algorithm  
✅ Responsive and modern frontend design  
✅ Clean and maintainable backend with Django  
✅ Docker-ready for easy deployment  
✅ REST API for seamless integration  

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | **React**, **Next.js** |
| Backend | **Django** |
| Database | SQLite / PostgreSQL |
| API | REST API |
| DevOps | **Linux**, **Docker** |
| Deployment | Vercel / Docker |

---

## 📁 Project Structure

```
BookRecommendationSystem/
├── backend/              # Django backend
│   ├── app/              # Django apps
│   ├── manage.py
│   ├── requirements.txt
│   └── ...
├── frontend/             # React/Next.js frontend
│   ├── components/       # UI components
│   ├── pages/            # Next.js pages
│   ├── public/           # Static assets
│   └── package.json
├── docker-compose.yml    # Docker configuration
├── README.md
└── .gitignore
```

---

## 📦 Installation

### Clone the repository

```bash
git clone https://github.com/Nirajan09/BookRecommendationSystem.git
cd BookRecommendationSystem
```

---

### 💻 Backend Setup (Django)

1. Create a virtual environment:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # MacOS/Linux
.\venv\Scripts\activate   # Windows
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run migrations:

```bash
python manage.py migrate
```

4. Start the backend server:

```bash
python manage.py runserver
```

---

### 🌐 Frontend Setup (React/Next.js)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Usage

1. Launch the application in your browser.  
2. Search for books by title, author, or keyword.  
3. Receive personalized recommendations.  
4. Add books to favorites or reading lists.  

---

## 🧩 Recommendation Algorithm

This project implements a **hybrid recommendation system**, combining:

- **Content-Based Filtering:** Suggests books similar to those a user has liked based on genre, author, or keywords.  
- **Collaborative Filtering:** Suggests books based on patterns from users with similar preferences.  

This approach ensures personalized and accurate recommendations for each user.

---


## 👨‍💻 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository  
2. Create a new branch (`git checkout -b feature/xyz`)  
3. Make your changes  
4. Commit (`git commit -m 'Add feature'`)  
5. Push to your branch (`git push origin feature/xyz`)  
6. Open a Pull Request  

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 🙌 Credits

Thanks to all contributors, open-source libraries, and resources used in this project.  

✨ *Happy coding and keep discovering great books!* ✨
