import { useEffect, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  createSubmissionDraft,
  getSubmissionDraft,
  updateSubmissionDraft,
  uploadSubmissionFiles,
  submitSubmissionDraft,
} from "../submission/submission-draft.api";

import SubmissionStepper from "../components/submission/SubmissionStepper";

type Contributor = {
  id: number;
  name: string;
  email: string;
  affiliation: string;
  role: string;
};

type ReviewerSuggestion = {
  id: number;
  name: string;
  email: string;
  affiliation: string;
  expertise: string;
};



const createContributor = (id: number): Contributor => ({
  id,
  name: "",
  email: "",
  affiliation: "",
  role: "Author",
});

const createReviewer = (id: number): ReviewerSuggestion => ({
  id,
  name: "",
  email: "",
  affiliation: "",
  expertise: "",
});

export default function NewSubmission() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [keywords, setKeywords] = useState("");

  const [mainFile, setMainFile] = useState<File | null>(null);
  const [supplementaryFile, setSupplementaryFile] = useState<File | null>(null);
  const [savedMainFilePath, setSavedMainFilePath] = useState<string | null>(null);
  const [savedSupplementaryFilePath, setSavedSupplementaryFilePath] = useState<string | null>(null);

  const [savedMainFileName, setSavedMainFileName] =
  useState<string | null>(null);

const [savedSupplementaryFileName, setSavedSupplementaryFileName] =
  useState<string | null>(null);

  const [contributors, setContributors] = useState<Contributor[]>([
    createContributor(1),
  ]);

  const [editorMessage, setEditorMessage] = useState("");
  const [conflictOfInterest, setConflictOfInterest] = useState("");

  const [reviewers, setReviewers] = useState<ReviewerSuggestion[]>([
    createReviewer(1),
  ]);


  const [draftId, setDraftId] = useState<string | null>(null);
  const [draftLoading, setDraftLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  
  const [draftMessage, setDraftMessage] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");

  const draftInitializationKey = useRef<string | null>(null);
  const draftInitializationInProgress = useRef(false);

const [searchParams] = useSearchParams();
const requestedDraftId = searchParams.get("draftId");

const revisionRequestId =
  searchParams.get("revisionRequestId");

const isRevisionSubmission =
  Boolean(revisionRequestId);

useEffect(() => {
  const initializeDraft = async () => {
    const initializationKey = requestedDraftId
  ? `draft:${requestedDraftId}`
  : revisionRequestId
    ? `revision:${revisionRequestId}`
    : "new-submission";

    if (
        draftInitializationKey.current === initializationKey ||
        draftInitializationInProgress.current
      ) {
        return;
      }

      draftInitializationInProgress.current = true;
      draftInitializationKey.current = initializationKey;

    try {
      setDraftLoading(true);
      setDraftMessage("");

      /*
       * CONTINUE DRAFT
       *
       * If draftId exists in the URL, load exactly that draft.
       */
      if (requestedDraftId) {
        const response = await getSubmissionDraft(requestedDraftId);
        const existingDraft = response.draft;

        if (!existingDraft) {
          throw new Error("The requested submission draft was not found.");
        }

        setDraftId(existingDraft.id);

        setTitle(existingDraft.title || "");
        setAbstract(existingDraft.abstract || "");
        setKeywords(existingDraft.keywords || "");

        setSavedMainFilePath(existingDraft.mainFilePath || null);

        setSavedSupplementaryFilePath(
          existingDraft.supplementaryFilePath || null
        );

        setSavedMainFileName(existingDraft.mainFileName || null);

        setSavedSupplementaryFileName(
          existingDraft.supplementaryFileName || null
        );

        setEditorMessage(existingDraft.editorMessage || "");

        setConflictOfInterest(
          existingDraft.conflictOfInterest || ""
        );

        /*
         * Restore contributors.
         */
        if (existingDraft.contributors) {
          try {
            const parsedContributors = JSON.parse(
              existingDraft.contributors
            );

            if (
              Array.isArray(parsedContributors) &&
              parsedContributors.length > 0
            ) {
              setContributors(parsedContributors);
            }
          } catch {
            console.warn(
              "Unable to parse saved contributors."
            );
          }
        }

        /*
         * Restore reviewer suggestions.
         */
        if (existingDraft.reviewerSuggestions) {
          try {
            const parsedReviewers = JSON.parse(
              existingDraft.reviewerSuggestions
            );

            if (
              Array.isArray(parsedReviewers) &&
              parsedReviewers.length > 0
            ) {
              setReviewers(parsedReviewers);
            }
          } catch {
            console.warn(
              "Unable to parse saved reviewer suggestions."
            );
          }
        }

        /*
         * Restore current step.
         */
        if (
          typeof existingDraft.currentStep === "number" &&
          existingDraft.currentStep >= 1 &&
          existingDraft.currentStep <= 6
        ) {
          setCurrentStep(existingDraft.currentStep);

          setCompletedSteps(
            Array.from(
              {
                length: existingDraft.currentStep - 1,
              },
              (_, index) => index + 1
            )
          );
        } else {
          setCurrentStep(1);
          setCompletedSteps([]);
        }

        console.log(
          "Continue Draft loaded:",
          existingDraft.id
        );

        return;
      }


     const result = await createSubmissionDraft(
        revisionRequestId || undefined
      );

      setDraftId(result.draft.id);

      /*
       * Make absolutely sure the form starts blank.
       */
     setCurrentStep(1);
      setCompletedSteps([]);

      if (revisionRequestId) {
        const revisionDraft = result.draft;

        setTitle(revisionDraft.title || "");
        setAbstract(revisionDraft.abstract || "");
        setKeywords(revisionDraft.keywords || "");

        setMainFile(null);
        setSupplementaryFile(null);

        setSavedMainFilePath(
          revisionDraft.mainFilePath || null
        );

        setSavedSupplementaryFilePath(
          revisionDraft.supplementaryFilePath || null
        );

        setSavedMainFileName(
          revisionDraft.mainFileName || null
        );

        setSavedSupplementaryFileName(
          revisionDraft.supplementaryFileName || null
        );

        if (revisionDraft.contributors) {
          try {
            const parsedContributors =
              JSON.parse(
                revisionDraft.contributors
              );

            if (
              Array.isArray(parsedContributors) &&
              parsedContributors.length > 0
            ) {
              setContributors(
                parsedContributors
              );
            }
          } catch {
            console.warn(
              "Unable to parse revision contributors."
            );
          }
        }

        setEditorMessage(
          revisionDraft.editorMessage || ""
        );

        setConflictOfInterest(
          revisionDraft.conflictOfInterest || ""
        );
      } else {
        setTitle("");
        setAbstract("");
        setKeywords("");

        setMainFile(null);
        setSupplementaryFile(null);

        setSavedMainFilePath(null);
        setSavedSupplementaryFilePath(null);

        setSavedMainFileName(null);
        setSavedSupplementaryFileName(null);

        setContributors([
          createContributor(1),
        ]);

        setEditorMessage("");
        setConflictOfInterest("");

        setReviewers([
          createReviewer(1),
        ]);
      }

      console.log(
        "New submission draft created:",
        result.draft.id
      );
    } catch (error) {
      console.error(
        "Failed to initialize submission draft:",
        error
      );

      setDraftMessage(
        error instanceof Error
          ? error.message
          : "Unable to initialize the submission."
      );
    } finally {
      draftInitializationInProgress.current = false;
      setDraftLoading(false);
    }
  };

initializeDraft();
}, [requestedDraftId, revisionRequestId]);


  const updateContributor = (
    id: number,
    field: keyof Contributor,
    value: string
  ) => {
    setContributors((previous) =>
      previous.map((contributor) =>
        contributor.id === id
          ? {
              ...contributor,
              [field]: value,
            }
          : contributor
      )
    );
  };

  const addContributor = () => {
    const nextId =
      contributors.length > 0
        ? Math.max(...contributors.map((item) => item.id)) + 1
        : 1;

    setContributors((previous) => [
      ...previous,
      createContributor(nextId),
    ]);
  };

  const removeContributor = (id: number) => {
    if (contributors.length === 1) return;

    setContributors((previous) =>
      previous.filter((contributor) => contributor.id !== id)
    );
  };

  const updateReviewer = (
    id: number,
    field: keyof ReviewerSuggestion,
    value: string
  ) => {
    setReviewers((previous) =>
      previous.map((reviewer) =>
        reviewer.id === id
          ? {
              ...reviewer,
              [field]: value,
            }
          : reviewer
      )
    );
  };

  const addReviewer = () => {
    const nextId =
      reviewers.length > 0
        ? Math.max(...reviewers.map((item) => item.id)) + 1
        : 1;

    setReviewers((previous) => [
      ...previous,
      createReviewer(nextId),
    ]);
  };

  const removeReviewer = (id: number) => {
    if (reviewers.length === 1) return;

    setReviewers((previous) =>
      previous.filter((reviewer) => reviewer.id !== id)
    );
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!title.trim()) {
        alert("Please enter the manuscript title.");
        return false;
      }

      if (!abstract.trim()) {
        alert("Please enter the manuscript abstract.");
        return false;
      }

      if (!keywords.trim()) {
        alert("Please enter at least one keyword.");
        return false;
      }
    }

    if (step === 2) {
      if (!mainFile && !savedMainFilePath) {
        alert("Please upload the main manuscript file.");
        return false;
      }
    }

    if (step === 3) {
      const hasInvalidContributor = contributors.some(
        (contributor) =>
          !contributor.name.trim() || !contributor.email.trim()
      );

      if (hasInvalidContributor) {
        alert("Please complete the required contributor information.");
        return false;
      }
    }

    return true;
  };

  const goToNextStep = () => {
    if (!validateStep(currentStep)) return;

    setCompletedSteps((previous) =>
      previous.includes(currentStep)
        ? previous
        : [...previous, currentStep]
    );

    if (currentStep < 6) {
      setCurrentStep((previous) => previous + 1);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const goToPreviousStep = () => {
    if (currentStep <= 1) return;

    setCurrentStep((previous) => previous - 1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


const handleSaveSubmission = async () => {
  if (!draftId) {
    setDraftMessage("Submission draft is not ready yet.");
    return;
  }

  // Submission can be saved only after reaching the final step.
  if (currentStep !== 6) {
    setDraftMessage(
      "Please complete all 6 steps before saving the submission."
    );
    return;
  }

  if (savingDraft) return;

  try {
    setSavingDraft(true);
    setDraftMessage("");

    await updateSubmissionDraft(draftId, {
      title,
      abstract,
      keywords,
      contributors: JSON.stringify(contributors),
      editorMessage,
      conflictOfInterest,
      reviewerSuggestions: JSON.stringify(reviewers),
      currentStep: 6,
      revisionRequestId:
      isRevisionSubmission
      ? revisionRequestId
      : undefined,
    });

    setCompletedSteps([1, 2, 3, 4, 5, 6]);
    setDraftMessage("Submission saved successfully.");

    navigate("/author/submission/saved");
  } catch (error) {
    console.error("Failed to save submission:", error);

    setDraftMessage(
      error instanceof Error
        ? error.message
        : "Unable to save submission."
    );
  } finally {
    setSavingDraft(false);
  }
};


useEffect(() => {
  if (!draftId || draftLoading) return;

  const timer = window.setTimeout(async () => {
    try {
      setAutoSaveStatus("saving");

      await updateSubmissionDraft(draftId, {
        title,
        abstract,
        keywords,
        contributors: JSON.stringify(contributors),
        editorMessage,
        conflictOfInterest,
        reviewerSuggestions: JSON.stringify(reviewers),
        currentStep,
        revisionRequestId:
        isRevisionSubmission
      ? revisionRequestId
      : undefined,
      });

      setAutoSaveStatus("saved");
    } catch (error) {
      console.error("Auto-save failed:", error);
      setAutoSaveStatus("idle");
    }
  }, 1500);

  return () => {
    window.clearTimeout(timer);
  };
}, [
  draftId,
  draftLoading,
  title,
  abstract,
  keywords,
  contributors,
  editorMessage,
  conflictOfInterest,
  reviewers,
  currentStep,
]);

  const handleSubmit = async () => {
  if (!draftId) {
    alert("Submission draft is not available. Please refresh the page and try again.");
    return;
  }

  if (!validateStep(1)) {
    setCurrentStep(1);
    return;
  }

  if (!validateStep(2)) {
    setCurrentStep(2);
    return;
  }

  if (!validateStep(3)) {
    setCurrentStep(3);
    return;
  }

  if (submitting) return;

  try {
    setSubmitting(true);
    setDraftMessage("");

    // Save the latest form data before final submission.
    await updateSubmissionDraft(draftId, {
      title,
      abstract,
      keywords,
      contributors: JSON.stringify(contributors),
      editorMessage,
      conflictOfInterest,
      reviewerSuggestions: JSON.stringify(reviewers),
      currentStep: 6,
      revisionRequestId:
        isRevisionSubmission
          ? revisionRequestId
          : undefined,
    });

    const result = await submitSubmissionDraft(draftId);

    setCompletedSteps([1, 2, 3, 4, 5, 6]);
    setAutoSaveStatus("idle");

   alert(
      isRevisionSubmission
        ? `Revision submitted successfully!\n\nManuscript ID: ${result.manuscriptId}`
        : `Manuscript submitted successfully!\n\nManuscript ID: ${result.manuscriptId}`
    );

    // Temporary navigation after successful submission.
    navigate("/author");
  } catch (error) {
    console.error("Final manuscript submission failed:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to submit manuscript. Please try again.";

    setDraftMessage(message);
    alert(message);
  } finally {
    setSubmitting(false);
  }
  };

  const renderStepHeader = (
    stepNumber: number,
    titleText: string,
    description: string
  ) => (
    <div className="mb-8">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-sm">
          {stepNumber}
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            {titleText}
          </h2>

          <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <>
      {renderStepHeader(
        1,
        isRevisionSubmission
          ? "Manuscript Details"
          : "Manuscript Details",
        isRevisionSubmission
          ? "Review the existing manuscript information before submitting your revision."
          : "Provide the basic information about your manuscript."
      )}

      <div className="flex w-full min-w-0 flex-col gap-6">
        <div className="w-full min-w-0">
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
            Manuscript Title
            <span className="ml-1 text-red-500">*</span>
          </label>

          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={isRevisionSubmission}
            placeholder="Enter the complete manuscript title"
            className="block box-border w-full min-w-0 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-300"
          />
        </div>

        <div className="w-full min-w-0">
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
            Keywords
            <span className="ml-1 text-red-500">*</span>
          </label>

          <input
            type="text"
            value={keywords}
            onChange={(event) => setKeywords(event.target.value)}
            disabled={isRevisionSubmission}
            placeholder="e.g. graph theory, domination, algorithms"
            className="block box-border w-full min-w-0 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-300"
          />

          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Separate multiple keywords using commas.
          </p>
        </div>

        <div className="w-full min-w-0">
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
            Abstract
            <span className="ml-1 text-red-500">*</span>
          </label>

          <textarea
            rows={9}
            value={abstract}
            onChange={(event) => setAbstract(event.target.value)}
            disabled={isRevisionSubmission}
            placeholder="Enter the manuscript abstract..."
            className="block box-border min-h-[220px] w-full min-w-0 resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-300"
          />

          <div className="mt-2 flex justify-end text-xs text-gray-500 dark:text-gray-400">
            {abstract.length} characters
          </div>
        </div> 
      </div>
    </>
  );

  const renderFilesStep = () => (
    <>
      {renderStepHeader(
        2,
        isRevisionSubmission
          ? "Upload Revised Manuscript"
          : "Upload Files",
        isRevisionSubmission
          ? "Upload the revised version of your manuscript."
          : "Upload the main manuscript and any supplementary material."
      )}

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
            Main Manuscript
            <span className="ml-1 text-red-500">*</span>
          </label>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50/50 dark:border-gray-700 dark:bg-gray-950 dark:hover:border-blue-700 dark:hover:bg-blue-950/20">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl dark:bg-blue-950">
              📄
            </div>

            <p className="text-sm font-semibold text-gray-800 dark:text-white">
              {isRevisionSubmission
                ? "Click to upload revised manuscript"
                : "Click to upload manuscript"}
            </p>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              PDF, DOC, DOCX • Maximum file size 20 MB
            </p>

            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={async (event) => {
              const file = event.target.files?.[0] || null;

              setMainFile(file);

              if (!file || !draftId) return;

              try {
                setUploadingFiles(true);
                setDraftMessage("");

                const result = await uploadSubmissionFiles(
                  draftId,
                  file,
                  null
                );

                setSavedMainFilePath(
                  result.draft.mainFilePath || null
                );

                setSavedMainFileName(
                  result.draft.mainFileName || file.name
                );

                setDraftMessage("Main manuscript uploaded successfully.");

              } catch (error) {
                console.error("Failed to upload main manuscript:", error);

                setDraftMessage(
                  error instanceof Error
                    ? error.message
                    : "Unable to upload main manuscript."
                );
              } finally {
                setUploadingFiles(false);
              }
            }}
            />

           {savedMainFilePath && !mainFile && (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left dark:border-emerald-900 dark:bg-emerald-950/30">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Saved manuscript
                </p>

                <p className="mt-1 break-all text-sm font-medium text-emerald-900 dark:text-emerald-300">
                  {savedMainFileName ||
                    savedMainFilePath.split("/").pop()}
                </p>
              </div>
            )}

              {uploadingFiles && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Uploading file...
                </p>
              )}

          </label>

          {mainFile && (
            <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950/30">
              <div className="flex items-center gap-3">
                <span className="text-lg">✓</span>

                <div>
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                    {mainFile.name}
                  </p>

                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    {(mainFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMainFile(null)}
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
            Supplementary File
            <span className="ml-2 text-xs font-normal text-gray-400">
              Optional
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-gray-300 bg-white px-5 py-5 transition hover:border-blue-400 dark:border-gray-700 dark:bg-gray-950">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
              📎
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                Add supplementary material
              </p>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Figures, datasets, appendices or other supporting files.
              </p>
            </div>

            <input
              type="file"
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0] || null;

                setSupplementaryFile(file);

                if (!file || !draftId) return;

                try {
                  setUploadingFiles(true);
                  setDraftMessage("");

                 const result = await uploadSubmissionFiles(
                    draftId,
                    null,
                    file
                  );

                  setSavedSupplementaryFilePath(
                    result.draft.supplementaryFilePath || null
                  );

                  setSavedSupplementaryFileName(
                    result.draft.supplementaryFileName || file.name
                  );

                  setDraftMessage("Supplementary file uploaded successfully.");
                } catch (error) {
                  console.error(
                    "Failed to upload supplementary file:",
                    error
                  );

                  setDraftMessage(
                    error instanceof Error
                      ? error.message
                      : "Unable to upload supplementary file."
                  );
                } finally {
                  setUploadingFiles(false);
                }
              }}
            />
           {savedSupplementaryFilePath && !supplementaryFile && (
            <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left dark:border-gray-700 dark:bg-gray-900">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                Saved supplementary file
              </p>

              <p className="mt-1 break-all text-sm font-medium text-gray-900 dark:text-white">
                {savedSupplementaryFileName ||
                  savedSupplementaryFilePath.split("/").pop()}
              </p>
            </div>
          )}
          </label>

          {supplementaryFile && (
            <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between gap-4">
                <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                  {supplementaryFile.name}
                </span>

                <button
                  type="button"
                  onClick={() => setSupplementaryFile(null)}
                  className="shrink-0 text-xs font-semibold text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
         <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
            {isRevisionSubmission
              ? "Revision file preparation"
              : "File preparation"}
          </p>

          <p className="mt-1 text-xs leading-5 text-blue-700 dark:text-blue-400">
            {isRevisionSubmission
              ? "Please upload the corrected version of your manuscript and ensure that all requested revisions have been addressed."
              : "Please ensure that the manuscript is complete and follows the journal's submission guidelines before continuing."}
          </p>
        </div>
      </div>
    </>
  );

  const renderContributorsStep = () => (
    <>
      {renderStepHeader(
        3,
        "Contributors",
        "Add all authors and contributors associated with this manuscript."
      )}

      <div className="space-y-5">
        {contributors.map((contributor, index) => (
          <div
            key={contributor.id}
            className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  Contributor {index + 1}
                </p>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Author information
                </p>
              </div>

              {contributors.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeContributor(contributor.id)}
                  disabled={isRevisionSubmission}
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-200">
                  Full Name *
                </label>

                <input
                  type="text"
                  value={contributor.name}
                  onChange={(event) =>
                    updateContributor(
                      contributor.id,
                      "name",
                      event.target.value
                    )
                  }
                  disabled={isRevisionSubmission}
                  placeholder="Full name"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-200">
                  Email *
                </label>

                <input
                  type="email"
                  value={contributor.email}
                  onChange={(event) =>
                    updateContributor(
                      contributor.id,
                      "email",
                      event.target.value
                    )
                  }
                  placeholder="author@example.com"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-200">
                  Affiliation
                </label>

                <input
                  type="text"
                  value={contributor.affiliation}
                  onChange={(event) =>
                    updateContributor(
                      contributor.id,
                      "affiliation",
                      event.target.value
                    )
                  }
                  placeholder="University / Institution"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-200">
                  Role
                </label>

                <select
                  value={contributor.role}
                  onChange={(event) =>
                    updateContributor(
                      contributor.id,
                      "role",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option>Author</option>
                  <option>Corresponding Author</option>
                  <option>Co-author</option>
                </select>
              </div>
            </div>
          </div>
        ))}

       <button
          type="button"
          onClick={addContributor}
          disabled={isRevisionSubmission}
          className="w-full rounded-xl border-2 border-dashed border-gray-300 px-4 py-4 text-sm font-semibold text-gray-600 transition hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-400"
        >
          + Add Another Contributor
        </button>
      </div>
    </>
  );

  const renderEditorStep = () => (
    <>
      {renderStepHeader(
        4,
        "For the Editor",
        "Provide confidential information or a message intended for the editor."
      )}

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
            Message to the Editor
          </label>

          <textarea
            rows={8}
            value={editorMessage}
            onChange={(event) =>
              setEditorMessage(event.target.value)
            }
            placeholder="Write any important information you would like the editor to know..."
            className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:ring-blue-950"
          />

          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            This message will be visible to the editorial team.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
            Conflict of Interest
          </label>

          <textarea
            rows={6}
            value={conflictOfInterest}
            onChange={(event) =>
              setConflictOfInterest(event.target.value)
            }
            placeholder="Please declare any potential conflict of interest, or write 'None'."
            className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:ring-blue-950"
          />
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Confidential information
          </p>

          <p className="mt-1 text-xs leading-5 text-amber-700 dark:text-amber-400">
            Information entered in this section should be intended only
            for the editorial team.
          </p>
        </div>
      </div>
    </>
  );

  const renderReviewersStep = () => (
    <>
      {renderStepHeader(
        5,
        "Reviewer Suggestions",
        "Suggest qualified reviewers who may be suitable for evaluating your manuscript."
      )}

      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
        <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
          Reviewer suggestions are recommendations only
        </p>

        <p className="mt-1 text-xs leading-5 text-blue-700 dark:text-blue-400">
          The editorial team will independently select reviewers and may
          choose not to use the suggested reviewers.
        </p>
      </div>

      <div className="space-y-5">
        {reviewers.map((reviewer, index) => (
          <div
            key={reviewer.id}
            className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  Suggested Reviewer {index + 1}
                </p>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Reviewer details
                </p>
              </div>

              {reviewers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeReviewer(reviewer.id)}
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-200">
                  Reviewer Name
                </label>

                <input
                  type="text"
                  value={reviewer.name}
                  onChange={(event) =>
                    updateReviewer(
                      reviewer.id,
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Full name"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-200">
                  Email
                </label>

                <input
                  type="email"
                  value={reviewer.email}
                  onChange={(event) =>
                    updateReviewer(
                      reviewer.id,
                      "email",
                      event.target.value
                    )
                  }
                  placeholder="reviewer@example.com"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-200">
                  Affiliation
                </label>

                <input
                  type="text"
                  value={reviewer.affiliation}
                  onChange={(event) =>
                    updateReviewer(
                      reviewer.id,
                      "affiliation",
                      event.target.value
                    )
                  }
                  placeholder="University / Institution"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-200">
                  Area of Expertise
                </label>

                <input
                  type="text"
                  value={reviewer.expertise}
                  onChange={(event) =>
                    updateReviewer(
                      reviewer.id,
                      "expertise",
                      event.target.value
                    )
                  }
                  placeholder="e.g. Graph Theory"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addReviewer}
          className="w-full rounded-xl border-2 border-dashed border-gray-300 px-4 py-4 text-sm font-semibold text-gray-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-400"
        >
          + Add Another Reviewer
        </button>
      </div>
    </>
  );

  const renderReviewStep = () => (
    <>
      {renderStepHeader(
        6,
        "Review & Submit",
        "Review the information below before submitting your manuscript."
      )}

      <div className="space-y-5">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Manuscript Details
            </h3>

            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              Edit
            </button>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Title
              </p>

              <p className="mt-1 font-medium text-gray-900 dark:text-white">
                {title || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Keywords
              </p>

              <p className="mt-1 font-medium text-gray-900 dark:text-white">
                {keywords || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Abstract
              </p>

              <p className="mt-1 whitespace-pre-line leading-6 text-gray-700 dark:text-gray-300">
                {abstract || "Not provided"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Files
            </h3>

            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              Edit
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 dark:bg-gray-900">
              <span>📄</span>

              <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Main Manuscript
                </p>

                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {mainFile?.name ||
                    savedMainFileName ||
                    (savedMainFilePath
                      ? savedMainFilePath.split("/").pop()
                      : "Not uploaded")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 dark:bg-gray-900">
              <span>📎</span>

              <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Supplementary File
                </p>

                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                {supplementaryFile?.name ||
                  savedSupplementaryFileName ||
                  (savedSupplementaryFilePath
                    ? savedSupplementaryFilePath.split("/").pop()
                    : "None")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Contributors
            </h3>

            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              Edit
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {contributors.map((contributor) => (
              <div
                key={contributor.id}
                className="flex flex-col gap-1 rounded-xl bg-white px-4 py-3 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {contributor.name || "Unnamed contributor"}
                  </p>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {contributor.email || "No email"}
                  </p>
                </div>

                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {contributor.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Editor Information
            </h3>

            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              Edit
            </button>
          </div>

          <div className="mt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Message to Editor
            </p>

            <p className="mt-1 whitespace-pre-line text-sm leading-6 text-gray-700 dark:text-gray-300">
              {editorMessage || "No message provided."}
            </p>
          </div>

          <div className="mt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Conflict of Interest
            </p>

            <p className="mt-1 whitespace-pre-line text-sm leading-6 text-gray-700 dark:text-gray-300">
              {conflictOfInterest || "No declaration provided."}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Reviewer Suggestions
            </h3>

            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              Edit
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {reviewers
              .filter(
                (reviewer) =>
                  reviewer.name.trim() ||
                  reviewer.email.trim()
              )
              .map((reviewer) => (
                <div
                  key={reviewer.id}
                  className="rounded-xl bg-white px-4 py-3 dark:bg-gray-900"
                >
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {reviewer.name || "Unnamed reviewer"}
                  </p>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {reviewer.email || "No email"}
                  </p>

                  {reviewer.expertise && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Expertise: {reviewer.expertise}
                    </p>
                  )}
                </div>
              ))}

            {!reviewers.some(
              (reviewer) =>
                reviewer.name.trim() || reviewer.email.trim()
            ) && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No reviewer suggestions provided.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
              ✓
            </div>

            <div>
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                Ready for submission
              </p>

              <p className="mt-1 text-xs leading-5 text-emerald-700 dark:text-emerald-400">
                Please make sure all information is accurate. Once the
                manuscript is submitted, it will be sent to the editorial
                team for processing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderDetailsStep();

      case 2:
        return renderFilesStep();

      case 3:
        return renderContributorsStep();

      case 4:
        return renderEditorStep();

      case 5:
        return renderReviewersStep();

      case 6:
        return renderReviewStep();

      default:
        return renderDetailsStep();
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950">
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Link
                to="/author"
                className="transition hover:text-blue-600 dark:hover:text-blue-400"
              >
                Author Workspace
              </Link>

              <span>/</span>

            <span>
              {isRevisionSubmission
                ? "Submit Revision"
                : "New Submission"}
            </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              {isRevisionSubmission
                ? "Submit Revision"
                : "New Submission"}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
              {isRevisionSubmission
                ? "Submit the revised version of your manuscript in response to the editor's revision request."
                : "Submit your manuscript through our guided submission process. You can save your progress and return later."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/author")}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              ← Back to Author Dashboard
            </button>

            {autoSaveStatus === "saving" && (
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Saving...
              </span>
            )}

            {autoSaveStatus === "saved" && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                ✓ Saved
              </span>
            )}
          </div>
        </div>

        {/* Stepper */}
        <SubmissionStepper
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={(step) => {
            if (completedSteps.includes(step) || step === currentStep) {
              setCurrentStep(step);
            }
          }}
        />

        {/* Main Form */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-7 lg:p-8">
            {renderCurrentStep()}

            {/* Navigation */}
            <div className="mt-10 flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-600 sm:w-auto"
                  >
                    ← Previous
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate("/author")}
                    className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-600 sm:w-auto"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
               {autoSaveStatus === "saving" && (
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Saving...
                </span>
              )}

               {currentStep === 6 && (
                  <button
                    type="button"
                    onClick={handleSaveSubmission}
                    disabled={draftLoading || savingDraft}
                     className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    {savingDraft ? "Saving..." : "Save Submission"}
                  </button>
                )}

                {currentStep < 6 ? (
                  <button
                    type="button"
                    onClick={goToNextStep}
                    className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    {submitting
                      ? "Submitting..."
                      : isRevisionSubmission
                        ? "Submit Revision"
                        : "Submit Manuscript"}
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Right Sidebar */}
          <aside className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Submission Progress
              </h3>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    Step {currentStep} of 6
                  </span>

                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {Math.round((currentStep / 6) * 100)}%
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-300"
                    style={{
                      width: `${(currentStep / 6) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  "Details",
                  "Upload Files",
                  "Contributors",
                  "For the Editor",
                  "Reviewer Suggestions",
                  "Review & Submit",
                ].map((item, index) => {
                  const step = index + 1;
                  const completed = completedSteps.includes(step);
                  const current = currentStep === step;

                  return (
                    <div
                      key={item}
                      className="flex items-center gap-3"
                    >
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          completed
                            ? "bg-emerald-600 text-white"
                            : current
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                        }`}
                      >
                        {completed ? "✓" : step}
                      </div>

                      <span
                        className={`text-xs font-medium ${
                          completed
                            ? "text-emerald-700 dark:text-emerald-400"
                            : current
                              ? "text-blue-700 dark:text-blue-400"
                              : "text-gray-500 dark:text-gray-500"
                        }`}
                      >
                        {item}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg dark:bg-blue-950">
                💾
              </div>

              <h3 className="mt-4 text-sm font-bold text-gray-900 dark:text-white">
                Save Your Progress
              </h3>

              <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                Use Save Draft whenever you want to continue your
                submission later.
              </p>
              
              {draftMessage && (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {draftMessage}
                </span>
              )}
              {currentStep === 6 && (
              <button
                type="button"
                onClick={handleSaveSubmission}
                disabled={draftLoading || savingDraft}
                className="mt-4 w-full rounded-xl border border-blue-200 px-4 py-2.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950/30"
              >
                {savingDraft ? "Saving..." : "Save Submission"}
              </button>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-lg dark:bg-emerald-950">
                ?
              </div>

              <h3 className="mt-4 text-sm font-bold text-gray-900 dark:text-white">
                Need Help?
              </h3>

              <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                Make sure your manuscript follows the journal's
                submission requirements before submitting.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}