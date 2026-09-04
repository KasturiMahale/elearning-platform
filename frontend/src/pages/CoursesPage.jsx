import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/courses');
        setCourses(response.data);
      } catch (err) {
        setError('Failed to load courses');
      }
    };

    fetchCourses();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>All Courses</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {courses.length === 0 && !error && <p>Loading courses...</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {courses.map((course) => (
          <div key={course._id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <p><strong>Category:</strong> {course.category}</p>
            <p><strong>Price:</strong> ₹{course.price}</p>
            <p><strong>Instructor:</strong> {course.instructor?.name}</p>
            <Link to={`/courses/${course._id}`}>View Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CoursesPage;