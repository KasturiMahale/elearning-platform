import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CreateCoursePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [lessons, setLessons] = useState([{ title: '', content: '', duration: '' }]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLessonChange = (index, field, value) => {
    const updated = [...lessons];
    updated[index][field] = value;
    setLessons(updated);
  };

  const addLesson = () => {
    setLessons([...lessons, { title: '', content: '', duration: '' }]);
  };

  const removeLesson = (index) => {
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/courses',
        {
          title,
          description,
          category,
          price: Number(price),
          lessons: lessons.map((l) => ({ ...l, duration: Number(l.duration) })),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate(`/courses/${response.data.course._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Create a New Course</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label>Description:</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div>
          <label>Category:</label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <div>
          <label>Price (₹):</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>

        <h3>Lessons</h3>
        {lessons.map((lesson, index) => (
          <div key={index} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
            <div>
              <label>Lesson Title:</label>
              <input
                value={lesson.title}
                onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                required
              />
            </div>
            <div>
              <label>Content:</label>
              <input
                value={lesson.content}
                onChange={(e) => handleLessonChange(index, 'content', e.target.value)}
                required
              />
            </div>
            <div>
              <label>Duration (minutes):</label>
              <input
                type="number"
                value={lesson.duration}
                onChange={(e) => handleLessonChange(index, 'duration', e.target.value)}
              />
            </div>
            {lessons.length > 1 && (
              <button type="button" onClick={() => removeLesson(index)}>
                Remove Lesson
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addLesson}>
          + Add Another Lesson
        </button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div>
          <button type="submit">Create Course</button>
        </div>
      </form>
    </div>
  );
}

export default CreateCoursePage;