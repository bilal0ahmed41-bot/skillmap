
import React from "react";
import {
  LayoutDashboard,
  BookOpen,
  ChartNoAxesColumnIncreasing,
  Trophy,
  Settings,
  Palette,
  CheckCircle2,
  Clock3,
  Flame,
  Moon,
  Sun,
  UserRound,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const SKILLMAP_PAGES = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "skills", label: "My Skills", icon: BookOpen },
  { id: "progress", label: "Progress", icon: ChartNoAxesColumnIncreasing },
  { id: "achievements", label: "Achievements", icon: Trophy },
  { id: "settings", label: "Settings", icon: Settings },
];

export function SkillMapSidebar({
  page,
  setPage,
  user,
  dark,
  toggleTheme,
  signOut,
}) {
  return (
    <aside className="sx-sidebar">
      <div className="sx-brand">
        <div className="sx-brand-mark"><Palette size={23} /></div>
        <div>
          <strong>SkillMap</strong>
          <span>Learn by doing</span>
        </div>
      </div>

      <p className="sx-nav-label">WORKSPACE</p>

      <nav className="sx-nav">
        {SKILLMAP_PAGES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`sx-nav-item ${page === id ? "active" : ""}`}
            onClick={() => setPage(id)}
          >
            <Icon size={19} />
            <span>{label}</span>
            {page === id && <span className="sx-nav-dot" />}
          </button>
        ))}
      </nav>

      <div className="sx-sidebar-bottom">
        <button className="sx-nav-item" onClick={toggleTheme}>
          {dark ? <Sun size={19} /> : <Moon size={19} />}
          <span>{dark ? "Light mode" : "Dark mode"}</span>
        </button>

        <div className="sx-user">
          <div className="sx-avatar">
            <UserRound size={20} />
          </div>
          <div className="sx-user-info">
            <strong>{user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Learner"}</strong>
            <span>{user?.email || ""}</span>
          </div>
          <button className="sx-logout" onClick={signOut} title="Sign out">
            ↗
          </button>
        </div>
      </div>
    </aside>
  );
}

function Stat({ icon: Icon, label, value, note }) {
  return (
    <article className="sx-stat">
      <div className="sx-stat-top">
        <span>{label}</span>
        <span className="sx-stat-icon"><Icon size={19} /></span>
      </div>
      <strong className="sx-stat-value">{value}</strong>
      <span className="sx-stat-note">{note}</span>
    </article>
  );
}

export function SkillMapDashboard({
  user,
  courses = [],
  completed = {},
  activity = [],
  openCourse,
  setPage,
}) {
  const totalLessons = courses.reduce(
    (sum, course) => sum + (course.lessonCount || 0),
    0
  );

  const completedCount = Object.values(completed).filter(Boolean).length;
  const percentage = totalLessons
    ? Math.min(100, Math.round((completedCount / totalLessons) * 100))
    : 0;

  const firstCourse = courses[0];

  return (
    <div className="sx-page">
      <div className="sx-welcome">
        <div>
          <span className="sx-eyebrow"><Sparkles size={15} /> YOUR LEARNING SPACE</span>
          <h1>Welcome back, {user?.user_metadata?.full_name?.split(" ")[0] || "Learner"}!</h1>
          <p>Small steps every day. Keep building your creative skills.</p>
        </div>
        <div className="sx-welcome-art"><Palette size={46} /></div>
      </div>

      <div className="sx-stats-grid">
        <Stat icon={BookOpen} label="Available skills" value={courses.length} note="Your learning paths" />
        <Stat icon={CheckCircle2} label="Lessons completed" value={completedCount} note="Keep up the momentum" />
        <Stat icon={ChartNoAxesColumnIncreasing} label="Overall progress" value={`${percentage}%`} note="Across your lessons" />
        <Stat icon={Flame} label="Learning status" value={completedCount ? "In progress" : "Ready"} note="Your next step awaits" />
      </div>

      <section className="sx-section">
        <div className="sx-section-heading">
          <div>
            <h2>Continue learning</h2>
            <p>Pick up where you want to build your skills.</p>
          </div>
          <button className="sx-text-button" onClick={() => setPage("skills")}>
            All skills <ArrowRight size={16} />
          </button>
        </div>

        <div className="sx-course-grid">
          {courses.map((course, index) => {
            const count = course.lessonCount || 0;
            const done = Object.keys(completed).filter(
              (key) => key.startsWith(`${course.id}:`) && completed[key]
            ).length;
            const progress = count ? Math.min(100, Math.round((done / count) * 100)) : 0;

            return (
              <article className="sx-course-card" key={course.id}>
                <div className={`sx-course-art sx-art-${index % 2}`}>
                  <Palette size={32} />
                  <span>{index === 0 ? "01" : "02"}</span>
                </div>
                <div className="sx-course-content">
                  <span className="sx-course-tag">CREATIVE DESIGN</span>
                  <h3>{course.title}</h3>
                  <p>{course.description || "Learn step by step through video lessons and quizzes."}</p>
                  <div className="sx-progress-label">
                    <span>{done} of {count} lessons</span>
                    <strong>{progress}%</strong>
                  </div>
                  <div className="sx-progress-track">
                    <div style={{ width: `${progress}%` }} />
                  </div>
                  <button className="sx-primary-button" onClick={() => openCourse(course)}>
                    Open course <ArrowRight size={17} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="sx-section">
        <div className="sx-section-heading">
          <div>
            <h2>Recent activity</h2>
            <p>Your latest learning updates.</p>
          </div>
        </div>
        <div className="sx-activity-list">
          {activity.length ? activity.slice(0, 5).map((item, i) => (
            <div className="sx-activity" key={item.id || i}>
              <span className="sx-activity-icon"><CheckCircle2 size={19} /></span>
              <div>
                <strong>{item.title || "Learning progress updated"}</strong>
                <p>{item.subtitle || "Keep going with your next lesson."}</p>
              </div>
            </div>
          )) : (
            <div className="sx-empty">
              <Clock3 size={24} />
              <strong>Your learning journey starts here</strong>
              <p>Complete a lesson to start building your activity history.</p>
              {firstCourse && (
                <button className="sx-text-button" onClick={() => openCourse(firstCourse)}>
                  Start learning <ArrowRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export function SkillMapProgress({ courses = [], completed = {} }) {
  const total = courses.reduce((sum, c) => sum + (c.lessonCount || 0), 0);
  const done = Object.values(completed).filter(Boolean).length;
  const percent = total ? Math.min(100, Math.round(done / total * 100)) : 0;

  return (
    <div className="sx-page">
      <div className="sx-page-title">
        <span className="sx-eyebrow">YOUR JOURNEY</span>
        <h1>Learning progress</h1>
        <p>Track the lessons you have completed.</p>
      </div>

      <div className="sx-progress-overview">
        <div>
          <span className="sx-muted">Overall completion</span>
          <div className="sx-big-number">{percent}%</div>
          <p>{done} completed lessons out of {total} available</p>
        </div>
        <div className="sx-progress-ring" style={{ "--progress": `${percent * 3.6}deg` }}>
          <div><strong>{percent}%</strong><span>COMPLETE</span></div>
        </div>
      </div>

      <div className="sx-progress-courses">
        {courses.map((course) => {
          const count = course.lessonCount || 0;
          const finished = Object.keys(completed).filter(
            key => key.startsWith(`${course.id}:`) && completed[key]
          ).length;
          const value = count ? Math.min(100, Math.round(finished / count * 100)) : 0;

          return (
            <article className="sx-progress-course" key={course.id}>
              <div className="sx-progress-course-top">
                <div><h3>{course.title}</h3><p>{finished} of {count} lessons completed</p></div>
                <strong>{value}%</strong>
              </div>
              <div className="sx-progress-track"><div style={{ width: `${value}%` }} /></div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function SkillMapAchievements({ courses = [], completed = {} }) {
  const total = courses.reduce((sum, c) => sum + (c.lessonCount || 0), 0);
  const done = Object.values(completed).filter(Boolean).length;

  const achievements = [
    { title: "First Step", description: "Complete your first lesson.", goal: 1, icon: "🌱" },
    { title: "Getting Started", description: "Complete five lessons.", goal: 5, icon: "⚡" },
    { title: "Creative Explorer", description: "Complete ten lessons.", goal: 10, icon: "🎨" },
    { title: "Skill Builder", description: "Complete half of all lessons.", goal: Math.max(1, Math.ceil(total / 2)), icon: "🏆", half: true },
    { title: "Course Finisher", description: "Complete every available lesson.", goal: Math.max(1, total), all: true, icon: "👑" },
  ];

  return (
    <div className="sx-page">
      <div className="sx-page-title">
        <span className="sx-eyebrow">CELEBRATE YOUR GROWTH</span>
        <h1>Achievements</h1>
        <p>Every lesson completed brings you one step further.</p>
      </div>
      <div className="sx-achievement-grid">
        {achievements.map((a) => {
          const unlocked = a.all ? total > 0 && done >= total : a.half ? done >= a.goal : done >= a.goal;
          return (
            <article className={`sx-achievement ${unlocked ? "unlocked" : ""}`} key={a.title}>
              <div className="sx-achievement-icon">{a.icon}</div>
              <div>
                <h3>{a.title}</h3>
                <p>{a.description}</p>
                <span className={`sx-achievement-status ${unlocked ? "earned" : ""}`}>
                  {unlocked ? "✓ Unlocked" : "🔒 Locked"}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function SkillMapSettings({ user, dark, toggleTheme, signOut }) {
  return (
    <div className="sx-page">
      <div className="sx-page-title">
        <span className="sx-eyebrow">YOUR PREFERENCES</span>
        <h1>Settings</h1>
        <p>Manage your account and learning environment.</p>
      </div>

      <section className="sx-settings-card">
        <div className="sx-settings-heading">
          <div className="sx-settings-icon"><UserRound size={22} /></div>
          <div><h2>Profile</h2><p>Your signed-in account details.</p></div>
        </div>
        <div className="sx-setting-row">
          <span>Display name</span>
          <strong>{user?.user_metadata?.full_name || "Learner"}</strong>
        </div>
        <div className="sx-setting-row">
          <span>Email address</span>
          <strong>{user?.email || "Not available"}</strong>
        </div>
      </section>

      <section className="sx-settings-card">
        <div className="sx-settings-heading">
          <div className="sx-settings-icon"><Moon size={22} /></div>
          <div><h2>Appearance</h2><p>Choose how SkillMap looks on your device.</p></div>
        </div>
        <div className="sx-setting-row">
          <div><strong>Theme</strong><p>{dark ? "Dark theme is enabled" : "Light theme is enabled"}</p></div>
          <button className="sx-secondary-button" onClick={toggleTheme}>
            {dark ? <Sun size={17} /> : <Moon size={17} />}
            Switch to {dark ? "light" : "dark"}
          </button>
        </div>
      </section>

      <section className="sx-settings-card">
        <div className="sx-settings-heading">
          <div className="sx-settings-icon"><Settings size={22} /></div>
          <div><h2>Account</h2><p>Sign out when you are finished.</p></div>
        </div>
        <button className="sx-danger-button" onClick={signOut}>Sign out of SkillMap</button>
      </section>
    </div>
  );
}
