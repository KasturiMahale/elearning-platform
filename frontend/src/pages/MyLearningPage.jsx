import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

function MyLearningPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [error, setError] = useState('');

  const fetchEnrollments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/enrollments/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEnrollments(response.data);
    } catch (err) {
      setError('Failed to load your courses');
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleCompleteLesson = async (enrollmentId, lessonId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/enrollments/complete-lesson`,
        { enrollmentId, lessonId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchEnrollments();
    } catch (err) {
      alert('Failed to mark lesson complete');
    }
  };

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>My Learning</h2>
      {enrollments.length === 0 && <p>You haven't enrolled in any courses yet.</p>}

      {enrollments.map((enrollment) => (
        <div key={enrollment._id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '8px' }}>
          <h3>{enrollment.course.title}</h3>
          <p>Progress: {enrollment.progress}% ({enrollment.status})</p>

          <h4>Lessons</h4>
          <ul>
            {enrollment.course.lessons.map((lesson) => {
              const isCompleted = enrollment.completedLessons.includes(lesson._id);
              return (
                <li key={lesson._id}>
                  {lesson.title}{' '}
                  {isCompleted ? (
                    <strong>✅ Completed</strong>
                  ) : (
                    <button onClick={() => handleCompleteLesson(enrollment._id, lesson._id)}>
                      Mark Complete
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default MyLearningPage;