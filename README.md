# Merchant Contact Manager

A production-ready customer contact management system built with modern web technologies.

## 🚀 Tech Stack

- **Framework**: React Router v7 (Framework Mode)
- **Language**: TypeScript (Strict Mode)
- **Database**: MongoDB
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI
- **Validation**: Zod
- **Runtime**: Node.js

## 📁 Project Structure

```
merchant-contact/
├── app/
│   ├── routes/              # React Router routes
│   ├── components/          # Reusable UI components
│   │   └── ui/             # Shadcn UI components
│   ├── context/            # React context providers
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── lib/                # Core libraries
│   │   ├── db/            # MongoDB connection & models
│   │   └── validation/    # Zod validation schemas
│   ├── root.tsx           # Root layout
│   └── app.css            # Global styles
├── public/                 # Static assets
└── react-router.config.ts # React Router configuration
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ installed
- MongoDB installed locally or MongoDB Atlas account
- MongoDB Compass (optional, for GUI)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/merchant-contact
   NODE_ENV=development
   ```

3. **Start MongoDB** (if using local installation):
   ```bash
   # macOS (with Homebrew)
   brew services start mongodb-community

   # Or run manually
   mongod --config /usr/local/etc/mongod.conf
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to `http://localhost:5173`

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run typecheck` - Run TypeScript type checking

## 🎯 Features (Planned)

### Phase 1: Foundation ✅
- [x] Project initialization
- [x] TypeScript configuration
- [x] Tailwind CSS + Shadcn UI setup
- [x] Folder structure
- [x] Type definitions

### Phase 2: MongoDB Integration
- [x] MongoDB connection setup
- [x] Customer model & validation
- [x] API routes (CRUD)

### Phase 3: Core Features
- [x] Customer list page
- [x] Create customer form
- [x] Edit customer form
- [x] Customer detail view
- [x] Delete functionality

### Phase 4: Advanced Features
- [x] Search functionality
- [x] Filter by status/tags
- [x] Dashboard with statistics
- [x] Pagination
- [x] Bulk operations

## 🗄️ Database Schema

### Customer Collection

```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  phone?: string,
  company?: string,
  status: 'active' | 'inactive',
  tags: string[],
  notes?: string,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 UI Components

Using Shadcn UI components:
- Button
- Input
- Form
- Card
- Badge
- Dialog
- Table
- And more...

## 📚 Learning Resources

- [React Router v7 Docs](https://reactrouter.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn UI](https://ui.shadcn.com)

## 🤝 Contributing

This is a learning project. Feel free to experiment and extend functionality!

## 📄 License

MIT
