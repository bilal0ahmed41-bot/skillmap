
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  LayoutDashboard,
  BookOpen,
  ChartNoAxesColumnIncreasing,
  Trophy,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  LockKeyhole,
  PlayCircle,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  GraduationCap,
  Clock3,
  Flame,
  Sparkles,
  Mail,
  KeyRound,
  RefreshCw,
} from "lucide-react";
import { supabase } from "./supabase";
import YouTubeLesson from "./YouTubeLesson";
import "./styles.css";

const COURSES = [
  {
    id: "photoshop",
    title: "Adobe Photoshop",
    description: "Learn photo editing, selections, layers, and creative design.",
    playlistId: "PLW-zSkCnZ-gA5Jn6gZtUa6-aG0OoRZyb6",
    icon: "PS",
    color: "#4f8cff",
    lessonsLabel: "Photoshop",
  },
  {
    id: "illustrator",
    title: "Adobe Illustrator",
    description: "Learn vector graphics, shapes, typography, and illustration.",
    playlistId: "PLW-zSkCnZ-gCq0DjkzY-YapCBEk0lA6lR",
    icon: "Ai",
    color: "#ff9d45",
    lessonsLabel: "Illustrator",
  },
];

const QUIZZES = {
  photoshop: [
    {
      question: "What is the main purpose of layers in Photoshop?",
      options: [
        "To keep different design elements separate",
        "To increase internet speed",
        "To install new fonts automatically",
        "To export every file as a video",
      ],
      answer: 0,
    },
    {
      question: "Which tool is commonly used to select part of an image?",
      options: ["Hand Tool", "Marquee Tool", "Zoom Tool", "Notes Tool"],
      answer: 1,
    },
    {
      question: "Which file format preserves Photoshop layers?",
      options: ["JPG", "PNG", "PSD", "GIF"],
      answer: 2,
    },
  ],
  illustrator: [
    {
      question: "What is Adobe Illustrator mainly used for?",
      options: [
        "Editing spreadsheets",
        "Creating vector graphics",
        "Recording podcasts",
        "Managing databases",
      ],
      answer: 1,
    },
    {
      question: "What is a key advantage of vector graphics?",
      options: [
        "They cannot use colors",
        "They only work on phones",
        "They can scale without losing sharpness",
        "They always have a smaller file size",
      ],
      answer: 2,
    },
    {
      question: "Which tool is useful for drawing freeform vector paths?",
      options: ["Pen Tool", "Crop Tool", "Blur Tool", "Eraser in Photoshop"],
      answer: 0,
    },
  ],
};

const PAGE_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "skills", label: "My Skills", icon: BookOpen },
  { id: "progress", label: "Progress", icon: ChartNoAxesColumnIncreasing },
  { id: "achievements", label: "Achievements", icon: Trophy },
  { id: "settings", label: "Settings", icon: Settings },
];

function readTheme() {
  try {
    return localStorage.getItem("skillmap-theme") || "dark";
  } catch {
    return "dark";
  }
}

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  const [page, setPage] = useState("dashboard");
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [playlistVideos, setPlaylistVideos] = useState({});
  const [videoEnded, setVideoEnded] = useState(false);
  const [answers, setAnswers] = useState({});
  const [quizMessage, setQuizMessage] = useState("");
  const [quizPassed, setQuizPassed] = useState(false);

  const [completed, setCompleted] = useState({});
  const [progressLoading, setProgressLoading] = useState(false);
  const [activity, setActivity] = useState([]);
  const [dark, setDark] = useState(readTheme() !== "light");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileName, setProfileName] = useState("");

  const user = session?.user ?? null;
  const selectedCourse =
    COURSES.find((course) => course.id === selectedCourseId) ?? null;
  const videos = selectedCourse
    ? playlistVideos[selectedCourse.id] || []
    : [];
  const currentVideo = videos[lessonIndex] ?? null;
  const currentQuiz = selectedCourse
    ? QUIZZES[selectedCourse.id] || []
    : [];
  const quiz = currentQuiz.length
    ? currentQuiz[lessonIndex % currentQuiz.length]
    : null;

  const completedCount = Object.keys(completed).filter(
    (key) => completed[key] === true
  ).length;

  const totalLessons = Object.values(playlistVideos).reduce(
    (total, list) => total + list.length,
    0
  );

  const allKnownLessons = Object.entries(playlistVideos).reduce(
    (all, [courseId, list]) => {
      list.forEach((video, index) => {
        all.push({ key: `${courseId}:${index}`, courseId, video, index });
      });
      return all;
    },
    []
  );

  const overallPercent = totalLessons
    ? Math.min(100, Math.round((completedCount / totalLessons) * 100))
    : 0;

  const courseProgress = useMemo(
    () =>
      COURSES.map((course) => {
        const list = playlistVideos[course.id] || [];
        const done = list.filter(
          (_, index) => completed[`${course.id}:${index}`] === true
        ).length;
        return {
          ...course,
          lessonCount: list.length,
          completedCount: done,
          percent: list.length ? Math.round((done / list.length) * 100) : 0,
        };
      }),
    [playlistVideos, completed]
  );

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.body.dataset.theme = dark ? "dark" : "light";
    try {
      localStorage.setItem("skillmap-theme", dark ? "dark" : "light");
    } catch {
      // Theme still works for the current session if storage is unavailable.
    }
  }, [dark]);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setAuthMessage(error.message);
      setSession(data?.session ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setAuthMessage("");
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setCompleted({});
      setActivity([]);
      setProfileName("");
      return;
    }

    let active = true;
    setProgressLoading(true);

    async function loadProgress() {
      const { data, error } = await supabase
        .from("skillmap_progress")
        .select("completed")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.error("Could not load SkillMap progress:", error.message);
      } else {
        setCompleted(
          data?.completed && typeof data.completed === "object"
            ? data.completed
            : {}
        );
      }

      setProfileName(
        user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Learner"
      );
      setProgressLoading(false);
    }

    loadProgress();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const saveProgress = useCallback(
    async (nextCompleted, eventText) => {
      setCompleted(nextCompleted);

      if (eventText) {
        setActivity((previous) =>
          [
            {
              text: eventText,
              time: new Date().toLocaleString(),
              id: `${Date.now()}-${Math.random()}`,
            },
            ...previous,
          ].slice(0, 8)
        );
      }

      if (!user) return;

      const { error } = await supabase.from("skillmap_progress").upsert(
        {
          user_id: user.id,
          completed: nextCompleted,
        },
        { onConflict: "user_id" }
      );

      if (error) {
        console.error("Could not save SkillMap progress:", error.message);
        setQuizMessage(
          "Progress could not be saved. Check your Supabase table and permissions."
        );
      }
    },
    [user]
  );

  const handleAuth = async (event) => {
    event.preventDefault();
    setAuthBusy(true);
    setAuthMessage("");

    try {
      if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
          options: {
            data: { full_name: authName.trim() || authEmail.split("@")[0] },
          },
        });

        if (error) throw error;

        if (data.session) {
          setAuthMessage("Your account has been created.");
        } else {
          setAuthMessage(
            "Account created. Check your email to confirm your account, then log in."
          );
        }
      } else if (authMode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(
          authEmail.trim(),
          {
            redirectTo: window.location.origin,
          }
        );

        if (error) throw error;
        setAuthMessage("If the email is registered, a password-reset link will arrive shortly.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword,
        });

        if (error) throw error;
      }
    } catch (error) {
      setAuthMessage(error.message || "Something went wrong. Please try again.");
    } finally {
      setAuthBusy(false);
    }
  };


  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) setAuthMessage(error.message);
    setSelectedCourseId(null);
    setPage("dashboard");
  };

  const handlePlaylistLoaded = useCallback(
    (courseId, ids) => {
      setPlaylistVideos((previous) => {
        const oldIds = previous[courseId] || [];

        if (
          oldIds.length === ids.length &&
          oldIds.every((id, index) => id === ids[index])
        ) {
          return previous;
        }

        return { ...previous, [courseId]: ids };
      });
    },
    []
  );

  const handleSelectedPlaylistLoaded = useCallback(
    (ids) => {
      if (selectedCourseId) {
        handlePlaylistLoaded(selectedCourseId, ids);
      }
    },
    [selectedCourseId, handlePlaylistLoaded]
  );


  const openCourse = (courseId) => {
    setSelectedCourseId(courseId);
    setLessonIndex(0);
    setVideoEnded(false);
    setAnswers({});
    setQuizPassed(false);
    setQuizMessage("");
    setPage("skills");
    setMobileSidebarOpen(false);
  };

  const returnToCourseList = () => {
    setSelectedCourseId(null);
    setVideoEnded(false);
    setAnswers({});
    setQuizPassed(false);
    setQuizMessage("");
  };

  const isLessonUnlocked = (courseId, index) => {
    if (index === 0) return true;
    return completed[`${courseId}:${index - 1}`] === true;
  };

  const selectLesson = (index) => {
    if (!selectedCourse || !isLessonUnlocked(selectedCourse.id, index)) return;
    setLessonIndex(index);
    setVideoEnded(false);
    setAnswers({});
    setQuizPassed(false);
    setQuizMessage("");
  };

  const submitQuiz = async () => {
    if (!selectedCourse || !quiz) return;

    const isCorrect = Number(answers[lessonIndex]) === quiz.answer;
    if (!isCorrect) {
      setQuizPassed(false);
      setQuizMessage("Not quite. Review the lesson and try again.");
      return;
    }

    if (!videoEnded) {
      setQuizPassed(false);
      setQuizMessage("Finish watching this lesson before completing its quiz.");
      return;
    }

    const key = `${selectedCourse.id}:${lessonIndex}`;
    const nextCompleted = { ...completed, [key]: true };

    setQuizPassed(true);
    setQuizMessage("Correct! Lesson completed and your progress is being saved.");
    await saveProgress(
      nextCompleted,
      `Completed ${selectedCourse.title} — lesson ${lessonIndex + 1}`
    );
  };

  const goToNextLesson = () => {
    if (!selectedCourse || !videos.length) return;
    const nextIndex = lessonIndex + 1;
    if (nextIndex < videos.length && isLessonUnlocked(selectedCourse.id, nextIndex)) {
      selectLesson(nextIndex);
    }
  };

  const toggleTheme = () => setDark((value) => !value);

  if (authLoading) {
    return (
      <div className="sm-loading-screen">
        <div className="sm-brand-mark">S</div>
        <p>Loading SkillMap...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`sm-auth-shell ${dark ? "sm-dark" : "sm-light"}`}>
        <div className="sm-auth-brand">
          <div className="sm-brand-mark">S</div>
          <span>SkillMap</span>
        </div>

        <div className="sm-auth-layout">
          <section className="sm-auth-promo">
            <span className="sm-eyebrow">
              <Sparkles size={15} /> YOUR SKILLS, YOUR FUTURE
            </span>
            <h1>Turn your curiosity into <span>real skills.</span></h1>
            <p>
              Learn design step by step, track your progress, and build your
              creative confidence with SkillMap.
            </p>
            <div className="sm-promo-points">
              <div><CheckCircle2 size={18} /> Structured video lessons</div>
              <div><CheckCircle2 size={18} /> Quizzes and progress tracking</div>
              <div><CheckCircle2 size={18} /> Learn at your own pace</div>
            </div>
            <div className="sm-promo-orb sm-orb-one" />
            <div className="sm-promo-orb sm-orb-two" />
          </section>

          <section className="sm-auth-card">
            <div className="sm-auth-card-top">
              <div className="sm-auth-icon"><GraduationCap size={25} /></div>
              <button
                className="sm-icon-button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                type="button"
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>

            <h2>
              {authMode === "signup"
                ? "Create your account"
                : authMode === "reset"
                ? "Reset your password"
                : "Welcome back"}
            </h2>
            <p className="sm-muted">
              {authMode === "signup"
                ? "Start building your skills today."
                : authMode === "reset"
                ? "We’ll email you a password reset link."
                : "Sign in to continue your learning journey."}
            </p>

            <form className="sm-auth-form" onSubmit={handleAuth}>
              {authMode === "signup" && (
                <label>
                  Full name
                  <input
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </label>
              )}

              <label>
                Email address
                <div className="sm-input-wrap">
                  <Mail size={17} />
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </label>

              {authMode !== "reset" && (
                <label>
                  Password
                  <div className="sm-input-wrap">
                    <KeyRound size={17} />
                    <input
                      type="password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      minLength={6}
                      autoComplete={
                        authMode === "signup" ? "new-password" : "current-password"
                      }
                    />
                  </div>
                </label>
              )}

              {authMode === "login" && (
                <button
                  type="button"
                  className="sm-text-button sm-forgot"
                  onClick={() => {
                    setAuthMode("reset");
                    setAuthMessage("");
                  }}
                >
                  Forgot password?
                </button>
              )}

              {authMessage && (
                <div className="sm-auth-message" role="status">
                  {authMessage}
                </div>
              )}

              <button className="sm-primary-button sm-full-button" disabled={authBusy}>
                {authBusy
                  ? "Please wait..."
                  : authMode === "signup"
                  ? "Create account"
                  : authMode === "reset"
                  ? "Send reset link"
                  : "Sign in"}
                {!authBusy && <ChevronRight size={18} />}
              </button>
            </form>

            <div className="sm-auth-switch">
              {authMode === "reset" ? (
                <button
                  className="sm-text-button"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthMessage("");
                  }}
                >
                  Back to sign in
                </button>
              ) : (
                <>
                  <span>{authMode === "signup" ? "Already have an account?" : "New to SkillMap?"}</span>
                  <button
                    className="sm-text-button"
                    onClick={() => {
                      setAuthMode(authMode === "signup" ? "login" : "signup");
                      setAuthMessage("");
                    }}
                  >
                    {authMode === "signup" ? "Sign in" : "Create account"}
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    );
  }

  const navTo = (nextPage) => {
    setPage(nextPage);
    setSelectedCourseId(null);
    setMobileSidebarOpen(false);
  };

  return (
    <div className={`sm-app ${dark ? "sm-dark" : "sm-light"}`}>
      {mobileSidebarOpen && (
        <button
          className="sm-mobile-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <aside className={`sm-sidebar ${mobileSidebarOpen ? "sm-sidebar-open" : ""}`}>
        <div className="sm-sidebar-brand">
          <div className="sm-brand-mark">S</div>
          <div>
            <strong>SkillMap</strong>
            <span>LEARN. BUILD. GROW.</span>
          </div>
          <button
            className="sm-icon-button sm-mobile-close"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="sm-nav-label">WORKSPACE</div>
        <nav className="sm-nav">
          {PAGE_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`sm-nav-item ${page === id ? "active" : ""}`}
              onClick={() => navTo(id)}
            >
              <Icon size={19} />
              <span>{label}</span>
              {page === id && <span className="sm-nav-active-dot" />}
            </button>
          ))}
        </nav>

        <div className="sm-sidebar-section">
          <div className="sm-nav-label">YOUR COURSES</div>
          {COURSES.map((course) => (
            <button
              key={course.id}
              className={`sm-course-nav ${selectedCourseId === course.id ? "active" : ""}`}
              onClick={() => openCourse(course.id)}
            >
              <span className="sm-course-mini-icon" style={{ "--course-color": course.color }}>
                {course.icon}
              </span>
              <span>{course.lessonsLabel}</span>
              <ChevronRight size={15} />
            </button>
          ))}
        </div>

        <div className="sm-sidebar-spacer" />

        <div className="sm-sidebar-bottom">
          <div className="sm-sidebar-tip">
            <div className="sm-tip-icon"><Sparkles size={17} /></div>
            <strong>Keep growing</strong>
            <p>Small steps today lead to big skills tomorrow.</p>
          </div>
          <div className="sm-sidebar-user">
            <div className="sm-avatar">{(profileName || "L").charAt(0).toUpperCase()}</div>
            <div className="sm-user-copy">
              <strong>{profileName || "Learner"}</strong>
              <span>{user.email}</span>
            </div>
            <button
              className="sm-icon-button"
              onClick={handleSignOut}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <main className="sm-main">
        <header className="sm-topbar">
          <div className="sm-topbar-left">
            <button
              className="sm-icon-button sm-menu-button"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <div className="sm-breadcrumb">
              <span>Workspace</span>
              <ChevronRight size={14} />
              <strong>
                {selectedCourse
                  ? selectedCourse.title
                  : PAGE_ITEMS.find((item) => item.id === page)?.label || "Dashboard"}
              </strong>
            </div>
          </div>
          <div className="sm-topbar-actions">
            <span className="sm-status-pill"><span /> Learning active</span>
            <button
              className="sm-icon-button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="sm-top-avatar"
              onClick={() => navTo("settings")}
              title="Open settings"
            >
              {(profileName || "L").charAt(0).toUpperCase()}
            </button>
          </div>
        </header>

        <div className="sm-content">
          {selectedCourse ? (
            <CourseView
              course={selectedCourse}
              videos={videos}
              lessonIndex={lessonIndex}
              currentVideo={currentVideo}
              completed={completed}
              videoEnded={videoEnded}
setVideoEnded={setVideoEnded}
handlePlaylistLoaded={handleSelectedPlaylistLoaded}
              
              selectLesson={selectLesson}
              isLessonUnlocked={isLessonUnlocked}
              quiz={quiz}
              answers={answers}
              setAnswers={setAnswers}
              quizMessage={quizMessage}
              quizPassed={quizPassed}
              submitQuiz={submitQuiz}
              goToNextLesson={goToNextLesson}
              returnToCourseList={returnToCourseList}
              loading={progressLoading}
            />
          ) : page === "dashboard" ? (
            <Dashboard
              name={profileName}
              courses={courseProgress}
              completedCount={completedCount}
              totalLessons={totalLessons}
              overallPercent={overallPercent}
              activity={activity}
              openCourse={openCourse}
              setPage={navTo}
            />
          ) : page === "skills" ? (
            <SkillsPage courses={courseProgress} openCourse={openCourse} />
          ) : page === "progress" ? (
            <ProgressPage
              courses={courseProgress}
              completedCount={completedCount}
              totalLessons={totalLessons}
              overallPercent={overallPercent}
              loading={progressLoading}
            />
          ) : page === "achievements" ? (
            <AchievementsPage
              courses={courseProgress}
              completedCount={completedCount}
              totalLessons={totalLessons}
            />
          ) : (
            <SettingsPage
              name={profileName}
              setName={setProfileName}
              email={user.email}
              dark={dark}
              toggleTheme={toggleTheme}
              signOut={handleSignOut}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="sm-page-heading">
      <div>
        {eyebrow && <div className="sm-eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

function Dashboard({
  name,
  courses,
  completedCount,
  totalLessons,
  overallPercent,
  activity,
  openCourse,
  setPage,
}) {
  return (
    <>
      <section className="sm-welcome-banner">
        <div className="sm-welcome-copy">
          <span className="sm-eyebrow"><Sparkles size={15} /> YOUR LEARNING SPACE</span>
          <h1>Welcome back, {name || "Learner"} <span>✦</span></h1>
          <p>Every lesson is progress. Keep learning and build something great.</p>
          <button className="sm-primary-button" onClick={() => setPage("skills")}>
            Explore your courses <ChevronRight size={18} />
          </button>
        </div>
        <div className="sm-welcome-art">
          <div className="sm-art-ring sm-ring-one" />
          <div className="sm-art-ring sm-ring-two" />
          <div className="sm-art-center"><GraduationCap size={52} /></div>
          <span className="sm-art-spark sm-spark-one">✦</span>
          <span className="sm-art-spark sm-spark-two">✧</span>
        </div>
      </section>

      <div className="sm-section-heading">
        <div><h2>Your overview</h2><p>A quick look at your learning journey.</p></div>
      </div>

      <div className="sm-stats-grid">
        <StatCard icon={BookOpen} label="Lessons completed" value={completedCount} detail="Across your courses" />
        <StatCard icon={ChartNoAxesColumnIncreasing} label="Overall progress" value={`${overallPercent}%`} detail="Based on loaded lessons" />
        <StatCard icon={GraduationCap} label="Courses available" value={courses.length} detail="Design skills to explore" />
        <StatCard icon={Flame} label="Learning status" value="Active" detail="Your next step starts here" />
      </div>

      <div className="sm-section-heading sm-heading-row">
        <div><h2>Continue learning</h2><p>Pick up a course and keep moving forward.</p></div>
        <button className="sm-quiet-button" onClick={() => setPage("skills")}>View all <ChevronRight size={16} /></button>
      </div>

      <div className="sm-course-grid">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} openCourse={openCourse} />
        ))}
      </div>

      <div className="sm-bottom-grid">
        <section className="sm-panel">
          <div className="sm-panel-heading">
            <div><h3>Recent activity</h3><p>Your latest learning actions.</p></div>
            <Clock3 size={19} />
          </div>
          {activity.length ? (
            <div className="sm-activity-list">
              {activity.slice(0, 5).map((item) => (
                <div className="sm-activity-item" key={item.id}>
                  <span className="sm-activity-dot"><CheckCircle2 size={16} /></span>
                  <div><strong>{item.text}</strong><span>{item.time}</span></div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Clock3}
              title="Your journey starts here"
              text="Complete your first lesson and your recent activity will appear here."
            />
          )}
        </section>

        <section className="sm-panel sm-goal-panel">
          <div className="sm-panel-heading">
            <div><h3>Your learning goal</h3><p>One lesson at a time.</p></div>
            <Trophy size={19} />
          </div>
          <div className="sm-goal-number">{overallPercent}%</div>
          <div className="sm-progress-track"><span style={{ width: `${overallPercent}%` }} /></div>
          <p className="sm-muted">{completedCount} completed {completedCount === 1 ? "lesson" : "lessons"}{totalLessons ? ` out of ${totalLessons}` : ""}.</p>
          <button className="sm-secondary-button sm-full-button" onClick={() => setPage("progress")}>
            View progress <ChevronRight size={17} />
          </button>
        </section>
      </div>
    </>
  );
}

function StatCard({ icon: Icon, label, value, detail }) {
  return (
    <div className="sm-stat-card">
      <div className="sm-stat-top"><span>{label}</span><span className="sm-stat-icon"><Icon size={19} /></span></div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </div>
  );
}

function CourseCard({ course, openCourse }) {
  return (
    <article className="sm-course-card">
      <div className="sm-course-card-top">
        <div className="sm-course-app-icon" style={{ "--course-color": course.color }}>{course.icon}</div>
        <span className="sm-course-tag">{course.lessonCount ? `${course.lessonCount} lessons` : "Video course"}</span>
      </div>
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      <div className="sm-course-progress-meta">
        <span>{course.completedCount} completed</span>
        <strong>{course.percent}%</strong>
      </div>
      <div className="sm-progress-track"><span style={{ width: `${course.percent}%`, background: course.color }} /></div>
      <button className="sm-course-open-button" onClick={() => openCourse(course.id)}>
        {course.completedCount ? "Continue learning" : "Start learning"} <ChevronRight size={17} />
      </button>
    </article>
  );
}

function SkillsPage({ courses, openCourse }) {
  return (
    <>
      <PageHeading
        eyebrow="COURSE LIBRARY"
        title="My Skills"
        description="Choose a course, learn one lesson at a time, and test your understanding."
      />
      <div className="sm-course-grid sm-skills-grid">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} openCourse={openCourse} />
        ))}
      </div>
      <div className="sm-info-note">
        <LockKeyhole size={19} />
        <div><strong>Learn in order</strong><p>Lessons unlock one by one after you finish the video and pass the quiz.</p></div>
      </div>
    </>
  );
}

function CourseView({
  course,
  videos,
  lessonIndex,
  currentVideo,
  completed,
  videoEnded,
  setVideoEnded,
  handlePlaylistLoaded,
  selectLesson,
  isLessonUnlocked,
  quiz,
  answers,
  setAnswers,
  quizMessage,
  quizPassed,
  submitQuiz,
  goToNextLesson,
  returnToCourseList,
  loading,
}) {
  const [lessonListOpen, setLessonListOpen] = useState(true);
  const lessonKey = `${course.id}:${lessonIndex}`;
  const isCompleted = completed[lessonKey] === true;

  useEffect(() => {
    setVideoEnded(false);
  }, [course.id, lessonIndex, setVideoEnded]);

  return (
    <>
      <button className="sm-back-button" onClick={returnToCourseList}>
        <ArrowLeft size={17} /> All courses
      </button>

      <PageHeading
        eyebrow="COURSE WORKSPACE"
        title={course.title}
        description={course.description}
      />

      <div className="sm-lesson-layout">
        <div className="sm-lesson-main">
          <section className="sm-video-panel">
            <div className="sm-video-panel-heading">
              <div>
                <span className="sm-eyebrow">LESSON {videos.length ? lessonIndex + 1 : "—"}</span>
                <h2>{currentVideo ? `Lesson ${lessonIndex + 1}` : "Loading your lessons"}</h2>
              </div>
              {isCompleted && <span className="sm-complete-pill"><CheckCircle2 size={15} /> Completed</span>}
            </div>

           
<>
  <YouTubeLesson
    key={course.id}
    playlistId={course.playlistId}
    videoId={currentVideo}
    onPlaylistLoaded={handlePlaylistLoaded}
    onVideoEnded={() => setVideoEnded(true)}
  />

  {videos.length === 0 ? (
    <div className="sm-player-placeholder">
      <RefreshCw size={28} />
      <h3>Loading playlist</h3>
      <p>
        The course videos will appear here. If this takes too long,
        check that the playlist is public.
      </p>
    </div>
  ) : (
    <div className="sm-video-meta">
      <div>
        <PlayCircle size={17} />
        <span>{`Video ${lessonIndex + 1} of ${videos.length}`}</span>
      </div>

      {videoEnded ? (
        <span className="sm-success-text">
          <CheckCircle2 size={16} /> Video finished
        </span>
      ) : (
        <span className="sm-muted">
          Finish the video to unlock quiz completion
        </span>
      )}
    </div>
  )}
</>

          </section>

          <section className="sm-quiz-panel">
            <div className="sm-panel-heading">
              <div><span className="sm-eyebrow">KNOWLEDGE CHECK</span><h2>Lesson quiz</h2></div>
              <span className="sm-quiz-count">1 question</span>
            </div>
            {!videos.length ? (
              <p className="sm-muted">The quiz will be available when the playlist loads.</p>
            ) : (
              <>
                <h3>{quiz?.question || "Review this lesson and check your understanding."}</h3>
                <div className="sm-quiz-options">
                  {(quiz?.options || []).map((option, index) => (
                    <label
                      className={`sm-quiz-option ${Number(answers[lessonIndex]) === index ? "selected" : ""}`}
                      key={option}
                    >
                      <input
                        type="radio"
                        name={`quiz-${course.id}-${lessonIndex}`}
                        checked={Number(answers[lessonIndex]) === index}
                        onChange={() => {
                          setAnswers((previous) => ({ ...previous, [lessonIndex]: index }));
                        }}
                      />
                      <span className="sm-option-letter">{String.fromCharCode(65 + index)}</span>
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                {quizMessage && (
                  <div className={`sm-quiz-message ${quizPassed ? "success" : ""}`} role="status">
                    {quizMessage}
                  </div>
                )}
                <div className="sm-quiz-footer">
                  <p><LockKeyhole size={15} /> {videoEnded ? "Video finished — you can submit your answer." : "Finish the video before completing this lesson."}</p>
                  <button
                    className="sm-primary-button"
                    onClick={submitQuiz}
                    disabled={answers[lessonIndex] === undefined || !videoEnded || isCompleted}
                  >
                    {isCompleted ? "Lesson completed" : "Submit answer"} <ChevronRight size={17} />
                  </button>
                </div>
                {isCompleted && (
                  <div className="sm-next-lesson-row">
                    <div><CheckCircle2 size={20} /><span><strong>Great work!</strong><small>This lesson is complete.</small></span></div>
                    {lessonIndex + 1 < videos.length ? (
                      <button className="sm-secondary-button" onClick={goToNextLesson}>Next lesson <ChevronRight size={17} /></button>
                    ) : (
                      <span className="sm-success-text">Last lesson completed</span>
                    )}
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        <aside className="sm-lesson-list-panel">
          <button className="sm-lesson-list-heading" onClick={() => setLessonListOpen((value) => !value)}>
            <span><BookOpen size={19} /><strong>Course lessons</strong></span>
            <ChevronRight className={lessonListOpen ? "sm-chevron-open" : ""} size={17} />
          </button>
          <div className="sm-course-list-progress">
            <div><span>Course progress</span><strong>{course.percent ?? 0}%</strong></div>
            <div className="sm-progress-track"><span style={{ width: `${videos.length ? Math.round((videos.filter((_, index) => completed[`${course.id}:${index}`]).length / videos.length) * 100) : 0}%`, background: course.color }} /></div>
          </div>
          {lessonListOpen && (
            <div className="sm-lesson-items">
              {!videos.length ? (
                <p className="sm-muted sm-lesson-empty">Loading lessons from YouTube...</p>
              ) : (
                videos.map((videoId, index) => {
                  const done = completed[`${course.id}:${index}`] === true;
                  const unlocked = isLessonUnlocked(course.id, index);
                  const active = index === lessonIndex;
                  return (
                    <button
                      key={`${videoId}-${index}`}
                      className={`sm-lesson-item ${active ? "active" : ""} ${!unlocked ? "locked" : ""}`}
                      disabled={!unlocked}
                      onClick={() => selectLesson(index)}
                    >
                      <span className="sm-lesson-number">
                        {done ? <CheckCircle2 size={18} /> : unlocked ? <PlayCircle size={18} /> : <LockKeyhole size={16} />}
                      </span>
                      <span className="sm-lesson-item-copy">
                        <strong>Lesson {index + 1}</strong>
                        <small>{done ? "Completed" : unlocked ? "Available" : "Locked"}</small>
                      </span>
                      {active && <span className="sm-lesson-active-indicator" />}
                    </button>
                  );
                })
              )}
            </div>
          )}
          <div className="sm-lesson-list-foot">
            <LockKeyhole size={16} />
            <p>Pass each quiz after finishing its video to unlock the next lesson.</p>
          </div>
        </aside>
      </div>
      {loading && <p className="sm-muted sm-loading-note">Syncing saved progress...</p>}
    </>
  );
}

function ProgressPage({ courses, completedCount, totalLessons, overallPercent, loading }) {
  return (
    <>
      <PageHeading
        eyebrow="YOUR JOURNEY"
        title="Progress"
        description="See what you have completed and what you can learn next."
      />
      <section className="sm-progress-hero">
        <div>
          <span className="sm-eyebrow">OVERALL COMPLETION</span>
          <div className="sm-progress-big">{overallPercent}<span>%</span></div>
          <p>{completedCount} completed lessons{totalLessons ? ` out of ${totalLessons}` : ""}</p>
        </div>
        <div className="sm-progress-circle" style={{ "--progress": `${overallPercent * 3.6}deg` }}>
          <div><strong>{overallPercent}%</strong><span>complete</span></div>
        </div>
      </section>
      <div className="sm-section-heading"><div><h2>Course breakdown</h2><p>Progress for each course.</p></div></div>
      <div className="sm-progress-course-list">
        {courses.map((course) => (
          <div className="sm-progress-course" key={course.id}>
            <div className="sm-course-app-icon" style={{ "--course-color": course.color }}>{course.icon}</div>
            <div className="sm-progress-course-info">
              <div><strong>{course.title}</strong><span>{course.completedCount} / {course.lessonCount || "—"} lessons</span></div>
              <div className="sm-progress-track"><span style={{ width: `${course.percent}%`, background: course.color }} /></div>
            </div>
            <strong className="sm-progress-course-percent">{course.percent}%</strong>
          </div>
        ))}
      </div>
      {loading && <p className="sm-muted">Loading saved progress...</p>}
      {!totalLessons && <div className="sm-info-note"><PlayCircle size={19} /><div><strong>Load your first playlist</strong><p>Open a course so SkillMap can count its available lessons.</p></div></div>}
    </>
  );
}

function AchievementsPage({ courses, completedCount, totalLessons }) {
  const finishedCourses = courses.filter((course) => course.lessonCount > 0 && course.completedCount === course.lessonCount).length;
  const achievements = [
    { title: "First Step", text: "Complete your first lesson.", icon: PlayCircle, unlocked: completedCount >= 1 },
    { title: "Getting Consistent", text: "Complete five lessons.", icon: Flame, unlocked: completedCount >= 5 },
    { title: "Knowledge Builder", text: "Complete ten lessons.", icon: BookOpen, unlocked: completedCount >= 10 },
    { title: "Course Finisher", text: "Finish every lesson in a course.", icon: Trophy, unlocked: finishedCourses >= 1 },
    { title: "Creative Explorer", text: "Load both course playlists.", icon: Sparkles, unlocked: courses.every((course) => course.lessonCount > 0) },
    { title: "SkillMap Champion", text: "Complete every loaded lesson.", icon: GraduationCap, unlocked: totalLessons > 0 && completedCount >= totalLessons },
  ];

  return (
    <>
      <PageHeading
        eyebrow="MILESTONES"
        title="Achievements"
        description="Every completed lesson is a step forward. Keep collecting milestones."
      />
      <div className="sm-achievement-summary">
        <div className="sm-achievement-trophy"><Trophy size={27} /></div>
        <div><strong>{achievements.filter((item) => item.unlocked).length} of {achievements.length} achievements</strong><p>Keep learning to unlock more milestones.</p></div>
      </div>
      <div className="sm-achievements-grid">
        {achievements.map(({ title, text, icon: Icon, unlocked }) => (
          <article className={`sm-achievement-card ${unlocked ? "unlocked" : "locked"}`} key={title}>
            <div className="sm-achievement-icon"><Icon size={24} /></div>
            <div className="sm-achievement-status">{unlocked ? <CheckCircle2 size={15} /> : <LockKeyhole size={15} />}{unlocked ? "Unlocked" : "Locked"}</div>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </>
  );
}

function SettingsPage({ name, setName, email, dark, toggleTheme, signOut }) {
  const [saved, setSaved] = useState(false);

  const saveProfile = async () => {
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name.trim() || "Learner" },
    });
    if (error) {
      setSaved(false);
      alert(error.message);
      return;
    }
    setSaved(true);
  };

  return (
    <>
      <PageHeading
        eyebrow="PERSONALIZE"
        title="Settings"
        description="Manage your profile and make SkillMap feel right for you."
      />
      <section className="sm-settings-card">
        <div className="sm-settings-heading"><div><h2>Profile</h2><p>How your name appears in SkillMap.</p></div><div className="sm-settings-icon"><Settings size={21} /></div></div>
        <label className="sm-settings-label">Display name
          <input className="sm-settings-input" value={name} onChange={(e) => { setName(e.target.value); setSaved(false); }} placeholder="Your name" />
        </label>
        <label className="sm-settings-label">Email address
          <input className="sm-settings-input" value={email || ""} disabled readOnly />
        </label>
        <button className="sm-primary-button" onClick={saveProfile}>Save profile <CheckCircle2 size={17} /></button>
        {saved && <p className="sm-success-text sm-settings-saved">Profile updated.</p>}
      </section>

      <section className="sm-settings-card">
        <div className="sm-settings-heading"><div><h2>Appearance</h2><p>Choose the look that suits you.</p></div><div className="sm-settings-icon">{dark ? <Moon size={21} /> : <Sun size={21} />}</div></div>
        <div className="sm-setting-row">
          <div><strong>{dark ? "Dark theme" : "Light theme"}</strong><p>Switch between dark and light appearance.</p></div>
          <button className="sm-secondary-button" onClick={toggleTheme}>{dark ? <Sun size={17} /> : <Moon size={17} />}{dark ? "Use light" : "Use dark"}</button>
        </div>
      </section>

      <section className="sm-settings-card sm-danger-card">
        <div className="sm-settings-heading"><div><h2>Account</h2><p>End your current SkillMap session on this device.</p></div><div className="sm-settings-icon"><LogOut size={21} /></div></div>
        <button className="sm-danger-button" onClick={signOut}><LogOut size={17} /> Sign out</button>
      </section>
    </>
  );
}

function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="sm-empty-state">
      <div><Icon size={22} /></div>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />); 
