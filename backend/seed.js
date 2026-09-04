const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const Event = require('./models/Event');

const NUM_INSTRUCTORS = 5;
const NUM_STUDENTS = 100;
const NUM_COURSES = 15;

// Helper: random date within the last N days
function randomPastDate(daysAgo) {
  const now = new Date();
  const past = new Date(now.getTime() - Math.random() * daysAgo * 24 * 60 * 60 * 1000);
  return past;
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB. Clearing old data...');

    await User.deleteMany({});
    await Course.deleteMany({});
    await Enrollment.deleteMany({});
    await Event.deleteMany({});

    console.log('Old data cleared. Generating new data...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create instructors
    const instructors = [];
    for (let i = 0; i < NUM_INSTRUCTORS; i++) {
      const instructor = await User.create({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: hashedPassword,
        role: 'instructor',
        createdAt: randomPastDate(90),
      });
      instructors.push(instructor);
    }
    console.log(`Created ${instructors.length} instructors`);

    // 2. Create students
    const students = [];
    for (let i = 0; i < NUM_STUDENTS; i++) {
      const signupDate = randomPastDate(90);
      const student = await User.create({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: hashedPassword,
        role: 'student',
        createdAt: signupDate,
      });
      students.push(student);

      // Log their signup event
      await Event.create({
        user: student._id,
        eventType: 'signup',
        createdAt: signupDate,
      });
    }
    console.log(`Created ${students.length} students`);

    // 3. Create courses
    const categories = ['Programming', 'Design', 'Business', 'Marketing', 'Data Science'];
    const courses = [];
    for (let i = 0; i < NUM_COURSES; i++) {
      const numLessons = faker.number.int({ min: 3, max: 8 });
      const lessons = [];
      for (let j = 0; j < numLessons; j++) {
        lessons.push({
          title: `Lesson ${j + 1}: ${faker.lorem.words(3)}`,
          content: faker.lorem.sentence(),
          duration: faker.number.int({ min: 5, max: 30 }),
        });
      }

      const course = await Course.create({
        title: faker.lorem.words({ min: 3, max: 6 }),
        description: faker.lorem.paragraph(),
        instructor: instructors[Math.floor(Math.random() * instructors.length)]._id,
        category: categories[Math.floor(Math.random() * categories.length)],
        price: faker.number.int({ min: 0, max: 999 }),
        lessons,
        createdAt: randomPastDate(90),
      });
      courses.push(course);
    }
    console.log(`Created ${courses.length} courses`);

    // 4. Create enrollments with REALISTIC drop-off pattern
    // Not every student enrolls, and not every enrolled student finishes
    let totalEnrollments = 0;
    let totalEvents = 0;

    for (const student of students) {
      // Each student enrolls in 0-4 random courses
      const numEnrollments = faker.number.int({ min: 0, max: 4 });
      const shuffledCourses = [...courses].sort(() => 0.5 - Math.random());
      const chosenCourses = shuffledCourses.slice(0, numEnrollments);

      for (const course of chosenCourses) {
        const enrollDate = randomPastDate(60);

        // Simulate drop-off: decide how far this student gets
        // 20% never start, 30% drop off partway, 25% finish half, 25% complete
        const rand = Math.random();
        let completionRatio;
        if (rand < 0.2) completionRatio = 0; // enrolled but never started
        else if (rand < 0.5) completionRatio = faker.number.float({ min: 0.1, max: 0.4 }); // dropped off early
        else if (rand < 0.75) completionRatio = faker.number.float({ min: 0.4, max: 0.9 }); // dropped off late
        else completionRatio = 1; // completed

        const numCompleted = Math.floor(course.lessons.length * completionRatio);
        const completedLessons = course.lessons.slice(0, numCompleted).map((l) => l._id);
        const progress = Math.round((numCompleted / course.lessons.length) * 100);
        const status = progress >= 100 ? 'completed' : 'in-progress';

        const enrollment = await Enrollment.create({
          student: student._id,
          course: course._id,
          completedLessons,
          progress,
          status,
          createdAt: enrollDate,
        });
        totalEnrollments++;

        // Log enroll event
        await Event.create({
          user: student._id,
          eventType: 'enroll',
          metadata: { courseId: course._id },
          createdAt: enrollDate,
        });
        totalEvents++;

        // Log course_view before enroll (realistic: they viewed before enrolling)
        await Event.create({
          user: student._id,
          eventType: 'course_view',
          metadata: { courseId: course._id },
          createdAt: new Date(enrollDate.getTime() - 1000 * 60 * 5), // 5 min before
        });
        totalEvents++;

        // Log lesson_complete events for each completed lesson, spaced out over time
        for (let i = 0; i < numCompleted; i++) {
          const lessonDate = new Date(enrollDate.getTime() + i * 1000 * 60 * 60 * 24 * faker.number.int({ min: 1, max: 5 }));
          await Event.create({
            user: student._id,
            eventType: 'lesson_complete',
            metadata: { courseId: course._id, lessonId: course.lessons[i]._id },
            createdAt: lessonDate,
          });
          totalEvents++;
        }

        // Log course_complete if finished
        if (status === 'completed') {
          await Event.create({
            user: student._id,
            eventType: 'course_complete',
            metadata: { courseId: course._id },
            createdAt: new Date(enrollDate.getTime() + numCompleted * 1000 * 60 * 60 * 24 * 3),
          });
          totalEvents++;
        }
      }
    }

    console.log(`Created ${totalEnrollments} enrollments`);
    console.log(`Created ${totalEvents} additional events`);
    console.log('Seeding complete!');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();