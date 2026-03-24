📘 CognitoQ – Smart Question Paper Generator

CognitoQ is an intelligent web application designed to generate university-style question papers, manage question banks, and automate exam preparation using AI-powered features.

🚀 Features
📚 Question Bank Management
Add, edit, and organize questions
Auto-filter by subject, unit, difficulty
Dynamic question retrieval from database
📝 Question Paper Generator
Generate papers based on pattern (marks, sections, etc.)
Supports Answer Any / OR options
Ensures proper distribution across units
🔄 Generate Similar Paper
Creates a new paper with same structure
Uses different questions automatically
📂 Generate from Notes
Upload notes and auto-generate questions
👥 Multi-User Access
Multiple users can use the app simultaneously
Real-time usage support
🔐 Admin Approval System
Users request access
Admin approves via email (super admin control)
📊 Paper Quality Score
Ensures balanced and accurate question distribution
📱 Responsive UI
Clean and easy-to-use interface
🏗️ Tech Stack
Frontend
React.js
Tailwind CSS
ShadCN UI
Backend
Node.js
Express.js
Database
MongoDB (or Firebase / Supabase)
Authentication
Google OAuth
Admin approval system
⚙️ Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/your-username/cognitoq.git
cd cognitoq
2️⃣ Install dependencies
npm install
3️⃣ Setup environment variables

Create a .env file:

PORT=5000
MONGO_URI=your_database_url
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
ADMIN_EMAIL=your_email
4️⃣ Run the project
npm run dev

👉 Open in browser:

http://localhost:3000
📁 Project Structure
cognitoq/
│── frontend/        # React UI
│── backend/         # APIs & auth
│── database/        # DB models
│── components/      # UI components
│── utils/           # Helper functions
🧠 Key Functionalities
Auto-fill Department, Year, Semester from subject
Question bank linked dynamically to subjects
Remove unwanted topics from paper generation
Accurate paper scoring system
Supports multiple devices and users
🔧 Improvements Implemented
Removed unnecessary UI elements (Lovable branding, upload drag)
Fixed Google login issues
Added multi-user support
Improved settings and admin control
Optimized performance and error handling
📌 Future Enhancements
📷 Question scanner (image to text)
🤖 AI-based question difficulty detection
📊 Advanced analytics dashboard
📄 Export to PDF (university format)
👤 Author

Marri Sreeshwan Reddy
