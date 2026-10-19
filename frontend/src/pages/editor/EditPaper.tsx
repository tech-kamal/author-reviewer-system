import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getPaperById, updatePaper } from "../../api/editor.api";

import type { Paper } from "../../types/paper.types";

// interface Paper {
//   id: string;
//   manuscriptId?: string | null;
//   authors?: string | null;
//   title: string;
//   abstract: string;
//   keywords: string;
//   pdfPath?: string | null;
// }

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const FILE_BASE_URL = API_URL.replace(/\/api\/?$/, "");

export default function EditPaper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [paper, setPaper] = useState<Paper | null>(null);

  const [manuscriptId, setManuscriptId] = useState("");
  const [authors, setAuthors] = useState("");
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [keywords, setKeywords] = useState("");
  const [pdf, setPdf] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPaper = async () => {
      if (!id) {
        setError("Paper ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await getPaperById(id);

            const loadedPaper = response.paper;

            setPaper(loadedPaper);

        setManuscriptId(loadedPaper.manuscriptId || "");
        setAuthors(loadedPaper.authors || "");
        setTitle(loadedPaper.title || "");
        setAbstract(loadedPaper.abstract || "");
        setKeywords(loadedPaper.keywords || "");
      } catch (err: any) {
        console.error("Failed to load paper:", err);

        setError(
          err?.response?.data?.message ||
            "Failed to load paper details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPaper();
  }, [id]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!id) {
      setError("Paper ID is missing.");
      return;
    }

    if (!manuscriptId.trim()) {
      setError("Manuscript ID is required.");
      return;
    }

    if (!authors.trim()) {
      setError("Author(s) name is required.");
      return;
    }

    if (!title.trim()) {
      setError("Paper title is required.");
      return;
    }

    if (!abstract.trim()) {
      setError("Abstract is required.");
      return;
    }

    if (!keywords.trim()) {
      setError("Keywords are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const formData = new FormData();

      formData.append(
        "manuscriptId",
        manuscriptId.trim()
      );

      formData.append(
        "authors",
        authors.trim()
      );

      formData.append(
        "title",
        title.trim()
      );

      formData.append(
        "abstract",
        abstract.trim()
      );

      formData.append(
        "keywords",
        keywords.trim()
      );

      if (pdf) {
        formData.append("pdf", pdf);
      }

     await updatePaper(id, formData);

      alert("Paper updated successfully.");

      navigate(`/editor/papers/${id}`);
    } catch (err: any) {
      console.error("Update paper error:", err);

      setError(
        err?.message ||
          "Failed to update paper. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-950">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading paper details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-950">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900 dark:bg-gray-900">
            <p className="font-semibold text-red-600 dark:text-red-400">
              {error || "Paper not found."}
            </p>

            <Link
              to="/editor/papers"
              className="mt-5 inline-block text-sm font-semibold text-blue-600 hover:text-blue-500"
            >
              ← Back to Assignment Papers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/editor/papers"
            className="text-sm font-semibold text-blue-600 transition hover:text-blue-500"
          >
            ← Back to Assignment Papers
          </Link>

          <div className="mt-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Editor
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              Edit Paper
            </h1>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Update the manuscript information and replace the
              PDF if required.
            </p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8"
        >
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Manuscript ID */}
            <div>
              <label
                htmlFor="manuscriptId"
                className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
              >
                Manuscript ID{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                id="manuscriptId"
                type="text"
                value={manuscriptId}
                onChange={(event) =>
                  setManuscriptId(event.target.value)
                }
                placeholder="Enter manuscript ID"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />
            </div>

            {/* Authors */}
            <div>
              <label
                htmlFor="authors"
                className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
              >
                Author(s) Name{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                id="authors"
                type="text"
                value={authors}
                onChange={(event) =>
                  setAuthors(event.target.value)
                }
                placeholder="Enter author name(s)"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />

              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Enter the name(s) of all author(s) of the
                manuscript.
              </p>
            </div>

            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
              >
                Paper Title{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Enter paper title"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />
            </div>

            {/* Abstract */}
            <div>
              <label
                htmlFor="abstract"
                className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
              >
                Abstract{" "}
                <span className="text-red-500">*</span>
              </label>

              <textarea
                id="abstract"
                value={abstract}
                onChange={(event) =>
                  setAbstract(event.target.value)
                }
                placeholder="Enter paper abstract"
                rows={8}
                className="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />
            </div>

            {/* Keywords */}
            <div>
              <label
                htmlFor="keywords"
                className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
              >
                Keywords{" "}
                <span className="text-red-500">*</span>
              </label>

              <textarea
                id="keywords"
                value={keywords}
                onChange={(event) =>
                  setKeywords(event.target.value)
                }
                placeholder="Enter keywords separated by commas"
                rows={4}
                className="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />
            </div>

            {/* Current PDF */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Current PDF
              </p>

              {paper.pdfPath ? (
                <a
                  href={`${FILE_BASE_URL}${paper.pdfPath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm font-semibold text-blue-600 hover:text-blue-500"
                >
                  View Current PDF →
                </a>
              ) : (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  No PDF available.
                </p>
              )}
            </div>

            {/* New PDF */}
            <div>
              <label
                htmlFor="pdf"
                className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
              >
                Replace PDF
              </label>

              <input
                id="pdf"
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) =>
                  setPdf(event.target.files?.[0] || null)
                }
                className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-white text-sm text-gray-700 file:mr-4 file:border-0 file:bg-gray-100 file:px-4 file:py-3 file:text-sm file:font-semibold dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:file:bg-gray-800 dark:file:text-gray-200"
              />

              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Leave empty if you want to keep the current PDF.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>

            <Link
              to={`/editor/papers/${paper.id}`}
              className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}