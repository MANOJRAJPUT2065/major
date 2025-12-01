# 🚀 ParseX - Compiler & Interpreter Visualizer

<div align="center">

![ParseX Banner](public/preview.png)

**Visualize Your Code Like Never Before**

[![Next.js](https://img.shields.io/badge/Next.js-15.1.5-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

[Demo](http://localhost:3000) • [Features](#-features) • [Installation](#-installation) • [Usage](#-usage)

</div>

---

## 📖 Overview

**ParseX** is an interactive educational platform that brings programming language compilation and interpretation processes to life. Built with Next.js 15 and powered by Google's Gemini AI, ParseX provides real-time visualization of how your code transforms from source to execution.

Whether you're a student learning compiler design, an educator teaching programming concepts, or a developer curious about how languages work under the hood, ParseX makes complex concepts accessible through beautiful, interactive visualizations.

## ✨ Features

### 🔧 Compiler Visualization (Java)

- **📝 Lexical Analysis**: Real-time tokenization of Java code into keywords, operators, identifiers, and more
- **🌳 Abstract Syntax Tree (AST)**: Interactive D3-powered tree visualization using ANTLR4 parser
- **⚙️ Intermediate Code Generation**: AI-powered Java to Assembly conversion (single-pass)
- **🎯 Code Optimization**: Three-pass optimization with detailed explanations

### 🐍 Interpreter Visualization (Python & C++)

- **📝 Lexical Analysis**: Token breakdown for Python and C++ source code
- **🌳 Parse Tree**: AI-generated AST visualization
- **💾 Bytecode Generation**: Python bytecode with detailed annotations
- **🚀 Optimized Bytecode**: Performance-optimized bytecode with efficiency improvements

### 💼 Session Management

- **🔐 User Authentication**: Secure sign-in/sign-up via Clerk
- **💾 Auto-Save**: Automatic code persistence to PostgreSQL (Neon)
- **📂 Session History**: Access previous compiler and interpreter sessions
- **🗑️ Session Management**: Create, view, and delete sessions
- **🆔 UUID-based Sessions**: Unique identifiers for each coding session

### 🎨 User Interface

- **🌙 Modern Design**: Clean, professional interface with Tailwind CSS
- **✨ Smooth Animations**: Delightful interactions with Radix UI components
- **📱 Responsive**: Works seamlessly on desktop and mobile devices
- **💻 Monaco Editor**: VS Code-quality code editing experience
- **🎨 Syntax Highlighting**: Beautiful code presentation

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.1.5 (App Router)
- **UI Library**: React 19.0.0
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS + Radix UI
- **Code Editor**: Monaco Editor (VS Code editor)
- **Visualizations**: D3.js + react-d3-tree
- **Icons**: Lucide React

### Backend
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM
- **Authentication**: Clerk
- **AI**: Google Gemini 2.0 (via `@google/genai`)
- **Parser**: ANTLR4 (Java9Lexer/Parser)

### Development
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint
- **Package Manager**: npm

## 📦 Installation

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- PostgreSQL database (or Neon account)
- Clerk account (for authentication)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Aveek-Chakraborty/compiler-interpreter-visualiser.git
cd compiler-interpreter-visualiser
```

### Step 2: Install Dependencies

```bash
npm install --legacy-peer-deps
```

> **Note**: Use `--legacy-peer-deps` due to React 19 compatibility with some dependencies.

### Step 3: Environment Setup

Create a `.env.local` file in the root directory:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Database (Neon PostgreSQL)
NEXT_PUBLIC_DATABASE_URL=postgresql://username:password@host/database?sslmode=require
```

#### Get Your API Keys:

1. **Clerk**: Sign up at [clerk.com](https://clerk.com) and create a new application
2. **Neon Database**: Create a free database at [neon.tech](https://neon.tech)

### Step 4: Database Setup

Push the database schema:

```bash
npm run db:push
```

Optional - Open Drizzle Studio to view your database:

```bash
npm run db:studio
```

### Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Usage

### Creating a Compiler Session (Java)

1. Navigate to the **Dashboard**
2. Click the **"+"** button under "Compiler Visualization"
3. Write or paste your Java code in the Monaco editor
4. Click **Save** to persist your session
5. Explore the visualizations:
   - **Lexical Analysis**: Click to view token breakdown
   - **AST Viewer**: Click to see interactive syntax tree
   - **Intermediate Code**: Generate Assembly code
   - **Code Optimization**: View optimized three-pass compilation

### Creating an Interpreter Session (Python/C++)

1. Navigate to the **Dashboard**
2. Click the **"+"** button under "Interpreter Visualization"
3. Select your language (Python or C++)
4. Write your code in the editor
5. Click **Save** to preserve your work
6. Explore the features:
   - **Lexical Analysis**: Token categorization
   - **Parse Tree**: AI-generated AST
   - **Bytecode**: Low-level representation
   - **Optimized Bytecode**: Performance improvements

### Managing Sessions

- **View Sessions**: All saved sessions appear in the dashboard
- **Resume Session**: Click on any session card to continue editing
- **Delete Session**: Click the trash icon to remove a session
- **Auto-Save**: Code is automatically saved on changes

## 📚 Project Structure

```
compiler-interpreter-visualiser/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Authentication routes
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── api/                     # API routes
│   │   ├── save/               # Compiler session CRUD
│   │   ├── saveInterpreter/    # Interpreter session CRUD
│   │   ├── getComp/            # Get compiler sessions
│   │   ├── getInt/             # Get interpreter sessions
│   │   ├── deleteComp/         # Delete compiler session
│   │   └── deleteInt/          # Delete interpreter session
│   ├── dashboard/              # Main application
│   │   ├── [id]/              # Compiler workspace
│   │   │   └── components/    # Compiler visualizations
│   │   ├── interpreter/[id]/  # Interpreter workspace
│   │   │   └── components/    # Interpreter visualizations
│   │   └── components/        # Shared components
│   ├── actions.ts             # Server actions
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Landing page
├── components/                 # Reusable UI components
│   └── ui/                    # Shadcn UI components
├── grammar/                    # ANTLR4 grammar files
│   ├── Java9Lexer.g4
│   └── Java9Parser.g4
├── parser/                     # Generated ANTLR4 parsers
│   ├── Java9Lexer.ts
│   └── Java9Parser.ts
├── utils/                      # Utility functions
│   ├── db.ts                  # Database connection
│   ├── schema.ts              # Drizzle schema
│   └── GeminiAIModel.tsx      # AI integration
├── __tests__/                 # Jest tests
├── public/                    # Static assets
└── package.json               # Dependencies
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Test files cover:
- Compiler session CRUD operations
- Interpreter session CRUD operations
- API route functionality

## 🔧 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push database schema
npm run db:studio    # Open Drizzle Studio
npm test            # Run tests
```

## 🌐 API Endpoints

### Compiler Sessions
- `GET /api/save?q={sessionId}` - Get session by ID
- `POST /api/save` - Create new session
- `PUT /api/save` - Update existing session
- `GET /api/getComp?q={email}` - Get user's compiler sessions
- `DELETE /api/deleteComp?q={sessionId}` - Delete session

### Interpreter Sessions
- `GET /api/saveInterpreter?q={sessionId}` - Get session by ID
- `POST /api/saveInterpreter` - Create new session
- `PUT /api/saveInterpreter` - Update existing session
- `GET /api/getInt?q={email}` - Get user's interpreter sessions
- `DELETE /api/deleteInt?q={sessionId}` - Delete session

## ⚙️ Configuration

### Database Schema

```typescript
// Compiler sessions
UserData {
  id: string (primary key)
  code: string
  email: string
}

// Interpreter sessions
InterpData {
  id: string (primary key)
  code: string
  email: string
}
```

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Environment Variables (Production)

Ensure all `.env.local` variables are added to your deployment platform.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - Amazing React framework
- **Google Gemini** - AI-powered code analysis
- **Clerk** - Authentication made easy
- **Neon** - Serverless PostgreSQL
- **ANTLR4** - Powerful parser generator
- **Vercel** - Deployment platform



<div align="center">

**Made with ❤️ by Manoj Singh Rajput**
**Contributors : Samim,Manoj,Aveek**


</div>
