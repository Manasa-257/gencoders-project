
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  startSession,
  readStoredConfig,
  getConfigOptions,
} from "../services/sessionService";

const FALLBACK_CONFIG_OPTIONS = {
  personas: [
    { value: "polite", name: "Polite Customer" },
    { value: "concerned", name: "Concerned Customer" },
    { value: "frustrated", name: "Frustrated Customer" },
    { value: "angry", name: "Angry Customer" },
    { value: "furious", name: "Furious Customer" },
  ],
  scenarios: [
    { value: "delayed_order", name: "Delayed Order" },
    { value: "refund_request", name: "Refund Request" },
    { value: "payment_failure", name: "Payment Failure" },
    { value: "account_issue", name: "Account Access Issue" },
    { value: "cancellation", name: "Cancellation Request" },
  ],
  resolutions: [
    { value: "full_refund", name: "Full Refund" },
    { value: "partial_refund", name: "Partial Refund" },
    { value: "replacement", name: "Replacement" },
    { value: "store_credit", name: "Store Credit" },
    { value: "cancellation_confirmed", name: "Cancellation Confirmed" },
    { value: "account_restored", name: "Account Restored" },
    { value: "new_delivery_date", name: "New Delivery Date" },
  ],
};

function SessionConfiguration() {
  const navigate = useNavigate();

  const [form, setForm] = useState(() => {
    const stored = readStoredConfig();

    return {
      mode: stored?.mode || "simulator",
      persona: stored?.persona || "frustrated",
      scenario: stored?.scenario || "delayed_order",
      initial_emotion: stored?.initial_emotion || "frustrated",
      severity: stored?.severity || "medium",
      expected_resolution: stored?.expected_resolution || "full_refund",
      frustration_level: stored?.frustration_level ?? 5,
      patience: stored?.patience ?? 5,
    };
  });

  const [configOptions, setConfigOptions] = useState(
    FALLBACK_CONFIG_OPTIONS
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSimulator = form.mode === "simulator";

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      try {
        const options = await getConfigOptions();

        if (cancelled || !options) return;

        setConfigOptions({
          personas: options.personas?.length
            ? options.personas
            : FALLBACK_CONFIG_OPTIONS.personas,

          scenarios: options.scenarios?.length
            ? options.scenarios
            : FALLBACK_CONFIG_OPTIONS.scenarios,

          resolutions: options.resolutions?.length
            ? options.resolutions.map((resolution) =>
                typeof resolution === "string"
                  ? {
                      value: resolution,
                      name: resolution
                        .split("_")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() +
                            word.slice(1)
                        )
                        .join(" "),
                    }
                  : resolution
              )
            : FALLBACK_CONFIG_OPTIONS.resolutions,
        });
      } catch (err) {
        // Keep the built-in options available if the API is offline.
        console.warn(
          "Could not load configuration options; using defaults.",
          err
        );
      }
    }

    loadOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value, type } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "range" ||
        name === "patience" ||
        name === "frustration_level"
          ? Number(value)
          : value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    // Manual Mode uses the Task 7 live support workspace.
    if (form.mode === "manual") {
      navigate("/task7?mode=manual");
      return;
    }

    // Replay Mode uses the Task 7 transcript-upload workspace.
    if (form.mode === "replay") {
      navigate("/task7?mode=replay");
      return;
    }

    // Only Simulator Mode creates a Task 3 backend session.
    setLoading(true);

    try {
      const data = await startSession(form);

      if (!data?.session_id) {
        throw new Error("The backend did not return a session ID.");
      }

      navigate(`/session/${data.session_id}`, {
        state: {
          customerMessage: data.customer_message,
          currentEmotion: data.current_emotion,
          intensity: data.intensity,
          sessionData: form,
        },
      });
    } catch (err) {
      console.error("Failed to start simulator session:", err);

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Unable to start the simulator. Please check the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/");
  };

  return (
    <div className="config-page">
      <header className="config-header">
        <div>
          <h2>SupportAI</h2>
          <span>AI Customer Support Coaching Assistant</span>
        </div>

        <button
          type="button"
          onClick={handleBackToDashboard}
          disabled={loading}
        >
          Back to Dashboard
        </button>
      </header>

      <main className="config-content">
        <div className="config-title">
          <h1>Start a Support Session</h1>
          <p>
            Choose how you want to handle a customer conversation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="config-card">
          <div className="form-section">
            <h2>Choose Interaction Mode</h2>

            <div className="mode-grid">
              <label
                className={`mode-option ${
                  form.mode === "simulator" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  value="simulator"
                  checked={form.mode === "simulator"}
                  onChange={handleChange}
                  disabled={loading}
                />

                <div>
                  <strong>AI Simulator</strong>
                  <p>
                    Practise with an AI-generated customer whose
                    behaviour depends on the selected scenario.
                  </p>
                </div>
              </label>

              <label
                className={`mode-option ${
                  form.mode === "manual" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  value="manual"
                  checked={form.mode === "manual"}
                  onChange={handleChange}
                  disabled={loading}
                />

                <div>
                  <strong>Manual Support</strong>
                  <p>
                    Enter customer messages and agent replies.
                    Receive live AI coaching and escalation analysis.
                  </p>
                </div>
              </label>

              <label
                className={`mode-option ${
                  form.mode === "replay" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  value="replay"
                  checked={form.mode === "replay"}
                  onChange={handleChange}
                  disabled={loading}
                />

                <div>
                  <strong>Replay Conversation</strong>
                  <p>
                    Upload a TXT, CSV or JSON transcript, or replay
                    a previously recorded simulator conversation.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {isSimulator && (
            <>
              <div className="form-section">
                <h2>Customer Configuration</h2>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="persona">Customer Persona</label>

                    <select
                      id="persona"
                      name="persona"
                      value={form.persona}
                      onChange={handleChange}
                    >
                      {configOptions.personas.map((persona) => (
                        <option
                          key={persona.value}
                          value={persona.value}
                        >
                          {persona.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="scenario">Scenario</label>

                    <select
                      id="scenario"
                      name="scenario"
                      value={form.scenario}
                      onChange={handleChange}
                    >
                      {configOptions.scenarios.map((scenario) => (
                        <option
                          key={scenario.value}
                          value={scenario.value}
                        >
                          {scenario.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="initial_emotion">
                      Initial Emotion
                    </label>

                    <select
                      id="initial_emotion"
                      name="initial_emotion"
                      value={form.initial_emotion}
                      onChange={handleChange}
                    >
                      <option value="frustrated">
                        Moderately Frustrated
                      </option>
                      <option value="calm">Calm</option>
                      <option value="neutral">Neutral</option>
                      <option value="worried">Worried</option>
                      <option value="angry">Angry</option>
                      <option value="furious">Furious</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="severity">Issue Severity</label>

                    <select
                      id="severity"
                      name="severity"
                      value={form.severity}
                      onChange={handleChange}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="expected_resolution">
                      Expected Resolution
                    </label>

                    <select
                      id="expected_resolution"
                      name="expected_resolution"
                      value={form.expected_resolution}
                      onChange={handleChange}
                    >
                      {configOptions.resolutions.map((resolution) => (
                        <option
                          key={resolution.value}
                          value={resolution.value}
                        >
                          {resolution.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="patience-heading">
                  <div>
                    <h2>Initial Frustration Level</h2>
                    <p>
                      Set the customer's starting frustration level.
                    </p>
                  </div>

                  <strong>
                    {form.frustration_level}/10
                  </strong>
                </div>

                <input
                  className="patience-slider"
                  type="range"
                  name="frustration_level"
                  min="1"
                  max="10"
                  value={form.frustration_level}
                  onChange={handleChange}
                />

                <div className="slider-labels">
                  <span>1 (Very Calm)</span>
                  <span>10 (Extremely Angry)</span>
                </div>
              </div>

              <div className="form-section">
                <div className="patience-heading">
                  <div>
                    <h2>Customer Patience Level</h2>
                    <p>
                      Set how quickly the customer loses patience.
                    </p>
                  </div>

                  <strong>{form.patience}/10</strong>
                </div>

                <input
                  className="patience-slider"
                  type="range"
                  name="patience"
                  min="1"
                  max="10"
                  value={form.patience}
                  onChange={handleChange}
                />

                <div className="slider-labels">
                  <span>1 (Very Patient)</span>
                  <span>10 (Very Impatient)</span>
                </div>
              </div>
            </>
          )}

          {!isSimulator && (
            <div className="form-section">
              {form.mode === "manual" ? (
                <>
                  <h2>Manual Support Workspace</h2>
                  <p>
                    Continue to the conversation workspace to enter
                    customer messages, send agent replies and view
                    real-time coaching.
                  </p>
                </>
              ) : (
                <>
                  <h2>Replay Workspace</h2>
                  <p>
                    Continue to upload a TXT, CSV or JSON transcript,
                    or select a previously recorded conversation.
                  </p>
                </>
              )}
            </div>
          )}

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <div className="config-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={handleBackToDashboard}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Starting Simulator..."
                : form.mode === "manual"
                  ? "Open Manual Workspace"
                  : form.mode === "replay"
                    ? "Open Replay Workspace"
                    : "Start Simulator"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default SessionConfiguration;
