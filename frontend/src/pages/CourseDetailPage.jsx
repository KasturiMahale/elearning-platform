import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

function CourseDetailPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/courses/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setCourse(response.data);
      } catch (err) {
        setError('Failed to load course');
      }
    };

    fetchCourse();
  }, [id]);

  const handleEnroll = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Please login to enroll');
        return;
      }

      await axios.post(
        `${API_URL}/api/enrollments`,
        { courseId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('Enrolled successfully!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Enrollment failed');
    }
  };

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!course) return <p>Loading...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>{course.title}</h2>
      <p>{course.description}</p>
      <p><strong>Category:</strong> {course.category}</p>
      <p><strong>Price:</strong> ₹{course.price}</p>
      <p><strong>Instructor:</strong> {course.instructor?.name}</p>

      <h3>Lessons</h3>
      <ul>
        {course.lessons.map((lesson) => (
          <li key={lesson._id}>
            {lesson.title} ({lesson.duration} min)
          </li>
        ))}
      </ul>

      <button onClick={handleEnroll}>Enroll Now</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default CourseDetailPage;