
import React, { useEffect, useState } from "react";
import "./styles.css";

import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Target,
  RotateCcw,
  Palette,
  Globe,
  Monitor,
  FileSpreadsheet,
  Video,
  ShieldCheck,
  Briefcase,
  Code2,
} from "lucide-react";

import { supabase } from "./supabase";




const COURSES = [
  {
    id: "photoshop",
    title: "Photoshop",
    category: "GRAPHIC DESIGN",
    level: "Beginner",
    icon: Palette,
    description: "Learn Photoshop step by step with GFXMentor.",
    playlistId: "PLW-zSkCnZ-gA5Jn6gZtUa6-aG0OoRZyb6",
    lessons: [
      {
        title: "GFXMentor Photoshop Playlist",
        duration: "Full playlist",
        points: [
          "Watch the lessons in their original playlist order.",
          "Finish watching the course video before continuing.",
          "Complete the knowledge check to unlock the next step."
        ],
        example: "Practice along with the instructor in Photoshop.",
        questions: [
          {
            q: "What is the best way to learn a design tool?",
            options: [
              "Watch and practise the steps",
              "Skip every lesson",
              "Only memorize tool names",
              "Never practise"
            ],
            answer: 0,
            explanation: "Watching and practising helps you understand the tools."
          },
          {
            q: "What should you do after a lesson?",
            options: [
              "Ignore what you learned",
              "Practise the demonstrated technique",
              "Skip all practice",
              "Close the course permanently"
            ],
            answer: 1,
            explanation: "Practice helps reinforce the lesson."
          }
        ]
      }
    ],
    project: {
      title: "Photoshop Practice",
      description: "Create a simple design using the tools taught in the course.",
      tasks: [
        "Follow a lesson from the playlist.",
        "Practise the demonstrated technique.",
        "Save your practice file.",
        "Export your finished design as an image."
      ],
      deliverable: "A finished Photoshop design.",
      resource: "https://www.youtube.com/playlist?list=PLW-zSkCnZ-gA5Jn6gZtUa6-aG0OoRZyb6"
    }
  },
  {
    id: "illustrator",
    title: "Adobe Illustrator",
    category: "GRAPHIC DESIGN",
    level: "Beginner",
    icon: Palette,
    description: "Learn vector design with GFXMentor.",
    playlistId: "PLW-zSkCnZ-gCq0DjkzY-YapCBEk0lA6lR",
    lessons: [
      {
        title: "GFXMentor Illustrator Playlist",
        duration: "Full playlist",
        points: [
          "Follow the videos in their original playlist order.",
          "Practise the tools shown by the instructor.",
          "Complete the knowledge check after studying."
        ],
        example: "Practise creating vector shapes, artwork, and typography.",
        questions: [
          {
            q: "What is vector artwork useful for?",
            options: [
              "Artwork that can scale without typical pixelation",
              "Only playing audio",
              "Writing spreadsheet formulas",
              "Browsing the internet"
            ],
            answer: 0,
            explanation: "Vector artwork can scale while retaining its crisp edges."
          },
          {
            q: "What is a good way to improve in Illustrator?",
            options: [
              "Practise creating vector artwork",
              "Never open the tools",
              "Skip all demonstrations",
              "Only read the course title"
            ],
            answer: 0,
            explanation: "Hands-on practice helps you learn Illustrator."
          }
        ]
      }
    ],
    project: {
      title: "Vector Design Practice",
      description: "Create a simple vector design using the course techniques.",
      tasks: [
        "Follow a lesson from the playlist.",
        "Practise creating and editing vector shapes.",
        "Create a simple design.",
        "Export your finished design."
      ],
      deliverable: "A finished vector design.",
      resource: "https://www.youtube.com/playlist?list=PLW-zSkCnZ-gCq0DjkzY-YapCBEk0lA6lR"
    }
  }
];

function getLessonKey(courseId, lessonIndex) {
  return `${courseId}:${lessonIndex}`;
}

export default function LearningLab({ user, onBack }) {
  const [courseIndex, setCourseIndex] = useState(0);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [completed, setCompleted] = useState({});
  const [quizAnswers, setQuizAnswers] = useState({});
  const [checkedQuizzes, setCheckedQuizzes] = useState({});
  const [projectChecks, setProjectChecks] = useState({});
  const [saveStatus, setSaveStatus] = useState("Loading progress...");
  const [error, setError] = useState("");

  const course = COURSES[courseIndex];
  const lesson = course.lessons[lessonIndex];
  const lessonKey = getLessonKey(course.id, lessonIndex);
  const isCompleted = Boolean(completed[lessonKey]);
  const Icon = course.icon;

  useEffect(() => {
    let active = true;

    async function loadProgress() {
      if (!user?.id) {
        setSaveStatus("Sign in to save progress");
        return;
      }

      const { data, error: loadError } = await supabase
        .from("skillmap_progress")
        .select("completed")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!active) return;

      if (loadError) {
        setError(loadError.message);
        setSaveStatus("Could not load progress");
        return;
      }

      setCompleted(data?.completed || {});
      setSaveStatus("Progress loaded");
    }

    loadProgress();

    return () => {
      active = false;
    };
  }, [user?.id]);

  async function saveCompletion(nextProgress) {
    if (!user?.id) {
      setError("Please sign in to save lesson progress.");
      return false;
    }

    setSaveStatus("Saving...");
    setError("");

    const { data: existing, error: readError } = await supabase
      .from("skillmap_progress")
      .select("started")
      .eq("user_id", user.id)
      .maybeSingle();

    if (readError) {
      setError(readError.message);
      setSaveStatus("Save failed");
      return false;
    }

    const { error: saveError } = await supabase
      .from("skillmap_progress")
      .upsert(
        {
          user_id: user.id,
          completed: nextProgress,
          started: existing?.started || ["office", "web", "graphic"],
          updated_at: new Date().toISOString()
        },
        { onConflict: "user_id" }
      );

    if (saveError) {
      setError(saveError.message);
      setSaveStatus("Save failed");
      return false;
    }

    setSaveStatus("All progress saved");
    return true;
  }

  async function completeLesson() {
    if (isCompleted) return;

    const nextProgress = { ...completed, [lessonKey]: true };
    const saved = await saveCompletion(nextProgress);

    if (saved) setCompleted(nextProgress);
  }

  function changeCourse(index) {
    setCourseIndex(index);
    setLessonIndex(0);
  }

  function changeLesson(index) {
    setLessonIndex(index);
  }

  function selectAnswer(questionIndex, answerIndex) {
    const key = `${lessonKey}:${questionIndex}`;

    if (checkedQuizzes[key]) return;

    setQuizAnswers(previous => ({
      ...previous,
      [key]: answerIndex
    }));
  }

  function checkAnswer(questionIndex) {
    const key = `${lessonKey}:${questionIndex}`;

    if (quizAnswers[key] === undefined) return;

    setCheckedQuizzes(previous => ({
      ...previous,
      [key]: true
    }));
  }

  function retryQuestion(questionIndex) {
    const key = `${lessonKey}:${questionIndex}`;

    setQuizAnswers(previous => {
      const next = { ...previous };
      delete next[key];
      return next;
    });

    setCheckedQuizzes(previous => {
      const next = { ...previous };
      delete next[key];
      return next;
    });
  }

  const totalLessons = COURSES.reduce(
    (sum, item) => sum + item.lessons.length,
    0
  );

  const completedCount = COURSES.reduce(
    (sum, item) =>
      sum + item.lessons.filter((_, index) =>
        completed[getLessonKey(item.id, index)]
      ).length,
    0
  );

  const projectKey = `${course.id}:project`;
  const projectTaskCount = course.project.tasks.length;
  const projectDoneCount = course.project.tasks.filter(
    (_, index) => projectChecks[`${projectKey}:${index}`]
  ).length;

  const lessonQuizScore = lesson.questions.filter(
    (question, index) =>
      checkedQuizzes[`${lessonKey}:${index}`] &&
      quizAnswers[`${lessonKey}:${index}`] === question.answer
  ).length;

  const lessonQuizChecked = lesson.questions.filter(
    (_, index) => checkedQuizzes[`${lessonKey}:${index}`]
  ).length;

  return (
    <main className="lab-shell">
      <header className="lab-topbar">
        <button className="lab-secondary" onClick={onBack}>
          <ChevronLeft size={17} /> Back to SkillMap
        </button>
        <span className="lab-save">{saveStatus}</span>
      </header>

      {error && (
        <div className="lab-error">
          <strong>Notice:</strong> {error}
          <button className="lab-secondary" onClick={() => setError("")}>
            Dismiss
          </button>
        </div>
      )}

      <section className="lab-heading">
        <div>
          <span className="lab-eyebrow">SKILLMAP LEARNING LAB</span>
          <h1>Learn skills. Build things.</h1>
          <p>Computer skills, knowledge checks, and practical projects.</p>
        </div>
        <div className="lab-total">
          <Trophy size={22} />
          <strong>{completedCount}/{totalLessons}</strong>
          <span>Lessons completed</span>
        </div>
      </section>

      <section className="lab-course-grid">
        {COURSES.map((item, index) => {
          const CourseIcon = item.icon;
          const done = item.lessons.filter((_, lessonNo) =>
            completed[getLessonKey(item.id, lessonNo)]
          ).length;

          return (
            <button
              key={item.id}
              className={`lab-course-card ${courseIndex === index ? "active" : ""}`}
              onClick={() => changeCourse(index)}
            >
              <CourseIcon className="lab-course-icon" size={25} />
              <span className="lab-course-level">
                {item.category} · {item.level}
              </span>
              <strong>{item.title}</strong>
              <span className="lab-course-description">{item.description}</span>
              <span className="lab-course-progress">
                {done}/{item.lessons.length} lessons complete
              </span>
              <span className="lab-mini-track">
                <i style={{ width: `${(done / item.lessons.length) * 100}%` }} />
              </span>
            </button>
          );
        })}
      </section>

      <div className="lab-workspace">
        <aside className="lab-sidebar">
          <span className="lab-eyebrow">YOUR COURSE</span>
          <h3>{course.title}</h3>

          {course.lessons.map((item, index) => {
            const done = Boolean(completed[getLessonKey(course.id, index)]);

            return (
              <button
                key={item.title}
                className={`lab-lesson-nav ${lessonIndex === index ? "active" : ""}`}
                onClick={() => changeLesson(index)}
              >
                <span className="lab-lesson-number">
                  {done ? <CheckCircle2 size={17} /> : index + 1}
                </span>
                <span>
                  {item.title}
                  <small>{item.duration}</small>
                </span>
              </button>
            );
          })}

          <button
            className="lab-project-nav"
            onClick={() =>
              document.getElementById("lab-project")?.scrollIntoView({
                behavior: "smooth",
                block: "start"
              })
            }
          >
            <Target size={17} /> Practical project
          </button>
        </aside>

        <section className="lab-main">
          <article className="lab-lesson-content">
            <div className="lab-lesson-meta">
              <span><Icon size={16} /> {course.category}</span>
              <span><BookOpen size={16} /> {lesson.duration}</span>
              <span>{isCompleted ? "Completed" : "In progress"}</span>
            </div>

            <h2>{lesson.title}</h2>

            <div className="lab-learning-points">
              {lesson.points.map((point, index) => (
                <div className="lab-point" key={point}>
                  <span>{index + 1}</span>
                  <p>{point}</p>
                </div>
              ))}
            </div>

            <h3>Example</h3>
            <pre className="lab-code"><code>{lesson.example}</code></pre>

            <section className="lab-quiz">
              <span className="lab-quiz-label">KNOWLEDGE CHECK</span>
              <h3>Test what you've learned</h3>
              <p>
                Answer each question to check your understanding. Your score
                updates as you submit your answers.
              </p>

              {lesson.questions.map((question, questionIndex) => {
                const key = `${lessonKey}:${questionIndex}`;
                const selected = quizAnswers[key];
                const checked = Boolean(checkedQuizzes[key]);

                return (
                  <div className="lab-question" key={question.q}>
                    <h4>{questionIndex + 1}. {question.q}</h4>

                    <div className="lab-options">
                      {question.options.map((option, optionIndex) => {
                        let className = "lab-option";

                        if (selected === optionIndex) className += " selected";
                        if (checked && optionIndex === question.answer) {
                          className += " correct";
                        }
                        if (
                          checked &&
                          selected === optionIndex &&
                          selected !== question.answer
                        ) {
                          className += " incorrect";
                        }

                        return (
                          <button
                            key={option}
                            className={className}
                            disabled={checked}
                            onClick={() => selectAnswer(questionIndex, optionIndex)}
                          >
                            <span>{String.fromCharCode(65 + optionIndex)}</span>
                            {option}
                          </button>
                        );
                      })}
                    </div>

                    {checked && (
                      <div className={`lab-explanation ${
                        selected === question.answer ? "correct-text" : ""
                      }`}>
                        <strong>
                          {selected === question.answer ? "Correct!" : "Not quite."}
                        </strong>{" "}
                        {question.explanation}
                      </div>
                    )}

                    <div className="lab-quiz-actions">
                      {checked ? (
                        <button
                          className="lab-secondary"
                          onClick={() => retryQuestion(questionIndex)}
                        >
                          <RotateCcw size={15} /> Retry question
                        </button>
                      ) : (
                        <button
                          className="lab-primary"
                          disabled={selected === undefined}
                          onClick={() => checkAnswer(questionIndex)}
                        >
                          Check answer
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="lab-deliverable">
                <strong>Quiz score</strong>
                <p>
                  {lessonQuizScore} correct out of {lesson.questions.length}
                  {" · "}
                  {lessonQuizChecked === lesson.questions.length
                    ? "Quiz attempted"
                    : `${lessonQuizChecked} of ${lesson.questions.length} answered`}
                </p>
              </div>
            </section>

            <div className="lab-lesson-footer">
              <button
                className="lab-secondary"
                onClick={() => changeLesson(Math.max(0, lessonIndex - 1))}
                disabled={lessonIndex === 0}
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <button
                className="lab-primary"
                onClick={completeLesson}
                disabled={isCompleted}
              >
                <CheckCircle2 size={16} />
                {isCompleted ? "Lesson completed" : "Mark as complete"}
              </button>

              <button
                className="lab-secondary"
                onClick={() =>
                  changeLesson(Math.min(course.lessons.length - 1, lessonIndex + 1))
                }
                disabled={lessonIndex === course.lessons.length - 1}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </article>

          <section className="lab-project" id="lab-project">
            <span className="lab-eyebrow">PRACTICAL PROJECT</span>
            <h2>{course.project.title}</h2>
            <p>{course.project.description}</p>

            <div className="lab-deliverable">
              <strong>Project goal</strong>
              <p>{course.project.deliverable}</p>
            </div>

            <p>
              Checklist: {projectDoneCount} of {projectTaskCount} tasks completed
            </p>

            {course.project.tasks.map((task, index) => {
              const key = `${projectKey}:${index}`;

              return (
                <label className="lab-project-task" key={task}>
                  <input
                    type="checkbox"
                    checked={Boolean(projectChecks[key])}
                    onChange={event =>
                      setProjectChecks(previous => ({
                        ...previous,
                        [key]: event.target.checked
                      }))
                    }
                  />
                  <span>{task}</span>
                </label>
              );
            })}

            <div className="lab-quiz-actions">
              <button
                className="lab-secondary"
                onClick={() => {
                  setProjectChecks(previous => {
                    const next = { ...previous };
                    course.project.tasks.forEach((_, index) => {
                      delete next[`${projectKey}:${index}`];
                    });
                    return next;
                  });
                }}
              >
                <RotateCcw size={15} /> Reset checklist
              </button>

              <a
                className="lab-primary"
                href={course.project.resource}
                target="_blank"
                rel="noreferrer"
              >
                Open learning resource <ChevronRight size={16} />
              </a>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}