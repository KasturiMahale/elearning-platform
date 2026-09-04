import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import MyLearningPage from './pages/MyLearningPage';
import CreateCoursePage from './pages/CreateCoursePage';

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/my-learning" element={<MyLearningPage />} />
        <Route path="/create-course" element={<CreateCoursePage />} />
        <Route path="/" element={<h1>Welcome to E-Learning Platform</h1>} />
      </Routes>
    </div>
  );
}

export default App;