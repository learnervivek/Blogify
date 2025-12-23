# BlogApp

A full-stack blogging platform built with Node.js, Express, and MongoDB. Users can create, edit, delete, and comment on blogs with image uploads powered by Cloudinary.

## 🛠️ Tech Stack

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** (v5.2.1) - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** (v9.0.1) - MongoDB object modeling
- **EJS** (v3.1.10) - Template engine for server-side rendering

### Authentication & Security

- **JWT (JSON Web Tokens)** (v9.0.3) - Secure authentication
- **Cookie Parser** (v1.4.7) - Parse HTTP request cookies
- **Crypto** - Built-in Node.js module for password hashing

### File & Image Management

- **Multer** (v2.0.2) - Middleware for file uploads
- **Multer Storage Cloudinary** (v4.0.0) - Store files in Cloudinary
- **Cloudinary** (v1.41.3) - Cloud storage for images

### Development

- **dotenv** (v17.2.3) - Environment variable management
- **Nodemon** (v3.1.11) - Auto-restart server during development

## ✨ Features

### User Management

- **User Registration** - Sign up with email and password
- **User Authentication** - Secure login/logout with JWT tokens
- **User Profiles** - View user profiles with bio and profile picture
- **Profile Management** - Update profile information and avatar
- **Role-based Access** - Support for USER and ADMIN roles

### Blog Management

- **Create Blogs** - Users can create new blog posts with rich text content
- **Edit Blogs** - Authors can edit their own blog posts
- **Delete Blogs** - Authors can delete their blog posts
- **View Blogs** - Public blog viewing with author information
- **Blog Cover Images** - Upload cover images for blogs via Cloudinary
- **Timestamped Posts** - Automatic creation and update timestamps

### Comments & Engagement

- **Add Comments** - Users can comment on blog posts
- **Comment Management** - View and manage comments on blogs
- **Nested Comments** - Comment replies and threading

### Image Management

- **Profile Pictures** - Upload and display user avatars
- **Blog Cover Images** - Upload cover images for blog posts
- **Cloud Storage** - All images stored securely on Cloudinary
- **Automatic Resizing** - Cloudinary handles image optimization

## 📁 Project Structure

```
BlogApp/
├── app.js                          # Main application entry point
├── package.json                    # Project dependencies and scripts
├── package-lock.json              # Locked dependency versions
├── .env                           # Environment variables (not in repo)
├── .gitignore                     # Git ignore rules
│
├── config/
│   └── cloudinary.js              # Cloudinary configuration and upload handlers
│
├── models/
│   ├── user.js                    # User schema and authentication methods
│   ├── blog.js                    # Blog post schema
│   └── comment.js                 # Comment schema
│
├── middlewares/
│   └── authentication.js          # JWT authentication middleware
│
├── routes/
│   ├── user.js                    # User authentication and profile routes
│   └── blog.js                    # Blog CRUD and comment routes
│
├── services/
│   └── authentication.js          # Authentication business logic
│
├── views/                         # EJS template files
│   ├── home.ejs                   # Homepage - list all blogs
│   ├── blog.ejs                   # Individual blog view with comments
│   ├── addBlog.ejs                # Create new blog form
│   ├── editBlog.ejs               # Edit blog form
│   ├── profile.ejs                # User profile page
│   ├── signin.ejs                 # Login page
│   ├── signup.ejs                 # Registration page
│   └── partials/
│       ├── head.ejs               # HTML head section
│       ├── nav.ejs                # Navigation bar component
│       ├── footer.ejs             # Footer component
│       └── scripts.ejs            # Common scripts
│
├── public/                        # Static files
│   ├── css/
│   │   └── styles.css             # Application styles
│   └── uploads/                   # User-uploaded files directory
│
└── node_modules/                  # Project dependencies (not in repo)
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account for image storage

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd BlogApp
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root directory with the following variables:

   ```env
   PORT=8000
   MONGO_URL=mongodb://localhost:27017/blogapp
   JWT_SECRET=your_jwt_secret_key_here
   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Start the server**
   ```bash
   npm start
   ```
   The application will run on `http://localhost:8000`

### Development Mode

For development with auto-restart:

```bash
npm run dev
```

## 📖 Usage

### User Registration & Authentication

1. Navigate to the signup page
2. Enter your full name, email, and password
3. Account is created and you're logged in
4. Login with your credentials on the signin page

### Creating a Blog

1. Click "Add New Blog" (requires authentication)
2. Enter blog title and content
3. Upload a cover image (optional)
4. Submit to publish

### Managing Your Blog

- **Edit**: Click edit button on your blog post
- **Delete**: Click delete button on your blog post
- **Comment**: Add comments to any blog post
- **View Profile**: Visit user profiles to see their blog activity

## 🔐 Environment Configuration

### Required Environment Variables

| Variable                | Description                  | Example                                               |
| ----------------------- | ---------------------------- | ----------------------------------------------------- |
| `PORT`                  | Server port                  | `8000`                                                |
| `MONGO_URL`             | MongoDB connection string    | `mongodb+srv://user:pass@cluster.mongodb.net/blogapp` |
| `JWT_SECRET`            | Secret key for JWT tokens    | `your_secret_key_123`                                 |
| `CLOUDINARY_NAME`       | Your Cloudinary account name | `your_cloud_name`                                     |
| `CLOUDINARY_API_KEY`    | Cloudinary API key           | `123456789`                                           |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret        | `your_secret_key`                                     |

## 📊 Database Schema

### User Model

```javascript
{
  fullName: String (required),
  email: String (unique, required),
  password: String (hashed, required),
  salt: String (for hashing),
  profileImageURL: String,
  bio: String,
  role: String (enum: ["USER", "ADMIN"]),
  timestamps: true
}
```

### Blog Model

```javascript
{
  title: String (required),
  body: String (required),
  coverImageURL: String,
  createdBy: ObjectId (ref: User),
  timestamps: true
}
```

### Comment Model

```javascript
{
  content: String (required),
  blogId: ObjectId (ref: Blog),
  createdBy: ObjectId (ref: User),
  timestamps: true
}
```

## 🔑 Key Features Details

### Authentication Flow

1. User registers with email and password
2. Password is hashed using SHA256 with a salt
3. On login, JWT token is created and stored in cookies
4. Middleware verifies JWT on each protected route
5. Token includes user ID for authorization checks

### Image Upload Process

1. File selected via form
2. Multer processes the upload
3. File sent to Cloudinary storage
4. Cloudinary returns secure URL
5. URL stored in database

### Authorization

- **Owner-only actions**: Only blog creators can edit/delete their blogs
- **Authentication-required**: Commenting and blog creation require login
- **Public access**: Anyone can view blogs and user profiles

## 📝 API Routes

### User Routes (`/user`)

- `GET /signin` - Show login form
- `POST /signin` - Process login
- `GET /signup` - Show registration form
- `POST /signup` - Create new user account
- `GET /logout` - Logout user
- `GET /profile` - View user profile
- `POST /profile` - Update user profile

### Blog Routes (`/blog`)

- `GET /add-new` - Show create blog form
- `POST /add-new` - Create new blog
- `GET /:id` - View blog post and comments
- `GET /:id/edit` - Show edit form
- `POST /:id` - Update blog post
- `GET /:id/delete` - Delete blog post
- `POST /:id/comment` - Add comment to blog

## 🎨 Frontend

The frontend is rendered server-side using EJS templates with:

- Responsive design with CSS
- Form validation
- Interactive comment section
- User-friendly navigation
- Profile customization

## 🛡️ Security Features

- **Password Hashing**: SHA256 with salt-based hashing
- **JWT Authentication**: Secure token-based sessions
- **Cookie Security**: HTTP-only cookies for token storage
- **Authorization Checks**: Owner verification for sensitive operations
- **Input Validation**: Server-side validation of user inputs
- **Environment Variables**: Sensitive data stored in `.env` file

## 📦 Dependencies Summary

| Package       | Version | Purpose            |
| ------------- | ------- | ------------------ |
| express       | ^5.2.1  | Web framework      |
| mongoose      | ^9.0.1  | Database ODM       |
| ejs           | ^3.1.10 | Template engine    |
| jsonwebtoken  | ^9.0.3  | JWT authentication |
| multer        | ^2.0.2  | File uploads       |
| cloudinary    | ^1.41.3 | Cloud storage      |
| cookie-parser | ^1.4.7  | Cookie handling    |
| dotenv        | ^17.2.3 | Environment vars   |

## 🚀 Deployment

### Prerequisites for Deployment

- Node.js hosting (Heroku, Railway, Render, etc.)
- MongoDB Atlas (cloud MongoDB)
- Cloudinary account (free tier available)

### Deployment Steps

1. Ensure all environment variables are configured on hosting platform
2. Push code to repository
3. Connect repository to hosting platform
4. Set environment variables in hosting dashboard
5. Deploy and monitor logs

## 🐛 Troubleshooting

### MongoDB Connection Issues

- Verify `MONGO_URL` is correct
- Check if MongoDB server is running (for local setup)
- Ensure IP whitelist is configured (for MongoDB Atlas)

### Cloudinary Upload Errors

- Verify API credentials are correct
- Check Cloudinary account has available storage
- Ensure file size is within limits

### JWT Authentication Issues

- Clear browser cookies
- Verify `JWT_SECRET` is set correctly
- Check token expiration settings

## 📄 License

ISC

## 👤 Author

Your Name/Organization

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests.

## 📞 Support

For issues and questions, please open an issue on the repository.

---

**Last Updated**: December 23, 2025
