import React from "react";

export type SubmissionStep = {
  id: number;
  title: string;
  shortTitle: string;
};

type SubmissionStepperProps = {
  currentStep: number;
  completedSteps?: number[];
  onStepClick?: (step: number) => void;
};

const steps: SubmissionStep[] = [
  {
    id: 1,
    title: "Details",
    shortTitle: "Details",
  },
  {
    id: 2,
    title: "Upload Files",
    shortTitle: "Files",
  },
  {
    id: 3,
    title: "Contributors",
    shortTitle: "Contributors",
  },
  {
    id: 4,
    title: "For the Editor",
    shortTitle: "Editor",
  },
  {
    id: 5,
    title: "Reviewer Suggestions",
    shortTitle: "Reviewers",
  },
  {
    id: 6,
    title: "Review & Submit",
    shortTitle: "Review",
  },
];

export default function SubmissionStepper({
  currentStep,
  completedSteps = [],
  onStepClick,
}: SubmissionStepperProps) {
  return (
    <div className="w-full">
      {/* Desktop / Tablet Stepper */}
      <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:block">
        <div className="flex min-w-[760px] items-start">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;
            const isUpcoming = !isCompleted && !isCurrent;

            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  disabled={isUpcoming || !onStepClick}
                  onClick={() => onStepClick?.(step.id)}
                  className={`group flex min-w-0 flex-1 flex-col items-center ${
                    isUpcoming
                      ? "cursor-default"
                      : "cursor-pointer"
                  }`}
                >
                  {/* Circle */}
                  <div
                    className={[
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all",
                      isCompleted
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "",
                      isCurrent
                        ? "border-blue-600 bg-blue-50 text-blue-700 ring-4 ring-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-950"
                        : "",
                      isUpcoming
                        ? "border-gray-300 bg-white text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500"
                        : "",
                    ].join(" ")}
                  >
                    {isCompleted ? "✓" : step.id}
                  </div>

                  {/* Label */}
                  <span
                    className={[
                      "mt-2 text-center text-xs font-semibold sm:text-sm",
                      isCompleted
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "",
                      isCurrent
                        ? "text-blue-700 dark:text-blue-400"
                        : "",
                      isUpcoming
                        ? "text-gray-400 dark:text-gray-500"
                        : "",
                    ].join(" ")}
                  >
                    {step.title}
                  </span>

                  {/* State */}
                  <span className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                    {isCompleted
                      ? "Completed"
                      : isCurrent
                        ? "Current step"
                        : "Upcoming"}
                  </span>
                </button>

                {/* Connector */}
                {index < steps.length - 1 && (
                  <div className="mt-5 flex w-10 shrink-0 items-center">
                    <div
                      className={`h-0.5 w-full ${
                        completedSteps.includes(step.id)
                          ? "bg-emerald-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Mobile Stepper */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {currentStep}
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Step {currentStep} of {steps.length}
              </p>

              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {steps[currentStep - 1]?.title}
              </p>
            </div>
          </div>

          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {Math.round((currentStep / steps.length) * 100)}%
          </span>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{
              width: `${(currentStep / steps.length) * 100}%`,
            }}
          />
        </div>

        {/* Mobile completed summary */}
        <div className="mt-4 flex flex-wrap gap-2">
          {steps.map((step) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;

            if (!isCompleted && !isCurrent) {
              return null;
            }

            return (
              <span
                key={step.id}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  isCompleted
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                }`}
              >
                {isCompleted ? "✓ " : ""}
                {step.shortTitle}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}