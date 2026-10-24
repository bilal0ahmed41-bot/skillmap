
import React, { useState } from "react";

export default function ProjectEvaluator({
  lessonTitle,
  projectRequirements,
  onPass,
}) {
  const [completed, setCompleted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const requirements = Array.isArray(projectRequirements)
    ? projectRequirements
    : typeof projectRequirements === "string"
      ? projectRequirements
          .split(/\n/)
          .map((item) => item.replace(/^[\s\-•\d.)]+/, "").trim())
          .filter(Boolean)
      : [];

  function markComplete() {
    if (!confirmed) return;

    setCompleted(true);

    if (typeof onPass === "function") {
      onPass({
        passed: true,
        score: 10,
        feedback: "Project manually marked as complete.",
      });
    }
  }

  return (
    <section className="sm-project-evaluator">
      <h2>🎯 Complete Your Project</h2>

      <p>
        Finish the practical project for <strong>{lessonTitle}</strong>.
        Use the checklist below to track your work.
      </p>

      <div className="sm-project-requirements">
        <strong>Project requirements</strong>

        {requirements.length > 0 ? (
          <ul>
            {requirements.map((item, index) => (
              <li key={`${index}-${item}`}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>{projectRequirements || "Complete the assigned project."}</p>
        )}
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          margin: "18px 0",
          cursor: completed ? "default" : "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={confirmed}
          disabled={completed}
          onChange={(event) => setConfirmed(event.target.checked)}
        />
        <span>
          I have completed the project and checked my work against the
          requirements.
        </span>
      </label>

      <button
        type="button"
        onClick={markComplete}
        disabled={!confirmed || completed}
      >
        {completed ? "✓ Project Completed" : "Mark Project Complete"}
      </button>

      {completed && (
        <div className="sm-project-result" role="status">
          <h3>🎉 Project completed!</h3>
          <p>
            You marked this project as complete. You can continue learning.
          </p>
        </div>
      )}
    </section>
  );
}
