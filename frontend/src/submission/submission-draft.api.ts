import { api } from "../api/api";


export type SubmissionDraft = {
  id: string;
  authorId: string;
  
  status: "DRAFT" | "SUBMITTED";
  manuscriptId?: string | null;

  revisionRequestId?: string | null;
  
  title?: string | null;
  abstract?: string | null;
  keywords?: string | null;

   mainFilePath?: string | null;
    mainFileName?: string | null;

    supplementaryFilePath?: string | null;
    supplementaryFileName?: string | null;

  contributors?: string | null;

  editorMessage?: string | null;
  conflictOfInterest?: string | null;

  reviewerSuggestions?: string | null;

  currentStep: number;

  createdAt: string;
  updatedAt: string;
};

export type CreateDraftResponse = {
  message: string;
  draft: SubmissionDraft;
};

export type DraftListResponse = {
  drafts: SubmissionDraft[];
};

export type DraftResponse = {
  draft: SubmissionDraft;
};

export type UpdateDraftResponse = {
  message: string;
  draft: SubmissionDraft;
};

/**
 * Create a new submission draft
 */
export const createSubmissionDraft = async (
  revisionRequestId?: string
): Promise<CreateDraftResponse> => {
  const response = await api.post(
    "/author/drafts",
    revisionRequestId
      ? {
          revisionRequestId,
        }
      : undefined
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message ||
        "Failed to create submission draft"
    );
  }

  return response.json();
};

/**
 * Get the latest submission draft of logged-in author
 */
export const getCurrentSubmissionDraft =
  async (): Promise<DraftResponse> => {
    const response = await api.get("/author/drafts/current");

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      throw new Error(
        errorData?.message || "Failed to load current submission draft"
      );
    }

    return response.json();
  };


/**
 * Get all drafts of logged-in author
 */
export const getMySubmissionDrafts =
  async (): Promise<DraftListResponse> => {
    const response = await api.get("/author/drafts");

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      throw new Error(
        errorData?.message || "Failed to load submission drafts"
      );
    }

    return response.json();
  };

/**
 * Get a single submission draft
 */
export const getSubmissionDraft = async (
  id: string
): Promise<DraftResponse> => {
  const response = await api.get(`/author/drafts/${id}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message || "Failed to load submission draft"
    );
  }

  return response.json();
};

/**
 * Save / update submission draft
 */
export const updateSubmissionDraft = async (
  id: string,
  data: Partial<
    Omit<
      SubmissionDraft,
      "id" | "authorId" | "createdAt" | "updatedAt"
    >
  >
): Promise<UpdateDraftResponse> => {
  const response = await api.patch(
    `/author/drafts/${id}`,
    data
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message || "Failed to save submission draft"
    );
  }

  return response.json();
};

/**
 * Delete submission draft
 */
export const deleteSubmissionDraft = async (
  id: string
): Promise<{ message: string }> => {
  const response = await api.delete(`/author/drafts/${id}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message || "Failed to delete submission draft"
    );
  }

  return response.json();
};

export const uploadSubmissionFiles = async (
  draftId: string,
  mainFile?: File | null,
  supplementaryFile?: File | null
): Promise<DraftResponse> => {
  const formData = new FormData();

  if (mainFile) {
    formData.append("mainFile", mainFile);
  }

  if (supplementaryFile) {
    formData.append("supplementaryFile", supplementaryFile);
  }

  const response = await api.post(
    `/author/drafts/${draftId}/files`,
    formData
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message || "Failed to upload submission files"
    );
  }

  return response.json();
};


export const submitSubmissionDraft = async (
  draftId: string
): Promise<{
  message: string;
  manuscriptId: string;
  paper: {
    id: string;
    manuscriptId: string | null;
    title: string;
  };
}> => {
  const response = await api.post(`/author/drafts/${draftId}/submit`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.message || "Failed to submit manuscript"
    );
  }

  return response.json();
};


export const getMySubmissions = async (): Promise<{
  submissions: Array<{
    id: string;
    manuscriptId: string | null;
    title: string;
    abstract: string | null;
    keywords: string | null;
    authors: string | null;
    editorialDecision: string | null;
    decisionAt: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
}> => {
  const response = await api.get("/author/drafts/submissions");

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message || "Failed to load submissions"
    );
  }

  return response.json();
};

export type WithdrawalRequest = {
  id: string;
  paperId: string;
  authorId: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  editorComment?: string | null;
  decidedById?: string | null;
  requestedAt: string;
  decidedAt?: string | null;

  paper: {
    id: string;
    manuscriptId: string | null;
    title: string;
    authors: string | null;
    editorialDecision: string | null;
    decisionAt: string | null;
    withdrawnAt: string | null;
  };

  decidedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export const createWithdrawalRequest = async (
  paperId: string,
  reason: string
): Promise<{
  success: boolean;
  message: string;
  withdrawalRequest: WithdrawalRequest;
}> => {
  const response = await api.post(
    "/author/withdrawals",
    {
      paperId,
      reason,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to submit withdrawal request"
    );
  }

  return result;
};

export const getMyWithdrawalRequests = async (): Promise<{
  success: boolean;
  withdrawalRequests: WithdrawalRequest[];
}> => {
  const response = await api.get(
    "/author/withdrawals"
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to load withdrawal requests"
    );
  }

  return result;
};


export const deleteWithdrawnManuscript = async (
  paperId: string
): Promise<{
  success: boolean;
  message: string;
  paperId: string;
  manuscriptId: string | null;
}> => {
  const response = await api.delete(
    `/author/withdrawals/${paperId}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to delete withdrawn manuscript"
    );
  }

  return result;
};





export type AuthorRevisionRequest = {
  id: string;
  paperId: string;
  authorId: string;
  editorId: string;
  revisionType: "MAJOR_REVISION" | "MINOR_REVISION";
  reviewReport: string;
  commentsToAuthor?: string | null;
  status: "SENT" | "RECEIVED" | "SUBMITTED";

  // PDF attachment
  revisionFilePath?: string | null;
  revisionFileName?: string | null;

  createdAt: string;
  updatedAt: string;
  paper: {
    id: string;
    manuscriptId: string | null;
    title: string;
  };
};

/**
 * Get revision requests for the logged-in author.
 */
export const getMyRevisionRequests = async (): Promise<{
  revisionRequests: AuthorRevisionRequest[];
}> => {
  const response = await api.get(
    "/author/revision-requests"
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message ||
        "Failed to load revision requests"
    );
  }

  return response.json();
};

/**
 * Acknowledge receipt of a revision request.
 */
export const acknowledgeRevisionRequest = async (
  revisionRequestId: string
): Promise<{ message: string; revisionRequest: AuthorRevisionRequest }> => {
  const response = await api.patch(
    `/author/revision-requests/${revisionRequestId}/received`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message ||
        "Failed to acknowledge revision request"
    );
  }

  return response.json();
};