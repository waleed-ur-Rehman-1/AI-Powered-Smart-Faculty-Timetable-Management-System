# 📅 AI-Powered Smart Faculty Timetable Management System

Welcome to the AI-Powered Timetable System! This is a full-stack mobile application designed for Universities. It allows Administrators to manage Faculty, Courses, and Classrooms, and uses an **AI Engine** to automatically generate conflict-free timetables. Teachers can log in to view their personalized schedules.

---

## 🚀 What Does This App Do? (Features)

### 👑 For Administrators:

- **Manage Data**: Add, view, and manage Teachers, Courses, and Classrooms directly from the mobile app.
- **AI Generation**: Click a button to let the AI automatically assign classes to teachers and rooms without any scheduling conflicts (e.g., no teacher is in two places at once).
- **Dashboard**: See a quick overview of the whole university (Total Teachers, Total Classes Scheduled, etc.).

### 👨‍🏫 For Faculty Members (Teachers):

- **Personal Dashboard**: See how many classes you have today and your maximum allowed teaching hours.
- **View Timetable**: View your weekly class schedule, including course names, rooms, and times.
- **Role-Based Security**: Teachers only see their own schedule, not the whole university's schedule.

---

## 🛠️ Technology Used

- **Mobile App (Frontend)**: React Native (Expo), Expo Router for navigation, Zustand for state management, Axios for API calls.
- **Backend (Server)**: Node.js, Express.js, TypeScript.
- **Database**: Neon (Serverless PostgreSQL), Prisma ORM.
- **AI & Security**: Constraint-based AI scheduling algorithm, JWT (JSON Web Tokens) for secure login, bcrypt for password hashing.

---

## 📁 Project Structure

This project is split into two main folders:

1. `waleed/` (The Mobile App)
2. `waleed-backend/` (The Server & Database API)

---

## ⚙️ How to Install and Run the Project (Step-by-Step)

### Prerequisites

Make sure you have **Node.js** and **Git** installed on your computer. You will also need an account on **Neon.tech** (for the database).

### Step 1: Set up the Backend

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd waleed-backend
   Install dependencies:
   ```

bash
npm install
Create a .env file in the waleed-backend folder and add your Neon Database URL:

env
DATABASE_URL="postgresql://your_neon_db_url_here"
JWT_SECRET="super_secret_key_123"
PORT=5000
Push the database schema to your Neon database:

bash
npx prisma db push
npx prisma generate
Start the backend server:

bash
npm run dev
(The server should now be running on http://localhost:5000)

Step 2: Set up the Mobile App
Open a new terminal and navigate to the mobile folder:

bash
cd waleed
Install dependencies:

bash
npm install
Start the Expo development server:

bash
npx expo start -c
Press a to open on an Android Emulator, or scan the QR code with the Expo Go app on your physical phone.

🔑 Default Login Credentials
Use these accounts to test the different roles in the app:

👑 Admin Account:

Email: admin@university.edu

Password: password123

👨‍🏫 Teacher Account 1:

Email: ali@university.edu

Password: password123

👨‍🏫 Teacher Account 2:

Email: sara@university.edu

Password: password123

🧠 How the AI Scheduling Works
When the Admin clicks "Generate AI Timetable", the backend looks at all unassigned courses. It loops through available time slots and rooms. It strictly checks if the teacher is already busy at that time, or if the room is already booked. If both are free, it assigns the class. If there is a conflict, it moves to the next slot automatically.

text

---

### 🐙 How to Push to GitHub (Commands)

Before pushing, we **MUST** make sure your `.env` file (which contains your secret database password) is not uploaded to GitHub.

#### Step 1: Add a `.gitignore` file

Make sure you have a file named `.gitignore` in **both** `waleed` and `waleed-backend` folders. Open them and make sure these lines are inside:

```text
node_modules/
.env
.expo/
dist/
Step 2: Create a Repository on GitHub
Go to GitHub.com and log in.

Click the "+" icon in the top right -> New repository.

Name it AI-Faculty-Timetable-System.

Keep it Public or Private (your choice). DO NOT check "Add a README file" or "Add .gitignore".

Click Create repository.

Copy the URL it gives you (it looks like https://github.com/YOUR_USERNAME/AI-Faculty-Timetable-System.git).
```
