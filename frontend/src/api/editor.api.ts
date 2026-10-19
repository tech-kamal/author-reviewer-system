
import { authenticatedApi } from "./authenticatedApi";
import type {
  CreatePaperResponse,
  PapersResponse,
  PaperDetailsResponse,
  Reviewer,
} from "../types/paper.types";

// ============================================
// Shared Types
// ============================================

export type RevisionType =
  | "MAJOR_REVISION"
  | "MINOR_REVISION";

export type RevisionRequestStatus =
  | "SENT"
  | "RECEIVED"
  | "SUBMITTED";

export type ActiveRevisionRequest = {
  id: string;
  revisionType: RevisionType;
  status: RevisionRequestStatus;
};

export type RevisionTrackingItem = {
  id: string;
  revisionType: RevisionType;
  status: RevisionRequestStatus;
  sentAt: string;
  receivedAt: string | null;
  submittedAt: string | null;
  paper: {
    id: string;
    manuscriptId: string | null;
    title: string;
  };
  author: {
    id: string;
    name: string;
    email: string;
  };
};

export type RevisionTrackingResponse = {
  success: boolean;
  count: number;
  revisionRequests: RevisionTrackingItem[];
};

// ============================================
// Get papers created by logged-in editor
// ============================================

export const getMyPapers = async (): Promise<PapersResponse> => {
  const response = await authenticatedApi.get("/editor/papers");
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load papers");
  }

  return result;
};

// ============================================
// Create / Upload new paper
// ============================================

export const createPaper = async (
  formData: FormData
): Promise<CreatePaperResponse> => {
  const response = await fetch(
    "http://localhost:4000/api/editor/papers",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${
          localStorage.getItem("journal_reviewer_token") || ""
        }`,
      },
      body: formData,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to upload paper");
  }

  return result;
};

// ============================================
// Get single paper
// ============================================

export const getPaperById = async (
  paperId: string
): Promise<PaperDetailsResponse> => {
  const response = await authenticatedApi.get(
    `/editor/papers/${paperId}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load paper");
  }

  return result;
};

// ============================================
// Update paper
// ============================================

export const updatePaper = async (
  paperId: string,
  formData: FormData
) => {
  const response = await authenticatedApi.patch(
    `/editor/papers/${paperId}`,
    formData
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to update paper");
  }

  return result;
};

// ============================================
// Delete paper
// ============================================

export const deletePaper = async (paperId: string) => {
  const response = await authenticatedApi.delete(
    `/editor/papers/${paperId}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to delete paper");
  }

  return result;
};

// ============================================
// Get all reviewers
// ============================================

export const getReviewers = async (): Promise<{
  reviewers: Reviewer[];
}> => {
  const response = await authenticatedApi.get("/editor/reviewers");
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load reviewers");
  }

  return result;
};

// ============================================
// Create review request
// ============================================

export const createReviewRequest = async (
  paperId: string,
  reviewerId: string,
  dueDate?: string
) => {
  const response = await authenticatedApi.post(
    "/editor/review-requests",
    {
      paperId,
      reviewerId,
      dueDate: dueDate || undefined,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to create review request"
    );
  }

  return result;
};

// ============================================
// Get submitted reviews for a paper
// ============================================

export const getPaperReviews = async (paperId: string) => {
  const response = await authenticatedApi.get(
    `/editor/papers/${paperId}/reviews`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to load paper reviews"
    );
  }

  return result;
};

// ============================================
// Get single review details
// ============================================

export const getReviewDetails = async (
  reviewRequestId: string
) => {
  const response = await authenticatedApi.get(
    `/editor/review-requests/${reviewRequestId}/review`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to load review details"
    );
  }

  return result;
};

// ============================================
// Make final editorial decision
// ============================================

export const makeFinalDecision = async (
  paperId: string,
  decision: string
) => {
  const response = await authenticatedApi.patch(
    `/editor/papers/${paperId}/decision`,
    { decision }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to make final decision"
    );
  }

  return result;
};

// ============================================
// Get withdrawal requests
// ============================================

export const getWithdrawalRequests = async () => {
  const response = await authenticatedApi.get(
    "/editor/withdrawals"
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to load withdrawal requests"
    );
  }

  return result;
};

// ============================================
// Decide withdrawal request
// ============================================

export const decideWithdrawalRequest = async (
  requestId: string,
  decision: "APPROVED" | "REJECTED",
  comment: string
) => {
  const response = await authenticatedApi.patch(
    `/editor/withdrawals/${requestId}/decision`,
    {
      decision,
      comment,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to process withdrawal request"
    );
  }

  return result;
};

// ============================================
// Get revision data for a paper
// Used by Editor before sending Major/Minor Revision
// ============================================

export const getRevisionData = async (paperId: string) => {
  const response = await authenticatedApi.get(
    `/editor/papers/${paperId}/revision-data`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to load revision data"
    );
  }

  // The backend should include activeRevisionRequest
  // in this response for persistent revision status.
  return result;
};

// ============================================
// Send Major / Minor Revision to Author
// ============================================

export const sendRevisionToAuthor = async (
  paperId: string,
  reviewRequestId: string,
  revisionType: RevisionType,
  reviewReport: string,
  commentsToAuthor: string,
  revisionAttachment?: File | null
) => {
  const formData = new FormData();

  formData.append("reviewRequestId", reviewRequestId);
  formData.append("revisionType", revisionType);
  formData.append("reviewReport", reviewReport);
  formData.append("commentsToAuthor", commentsToAuthor);

  if (revisionAttachment) {
    formData.append("revisionAttachment", revisionAttachment);
  }

  const response = await authenticatedApi.post(
    `/editor/papers/${paperId}/revision-request`,
    formData
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to send revision to author"
    );
  }

  return result;
};

// ============================================
// Get revision tracking for the editor
// ============================================

export const getRevisionTracking =
  async (): Promise<RevisionTrackingResponse> => {
    const response = await authenticatedApi.get(
      "/editor/revision-requests/tracking"
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Failed to load revision tracking"
      );
    }

    return result;
  };

// ============================================
// Send revision reminder email to author
// ============================================

export const sendRevisionReminder = async (
  revisionRequestId: string
) => {
  const response = await authenticatedApi.post(
    `/editor/revision-requests/${revisionRequestId}/reminder`,
    {}
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to send revision reminder"
    );
  }

  return result;
};
