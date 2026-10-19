import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";


import { createPaper } from "../../api/editor.api";

function UploadPaper() {
  const navigate = useNavigate();
  const [manuscriptId, setManuscriptId] = useState("");
  const [authors, setAuthors] = useState("");
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [keywords, setKeywords] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!manuscriptId.trim()) {
      setError("Manuscript ID is required");
      return;
    }


    if (!authors.trim()) {
      setError("Author(s) name is required");
      return;
    }

    if (!title.trim()) {
      setError("Paper title is required");
      return;
    }

    if (!file) {
      setError("Please select a PDF file");
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must not exceed 10 MB");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("manuscriptId", manuscriptId.trim());
      formData.append("authors", authors.trim());
      formData.append("title", title.trim());
      formData.append("abstract", abstract.trim());
      formData.append("keywords", keywords.trim());
      formData.append("pdf", file);

      const result = await createPaper(formData);

      setSuccess(
        result.message || "Paper uploaded successfully"
      );
      setManuscriptId("");
      setAuthors("");
      setTitle("");
      setAbstract("");
      setKeywords("");
      setFile(null);

      const fileInput = document.getElementById(
        "pdf"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      setTimeout(() => {
        navigate("/editor/papers");
      }, 1000);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to upload paper"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10 dark:bg-gray-950">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Upload New Paper
            </h1>

            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Submit a research paper for review.
            </p>
          </div>

          <Link
            to="/editor/papers"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Back to Papers
          </Link>
        </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

            {/* Manuscript ID */}
            <div>
              <label
                htmlFor="manuscriptId"
                className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
              >
                Manuscript ID <span className="text-red-500">*</span>
              </label>

              <input
                id="manuscriptId"
                type="text"
                value={manuscriptId}
                onChange={(event) =>
                  setManuscriptId(event.target.value)
                }
                placeholder="Enter manuscript ID"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />

              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Enter a unique manuscript identification number.
              </p>
            </div>

            {/* Author(s) Name */}
            <div>
              <label
                htmlFor="authors"
                className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
              >
                Author(s) Name <span className="text-red-500">*</span>
              </label>

              <input
                id="authors"
                type="text"
                value={authors}
                onChange={(event) => setAuthors(event.target.value)}
                placeholder="Enter author name(s)"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />

              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Enter the name(s) of all author(s) of the manuscript.
              </p>
            </div>

            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
              >
                Paper Title
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Enter research paper title"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />
            </div>

            {/* Abstract */}
            <div>
              <label
                htmlFor="abstract"
                className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
              >
                Abstract
              </label>

              <textarea
                id="abstract"
                rows={6}
                value={abstract}
                onChange={(event) =>
                  setAbstract(event.target.value)
                }
                placeholder="Enter paper abstract"
                className="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />
            </div>

            {/* Keywords */}
            <div>
              <label
                htmlFor="keywords"
                className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
              >
                Keywords
              </label>

              <input
                id="keywords"
                type="text"
                value={keywords}
                onChange={(event) =>
                  setKeywords(event.target.value)
                }
                placeholder="e.g. Graph Theory, Algorithms, Networks"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />
            </div>

            {/* PDF */}
            <div>
              <label
                htmlFor="pdf"
                className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
              >
                Research Paper PDF
              </label>

              <input
                id="pdf"
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) => {
                  const selectedFile =
                    event.target.files?.[0] ?? null;

                  setFile(selectedFile);
                }}
                className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-white text-sm text-gray-700 file:mr-4 file:border-0 file:bg-gray-100 file:px-4 file:py-3 file:text-sm file:font-semibold dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:file:bg-gray-800 dark:file:text-gray-200"
              />

              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                PDF only. Maximum file size: 10 MB.
              </p>

              {file && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Selected: {file.name}
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-400">
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Uploading..."
                : "Upload Paper"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UploadPaper;