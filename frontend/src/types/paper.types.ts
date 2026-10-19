export interface Reviewer {
  id: string;
  name: string;
  email: string;
}

export interface Review {
  id: string;
  recommendation?: string | null;
  commentsToAuthor: string;
  commentsToEditor?: string | null;
  attachmentPath?: string | null;
  attachmentName?: string | null;
  submittedAt: string;
}

export interface ReviewRequest {
  id: string;
  status: string;
  invitedAt: string;
  acceptedAt?: string | null;
  declinedAt?: string | null;
  dueDate?: string | null;

  reviewer: Reviewer;
  review?: Review | null;
}

export interface Paper {
  id: string;
  manuscriptId?: string | null;
  authors?: string | null;
  title: string;
  abstract?: string | null;
  keywords?: string | null;
  reviewerSuggestions?: string | null;
  pdfPath?: string | null;
  editorialDecision?: string | null;
  decisionAt?: string | null;
  createdAt: string;
  updatedAt: string;
  reviewRequests?: ReviewRequest[];
}

export interface CreatePaperResponse {
  message: string;
  paper: Paper;
}

export interface PapersResponse {
  papers: Paper[];
}

export interface PaperDetailsResponse {
  success: boolean;
  paper: Paper;
}