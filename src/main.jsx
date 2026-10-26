
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
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from "./supabase";
import "./styles.css";

const PHOTOSHOP_VIDEOS = Object.entries(
  import.meta.glob("../videos/*.mp4", {
    eager: true,
    query: "?url",
    import: "default",
  })
)
  .sort(([firstPath], [secondPath]) =>
    firstPath.localeCompare(secondPath, undefined, { numeric: true })
  )
  .map(([, videoUrl]) => videoUrl);

const COURSES = [
  {
    id: "photoshop",
    title: "Adobe Photoshop",
    description: "Learn photo editing, selections, layers, and creative design.",
    videos: PHOTOSHOP_VIDEOS,
    icon: "PS",
    color: "#4f8cff",
    lessonsLabel: "Photoshop",
  },
  {
    id: "illustrator",
    title: "Adobe Illustrator",
    description: "Learn vector graphics, shapes, typography, and illustration.",
    videos: [],
    icon: "Ai",
    color: "#ff9d45",
    lessonsLabel: "Illustrator",
  },
];

function rotateCorrectAnswers(lessonQuizzes) {
  let answerPosition = 0;

  return lessonQuizzes.map((questions) =>
    questions.map((question) => {
      const answer = answerPosition++ % question.options.length;
      const options = question.options.filter(
        (_, index) => index !== question.answer
      );
      options.splice(answer, 0, question.options[question.answer]);
      return { ...question, options, answer };
    })
  );
}

const QUIZZES = {
  photoshop: rotateCorrectAnswers([
    [
      { question: "Where are Photoshop's main editing tools usually found?", options: ["In the toolbar", "In the status bar", "In the title bar", "In the file browser"], answer: 0 },
      { question: "What does the Layers panel help you manage?", options: ["Separate image elements", "Internet connections", "Printer settings", "Keyboard language"], answer: 0 },
      { question: "What is a good first step before editing an image?", options: ["Open the image and inspect its document", "Flatten every layer", "Delete the background", "Export it as a GIF"], answer: 0 },
      { question: "Which tool is used to change the visible scale of the canvas?", options: ["Zoom Tool", "Brush Tool", "Crop Tool", "Type Tool"], answer: 0 },
      { question: "Which format is best for keeping an editable Photoshop project?", options: ["PSD", "JPG", "BMP", "TXT"], answer: 0 },
    ],
    [
      { question: "Which tool makes a rectangular or elliptical selection?", options: ["Marquee Tool", "Hand Tool", "Blur Tool", "Type Tool"], answer: 0 },
      { question: "What does the Lasso Tool let you do?", options: ["Draw a freeform selection", "Adjust image brightness", "Add editable text", "Rotate the canvas view"], answer: 0 },
      { question: "How can you remove an active selection outline?", options: ["Choose Deselect", "Flatten the image", "Save as JPG", "Hide the toolbar"], answer: 0 },
      { question: "What does Select and Mask help refine?", options: ["Selection edges", "Audio levels", "Layer names", "Export resolution"], answer: 0 },
      { question: "Why use a selection before applying an edit?", options: ["To limit the edit to a chosen area", "To permanently lock the document", "To convert pixels into vectors", "To remove all layer visibility"], answer: 0 },
    ],
    [
      { question: "What happens when you hide a layer using its eye icon?", options: ["The layer is temporarily not visible", "The layer is permanently deleted", "The image is exported", "The canvas is resized"], answer: 0 },
      { question: "How does layer order affect a composite?", options: ["Layers higher in the stack can cover lower ones", "It changes the file format", "It changes the monitor brightness", "It removes transparency"], answer: 0 },
      { question: "What is a useful reason to rename a layer?", options: ["To identify its contents quickly", "To increase its resolution", "To merge it automatically", "To change the canvas size"], answer: 0 },
      { question: "What does layer opacity control?", options: ["How transparent the layer appears", "How large the document is", "How many pixels are selected", "How fast the file exports"], answer: 0 },
      { question: "Why keep image elements on separate layers?", options: ["You can edit them independently", "They become vector paths", "They cannot be moved", "They are automatically backed up online"], answer: 0 },
    ],
    [
      { question: "On a layer mask, what does black generally do?", options: ["Hides that part of the layer", "Deletes the whole document", "Adds a color fill", "Locks the layer"], answer: 0 },
      { question: "On a layer mask, what does white generally do?", options: ["Reveals that part of the layer", "Exports the image", "Blurs the canvas", "Hides the toolbar"], answer: 0 },
      { question: "Why use a mask instead of erasing pixels?", options: ["A mask lets you revise what is hidden", "A mask permanently removes the layer", "A mask changes pixels into text", "A mask prevents saving"], answer: 0 },
      { question: "Where should you paint to hide part of a masked layer?", options: ["On the layer mask thumbnail", "On the document tab", "On the rulers", "On the status bar"], answer: 0 },
      { question: "What does a gray area on a mask usually create?", options: ["Partial transparency", "A new layer", "A selection outline", "A color profile"], answer: 0 },
    ],
    [
      { question: "Which tool is commonly used to remove small blemishes?", options: ["Spot Healing Brush", "Type Tool", "Gradient Tool", "Hand Tool"], answer: 0 },
      { question: "What does the Clone Stamp use to paint over an area?", options: ["Pixels sampled from another area", "A new font", "A vector formula", "The document title"], answer: 0 },
      { question: "Why retouch on a separate layer when possible?", options: ["It keeps the original pixels easier to preserve", "It makes the image a video", "It removes the need to save", "It converts the layer to text"], answer: 0 },
      { question: "What should you check after using a healing tool?", options: ["Whether nearby texture and edges still look natural", "Whether the file name has changed", "Whether the toolbar is hidden", "Whether the canvas is locked"], answer: 0 },
      { question: "What is a sensible way to sample for Clone Stamp retouching?", options: ["Choose a nearby area with similar texture and tone", "Sample from an unrelated flat color", "Sample from the layer name", "Avoid sampling any pixels"], answer: 0 },
    ],
    [
      { question: "Which tool creates editable text in Photoshop?", options: ["Type Tool", "Crop Tool", "Dodge Tool", "Hand Tool"], answer: 0 },
      { question: "What is a benefit of keeping text on its own layer?", options: ["You can edit its wording and appearance separately", "It automatically sharpens the photo", "It removes all other layers", "It prevents font changes"], answer: 0 },
      { question: "What does a shape layer preserve?", options: ["An editable shape", "A flattened screenshot only", "A video timeline", "A color profile"], answer: 0 },
      { question: "Which change can improve text hierarchy in a design?", options: ["Vary size or weight for headings and supporting text", "Use identical styling for every line", "Place text outside the canvas", "Hide the text layer"], answer: 0 },
      { question: "What should you do after transforming a text or shape layer?", options: ["Review its placement and scale on the canvas", "Delete the layer mask", "Switch to another file format", "Clear the document history"], answer: 0 },
    ],
    [
      { question: "What is a key benefit of an adjustment layer?", options: ["It changes image appearance without directly replacing pixels", "It deletes hidden layers", "It converts the image to audio", "It locks the canvas size"], answer: 0 },
      { question: "Which adjustment is commonly used to change color intensity?", options: ["Hue/Saturation", "Canvas Size", "Ruler Settings", "Perspective Crop"], answer: 0 },
      { question: "What does a Levels adjustment primarily help control?", options: ["Shadows, midtones, and highlights", "Layer names", "Text spelling", "Video playback speed"], answer: 0 },
      { question: "How can you limit an adjustment layer to one layer below it?", options: ["Create a clipping mask", "Flatten the document", "Hide the Layers panel", "Change the file extension"], answer: 0 },
      { question: "Why compare an edited image with its original appearance?", options: ["To make sure the correction improves the image", "To remove the original file", "To convert layers into selections", "To change the document language"], answer: 0 },
    ],
    [
      { question: "What is a benefit of converting a layer to a Smart Object before filtering?", options: ["You can adjust or remove Smart Filters later", "It permanently flattens all layers", "It turns pixels into audio", "It disables saving"], answer: 0 },
      { question: "What does a blur filter generally change?", options: ["Image sharpness and detail", "Layer order", "Document name", "Selection mode"], answer: 0 },
      { question: "Where can you revisit a Smart Filter after applying it?", options: ["Under its Smart Object layer in the Layers panel", "In the file name", "In the color picker only", "In the operating system taskbar"], answer: 0 },
      { question: "What is a good practice when applying a strong effect?", options: ["Review the result at different zoom levels", "Hide every layer", "Delete the source image", "Export before checking"], answer: 0 },
      { question: "How can you reduce the strength of a Smart Filter?", options: ["Adjust the filter blending options", "Rename the document", "Change the canvas units", "Deselect the layer"], answer: 0 },
    ],
    [
      { question: "Which format usually preserves transparency for a web graphic?", options: ["PNG", "JPG", "TXT", "BMP only"], answer: 0 },
      { question: "Which format is commonly used for a compact photographic image?", options: ["JPG", "PSD", "SVG", "TIFF only"], answer: 0 },
      { question: "Which file should you keep if you want to continue editing layers later?", options: ["A PSD project", "A flattened JPG only", "A plain text file", "A screenshot of the canvas"], answer: 0 },
      { question: "What should you check before exporting?", options: ["The image dimensions and intended use", "The computer volume", "The keyboard layout", "The hidden panels"], answer: 0 },
      { question: "Why review the exported file after saving?", options: ["To confirm it looks correct in the chosen format", "To automatically restore deleted layers", "To change the source video", "To unlock the toolbar"], answer: 0 },
    ],
  ]),
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
  const [showPassword, setShowPassword] = useState(false);
  const [authName, setAuthName] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  const [page, setPage] = useState("dashboard");
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [lessonSelected, setLessonSelected] = useState(false);
  const [lessonIndex, setLessonIndex] = useState(0);
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
  const videos = selectedCourse?.videos ?? [];
  const currentVideo = videos[lessonIndex] ?? null;
  const currentQuiz = selectedCourse
    ? QUIZZES[selectedCourse.id] || []
    : [];
  const quiz = currentQuiz[lessonIndex] || [];

  const completedCount = Object.keys(completed).filter(
    (key) => completed[key] === true
  ).length;

  const totalLessons = COURSES.reduce(
    (total, course) => total + course.videos.length,
    0
  );

  const overallPercent = totalLessons
    ? Math.min(100, Math.round((completedCount / totalLessons) * 100))
    : 0;

  const courseProgress = useMemo(
    () =>
      COURSES.map((course) => {
        const list = course.videos;
        const done = list.filter(
          (_, index) => completed[`${course.id}:${index}`] === true
        ).length;
        return {
          ...course,
          lessonCount: list.length,
          completedCount: done,
          nextLessonIndex: list.findIndex(
            (_, index) => completed[`${course.id}:${index}`] !== true
          ),
          percent: list.length ? Math.round((done / list.length) * 100) : 0,
        };
      }),
    [completed]
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

  const openCourse = (courseId) => {
    const course = COURSES.find((item) => item.id === courseId);
    const nextLessonIndex = course?.videos.findIndex(
      (_, index) => completed[`${courseId}:${index}`] !== true
    ) ?? -1;

    setSelectedCourseId(courseId);
    setLessonSelected(false);
    setLessonIndex(nextLessonIndex >= 0 ? nextLessonIndex : 0);
    setVideoEnded(false);
    setAnswers({});
    setQuizPassed(false);
    setQuizMessage("");
    setPage("skills");
    setMobileSidebarOpen(false);
  };

  const returnToCourseList = () => {
    setSelectedCourseId(null);
    setLessonSelected(false);
    setVideoEnded(false);
    setAnswers({});
    setQuizPassed(false);
    setQuizMessage("");
  };

  const returnToLessonList = () => {
    setLessonSelected(false);
    setQuizPassed(false);
    setQuizMessage("");
  };

  const isLessonUnlocked = (courseId, index) => {
    if (index === 0) return true;
    return completed[`${courseId}:${index - 1}`] === true;
  };

  const selectLesson = (index) => {
    if (!selectedCourse || !isLessonUnlocked(selectedCourse.id, index)) return;
    setLessonSelected(true);
    setLessonIndex(index);
    setVideoEnded(false);
    setAnswers({});
    setQuizPassed(false);
    setQuizMessage("");
  };

  const submitQuiz = async () => {
    if (!selectedCourse || !quiz.length) return;

    if (!videoEnded) {
      setQuizPassed(false);
      setQuizMessage("Finish watching this lesson before submitting its quiz.");
      return;
    }

    const unanswered = quiz.some(
      (_, index) => answers[`${lessonIndex}:${index}`] === undefined
    );
    if (unanswered) {
      setQuizPassed(false);
      setQuizMessage("Answer all five questions before submitting.");
      return;
    }

    const correctCount = quiz.filter(
      (question, index) =>
        Number(answers[`${lessonIndex}:${index}`]) === question.answer
    ).length;
    const score = Math.round((correctCount / quiz.length) * 100);
    if (score < 70) {
      setQuizPassed(false);
      setQuizMessage(`You scored ${score}%. You need at least 70% to pass. Review and try again.`);
      return;
    }

    const key = `${selectedCourse.id}:${lessonIndex}`;
    const nextCompleted = { ...completed, [key]: true };

    setQuizPassed(true);
    setQuizMessage(`You scored ${score}%. You passed, and your progress is being saved.`);
    await saveProgress(
      nextCompleted,
      `Completed ${selectedCourse.title} — lesson ${lessonIndex + 1}`
    );
  };

  const goToNextLesson = () => {
    if (!selectedCourse || !videos.length) return;
    const nextIndex = lessonIndex + 1;
    if (nextIndex < videos.length && isLessonUnlocked(selectedCourse.id, nextIndex)) {
      setLessonIndex(nextIndex);
      setLessonSelected(false);
      setVideoEnded(false);
      setAnswers({});
      setQuizPassed(false);
      setQuizMessage("");
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
                      className="sm-password-input"
                      type={showPassword ? "text" : "password"}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      minLength={6}
                      autoComplete={
                        authMode === "signup" ? "new-password" : "current-password"
                      }
                    />
                    <button
                      className="sm-password-toggle"
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
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
          {selectedCourse && lessonSelected ? (
            <CourseView
              course={selectedCourse}
              videos={videos}
              lessonIndex={lessonIndex}
              currentVideo={currentVideo}
              completed={completed}
              videoEnded={videoEnded}
setVideoEnded={setVideoEnded}
              quiz={quiz}
              answers={answers}
              setAnswers={setAnswers}
              quizMessage={quizMessage}
              quizPassed={quizPassed}
              submitQuiz={submitQuiz}
              goToNextLesson={goToNextLesson}
              returnToLessonList={returnToLessonList}
              loading={progressLoading}
            />
          ) : selectedCourse ? (
            <CourseLessonsPage
              course={selectedCourse}
              videos={videos}
              lessonIndex={lessonIndex}
              completed={completed}
              selectLesson={selectLesson}
              isLessonUnlocked={isLessonUnlocked}
              returnToCourseList={returnToCourseList}
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
  const isComplete = course.lessonCount > 0 && course.nextLessonIndex === -1;
  const actionLabel = isComplete
    ? "Review course"
    : course.completedCount > 0
    ? `Continue lesson ${course.nextLessonIndex + 1}`
    : "Start lesson 1";

  return (
    <article className="sm-course-card">
      <div className="sm-course-card-top">
        <div className="sm-course-app-icon" style={{ "--course-color": course.color }}>{course.icon}</div>
        <span className="sm-course-tag">{course.lessonCount ? `${course.lessonCount} lessons` : "Coming soon"}</span>
      </div>
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      <div className="sm-course-progress-meta">
        <span>{course.completedCount} completed</span>
        <strong>{course.percent}%</strong>
      </div>
      <div className="sm-progress-track"><span style={{ width: `${course.percent}%`, background: course.color }} /></div>
      <button className="sm-course-open-button" onClick={() => openCourse(course.id)} disabled={!course.lessonCount}>
        {course.lessonCount ? <>{actionLabel} <ChevronRight size={17} /></> : "Lessons coming soon"}
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

function CourseLessonsPage({
  course,
  videos,
  lessonIndex,
  completed,
  selectLesson,
  isLessonUnlocked,
  returnToCourseList,
}) {
  const completedLessonCount = videos.filter(
    (_, index) => completed[`${course.id}:${index}`] === true
  ).length;
  const coursePercent = videos.length
    ? Math.round((completedLessonCount / videos.length) * 100)
    : 0;

  return (
    <>
      <button className="sm-back-button" onClick={returnToCourseList}>
        <ArrowLeft size={17} /> All courses
      </button>

      <PageHeading
        eyebrow="COURSE LESSONS"
        title={course.title}
        description="Choose a lesson to start learning. Complete lessons in order to unlock the next one."
      />

      {videos.length > 0 ? (
        <>
          <section className="sm-course-overview">
            <div className="sm-course-app-icon" style={{ "--course-color": course.color }}>
              {course.icon}
            </div>
            <div className="sm-course-overview-copy">
              <strong>{completedLessonCount} of {videos.length} lessons complete</strong>
              <span>{completedLessonCount === videos.length ? "Course complete" : `Next up: Lesson ${lessonIndex + 1}`}</span>
            </div>
            <strong className="sm-course-overview-percent">{coursePercent}%</strong>
            <div className="sm-progress-track">
              <span style={{ width: `${coursePercent}%`, background: course.color }} />
            </div>
          </section>

          <div className="sm-course-lesson-grid">
            {videos.map((video, index) => {
              const isCompleted = completed[`${course.id}:${index}`] === true;
              const isUnlocked = isLessonUnlocked(course.id, index);
              const isNext = index === lessonIndex && !isCompleted;
              const status = isCompleted
                ? "Completed"
                : !isUnlocked
                ? "Locked"
                : isNext
                ? "Recommended next"
                : "Available";

              return (
                <button
                  className={`sm-course-lesson-card ${isNext ? "recommended" : ""}`}
                  key={`${video}-${index}`}
                  disabled={!isUnlocked}
                  onClick={() => selectLesson(index)}
                >
                  <span className="sm-course-lesson-top">
                    <span className="sm-course-lesson-icon">
                      {isCompleted ? <CheckCircle2 size={19} /> : isUnlocked ? <PlayCircle size={19} /> : <LockKeyhole size={18} />}
                    </span>
                    <span className="sm-course-lesson-status">{status}</span>
                  </span>
                  <strong>Lesson {index + 1}</strong>
                  <span className="sm-course-lesson-caption">Photoshop video lesson</span>
                  <span className="sm-course-lesson-action">
                    {isUnlocked ? isCompleted ? "Review lesson" : "Start lesson" : "Complete the previous lesson first"}
                    {isUnlocked && <ChevronRight size={16} />}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="sm-player-placeholder">
          <h3>Lessons coming soon</h3>
          <p>This course does not have any videos available yet.</p>
        </div>
      )}
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
  quiz,
  answers,
  setAnswers,
  quizMessage,
  quizPassed,
  submitQuiz,
  goToNextLesson,
  returnToLessonList,
  loading,
}) {
  const [lessonStage, setLessonStage] = useState("video");
  const lessonKey = `${course.id}:${lessonIndex}`;
  const isCompleted = completed[lessonKey] === true;

  useEffect(() => {
    setVideoEnded(false);
    setLessonStage("video");
  }, [course.id, lessonIndex, setVideoEnded]);

  return (
    <>
      <button
        className="sm-back-button"
        onClick={lessonStage === "quiz" ? () => setLessonStage("video") : returnToLessonList}
      >
        <ArrowLeft size={17} /> {lessonStage === "quiz" ? "Back to video" : "All lessons"}
      </button>

      <PageHeading
        eyebrow={lessonStage === "quiz" ? "LESSON QUIZ" : "COURSE WORKSPACE"}
        title={lessonStage === "quiz" ? `Lesson ${lessonIndex + 1} quiz` : course.title}
        description={lessonStage === "quiz" ? "Score at least 70% to complete this lesson and unlock the next one." : course.description}
      />

      <div className="sm-lesson-layout">
        <div className="sm-lesson-main">
          {lessonStage === "video" ? (
            <section className="sm-video-panel">
              <div className="sm-video-panel-heading">
                <div>
                  <span className="sm-eyebrow">LESSON {videos.length ? lessonIndex + 1 : "—"}</span>
                  <h2>{currentVideo ? `Lesson ${lessonIndex + 1}` : "No lessons available"}</h2>
                </div>
                {isCompleted && <span className="sm-complete-pill"><CheckCircle2 size={15} /> Completed</span>}
              </div>

              {currentVideo ? (
                <video
                  className="sm-local-video"
                  src={currentVideo}
                  controls
                  playsInline
                  preload="metadata"
                  onEnded={() => setVideoEnded(true)}
                />
              ) : (
                <div className="sm-player-placeholder">
                  <h3>No local lessons available</h3>
                  <p>There are no video files configured for this course yet.</p>
                </div>
              )}

              {videos.length > 0 && (
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
                      Finish the video to continue
                    </span>
                  )}
                </div>
              )}

              {videoEnded && videos.length > 0 && (
                <div className="sm-video-next-row">
                  <button
                    className="sm-primary-button"
                    onClick={() => setLessonStage("quiz")}
                  >
                    Next: Quiz <ChevronRight size={17} />
                  </button>
                </div>
              )}
            </section>
          ) : (

          <section className="sm-quiz-panel">
            <div className="sm-panel-heading">
              <div><span className="sm-eyebrow">KNOWLEDGE CHECK</span><h2>Lesson quiz</h2></div>
              <span className="sm-quiz-count">{quiz.length} questions</span>
            </div>
            {!videos.length ? (
              <p className="sm-muted">The quiz is unavailable because this course has no videos.</p>
            ) : (
              <>
                <div className="sm-quiz-questions">
                  {quiz.map((question, questionIndex) => (
                    <div className="sm-quiz-question" key={question.question}>
                      <h3>{questionIndex + 1}. {question.question}</h3>
                      <div className="sm-quiz-options">
                        {question.options.map((option, optionIndex) => {
                          const answerKey = `${lessonIndex}:${questionIndex}`;
                          const isSelected = Number(answers[answerKey]) === optionIndex;
                          return (
                            <label
                              className={`sm-quiz-option ${isSelected ? "selected" : ""}`}
                              key={option}
                            >
                              <input
                                type="radio"
                                name={`quiz-${course.id}-${lessonIndex}-${questionIndex}`}
                                checked={isSelected}
                                onChange={() => {
                                  setAnswers((previous) => ({ ...previous, [answerKey]: optionIndex }));
                                  setQuizMessage("");
                                  setQuizPassed(false);
                                }}
                              />
                              <span className="sm-option-letter">{String.fromCharCode(65 + optionIndex)}</span>
                              <span>{option}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {quizMessage && (
                  <div className={`sm-quiz-message ${quizPassed ? "success" : ""}`} role="status">
                    {quizMessage}
                  </div>
                )}
                <div className="sm-quiz-footer">
                  <p><LockKeyhole size={15} /> {videoEnded ? "Score at least 70% to pass this quiz." : "Finish the video before submitting the quiz."}</p>
                  <button
                    className="sm-primary-button"
                    onClick={submitQuiz}
                    disabled={quiz.some((_, index) => answers[`${lessonIndex}:${index}`] === undefined) || !videoEnded || isCompleted}
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
          )}
        </div>

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
      {!totalLessons && <div className="sm-info-note"><PlayCircle size={19} /><div><strong>No local lessons available</strong><p>Add course videos to make lessons available.</p></div></div>}
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
    { title: "Creative Explorer", text: "Complete both creative courses.", icon: Sparkles, unlocked: courses.every((course) => course.lessonCount > 0) },
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
