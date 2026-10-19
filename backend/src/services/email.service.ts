import nodemailer from "nodemailer";

// ============================================
// SMTP Transporter
// ============================================

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// ============================================
// Reviewer Invitation Email
// ============================================

interface ReviewerInvitationEmailData {
  reviewerName: string;
  reviewerEmail: string;
  editorName: string;
  manuscriptId?: string | null;
  authors?: string | null;
  paperTitle: string;
  dueDate: Date | null;
  token: string;
}

// ============================================
// Send Reviewer Invitation
// ============================================

export const sendReviewerInvitationEmail = async ({
  reviewerName,
  reviewerEmail,
  editorName,
  manuscriptId,
  authors,
  paperTitle,
  dueDate,
  token,
}: ReviewerInvitationEmailData) => {
  const frontendUrl =
    process.env.FRONTEND_URL || "http://localhost:5173";

  const acceptUrl =
    `${frontendUrl}/review/invitation/${token}/accept`;

  const declineUrl =
    `${frontendUrl}/review/invitation/${token}/decline`;


  const formattedDueDate = dueDate
    ? dueDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Not specified";
 // ============================================
  // Format Authors for Email
  // ============================================

  let formattedAuthors = "Not available";
  let formattedAuthorsHtml = "Not available";

  if (authors) {
    try {
      const parsedAuthors = JSON.parse(authors);

      if (Array.isArray(parsedAuthors)) {
        const authorList = parsedAuthors
          .filter(
            (author) =>
              author &&
              typeof author === "object" &&
              typeof author.name === "string"
          )
          .map((author) => {
            const name = author.name.trim();

            const role =
              typeof author.role === "string"
                ? author.role.trim()
                : "";

            const affiliation =
              typeof author.affiliation === "string"
                ? author.affiliation.trim()
                : "";

            return {
              name,
              role,
              affiliation,
            };
          });

        if (authorList.length > 0) {
          // Plain text version
          formattedAuthors = authorList
            .map((author, index) => {
              let line = `${index + 1}. ${author.name}`;

              if (author.role) {
                line += ` — ${author.role}`;
              }

              if (author.affiliation) {
                line += `\n   ${author.affiliation}`;
              }

              return line;
            })
            .join("\n\n");

          // HTML version
          formattedAuthorsHtml = authorList
            .map((author, index) => {
              let html = `
                <div style="
                  margin-bottom: 14px;
                  padding-bottom: 10px;
                  border-bottom: 1px solid #e5e7eb;
                ">
                  <div style="
                    color: #111827;
                    font-size: 16px;
                    font-weight: bold;
                    line-height: 1.5;
                  ">
                    ${index + 1}. ${author.name}
                  </div>
              `;

              if (author.role) {
                html += `
                  <div style="
                    margin-top: 3px;
                    color: #374151;
                    font-size: 14px;
                    font-weight: normal;
                  ">
                    ${author.role}
                  </div>
                `;
              }

              if (author.affiliation) {
                html += `
                  <div style="
                    margin-top: 3px;
                    color: #6b7280;
                    font-size: 13px;
                    font-weight: normal;
                    line-height: 1.5;
                  ">
                    ${author.affiliation}
                  </div>
                `;
              }

              html += `</div>`;

              return html;
            })
            .join("");
        }
      }
    } catch (error) {
      console.error(
        "Failed to parse authors:",
        error
      );

      // Fallback
      formattedAuthors = authors;
      formattedAuthorsHtml = authors;
    }
  }

  const mailFrom =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER;

  await transporter.sendMail({
    from: mailFrom,

    to: reviewerEmail,

    subject: `Review Invitation: ${paperTitle}`,

    text: `
Dear ${reviewerName},

You have been invited by ${editorName} to review the following research paper:

Manuscript ID:
${manuscriptId || "Not available"}

Author(s):
${formattedAuthors}

Paper Title:
${paperTitle}

Due Date:
${formattedDueDate}

Please choose one of the following options:

Accept:
${acceptUrl}

Decline:
${declineUrl}

Thank you.

Journal Reviewer System
`,

    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Review Invitation</title>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background: #f3f4f6;
    font-family: Arial, Helvetica, sans-serif;
  "
>
  <div
    style="
      max-width: 650px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
    "
  >

    <!-- Header -->

    <div
      style="
        background: #111827;
        padding: 28px;
        text-align: center;
      "
    >
      <h1
        style="
          margin: 0;
          color: #ffffff;
          font-size: 24px;
        "
      >
        Journal Reviewer System
      </h1>

      <p
        style="
          margin: 8px 0 0;
          color: #d1d5db;
          font-size: 14px;
        "
      >
        Reviewer Invitation
      </p>
    </div>

    <!-- Content -->

    <div style="padding: 32px;">

      <h2
        style="
          margin-top: 0;
          color: #111827;
          font-size: 22px;
        "
      >
        Review Invitation
      </h2>

      <p
        style="
          color: #374151;
          font-size: 16px;
          line-height: 1.6;
        "
      >
        Dear <strong>${reviewerName}</strong>,
      </p>

      <p
        style="
          color: #374151;
          font-size: 16px;
          line-height: 1.6;
        "
      >
        You have been invited by
        <strong>${editorName}</strong>
        to review the following research paper.
      </p>

      <!-- Paper Details -->

      <div
        style="
          margin: 24px 0;
          padding: 20px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        "
      >

      <p
        style="
          margin: 0 0 10px;
          color: #6b7280;
          font-size: 13px;
          font-weight: bold;
        "
      >
        MANUSCRIPT ID
      </p>

      <p
        style="
          margin: 0 0 18px;
          color: #111827;
          font-size: 16px;
          font-weight: bold;
        "
      >
        ${manuscriptId || "Not available"}
      </p>

      <p
        style="
          margin: 0 0 10px;
          color: #6b7280;
          font-size: 13px;
          font-weight: bold;
        "
      >
        AUTHOR(S)
      </p>

      <div
        style="
          margin: 0 0 18px;
          color: #111827;
          font-size: 16px;
          font-weight: normal;
          line-height: 1.6;
        "
      >
        ${formattedAuthorsHtml}
      </div>

        <p
          style="
            margin: 0 0 10px;
            color: #6b7280;
            font-size: 13px;
            font-weight: bold;
          "
        >
          PAPER TITLE
        </p>

        <p
          style="
            margin: 0 0 18px;
            color: #111827;
            font-size: 18px;
            font-weight: bold;
          "
        >
          ${paperTitle}
        </p>

        <p
          style="
            margin: 0;
            color: #6b7280;
            font-size: 13px;
            font-weight: bold;
          "
        >
          DUE DATE
        </p>

        <p
          style="
            margin: 6px 0 0;
            color: #111827;
            font-size: 16px;
          "
        >
          ${formattedDueDate}
        </p>

      </div>

      <p
        style="
          color: #374151;
          font-size: 16px;
          line-height: 1.6;
        "
      >
        Please select an option below:
      </p>

      <!-- Buttons -->

      <div
        style="
          margin: 30px 0;
          text-align: center;
        "
      >

        <a
          href="${acceptUrl}"
          style="
            display: inline-block;
            margin: 6px;
            padding: 14px 28px;
            background: #16a34a;
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: bold;
          "
        >
          Accept Invitation
        </a>

        <a
          href="${declineUrl}"
          style="
            display: inline-block;
            margin: 6px;
            padding: 14px 28px;
            background: #dc2626;
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: bold;
          "
        >
          Decline Invitation
        </a>

      </div>

      <p
        style="
          color: #6b7280;
          font-size: 13px;
          line-height: 1.6;
        "
      >
        If you have any questions regarding this invitation,
        please contact the editor.
      </p>

    </div>

    <!-- Footer -->

    <div
      style="
        padding: 20px;
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
        text-align: center;
      "
    >
      <p
        style="
          margin: 0;
          color: #6b7280;
          font-size: 12px;
        "
      >
        Journal Reviewer System
      </p>
    </div>

  </div>
</body>
</html>
`,
  });
};


// ============================================
// Editor Invitation Email
// ============================================

interface EditorInvitationEmailData {
  email: string;
  token: string;
  expiresAt: Date;
}

// ============================================
// Send Editor Invitation
// ============================================

export const sendEditorInvitationEmail = async ({
  email,
  token,
  expiresAt,
}: EditorInvitationEmailData) => {
  const frontendUrl =
    process.env.FRONTEND_URL ||
    "http://localhost:5173";

  const registerUrl =
    `${frontendUrl}/editor/register/${token}`;

  const formattedExpiry =
    expiresAt.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const mailFrom =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER;

  await transporter.sendMail({
    from: mailFrom,

    to: email,

    subject:
      "Invitation to Register as an Editor",

    text: `
Hello,

You have been invited to register as an Editor for the Journal Reviewer System.

Please use the following link to create your Editor account:

${registerUrl}

This invitation will expire on:
${formattedExpiry}

If you did not expect this invitation, you can safely ignore this email.

Thank you.

Journal Reviewer System
`,

    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Editor Invitation</title>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background: #f3f4f6;
    font-family: Arial, Helvetica, sans-serif;
  "
>
  <div
    style="
      max-width: 650px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
    "
  >

    <!-- Header -->

    <div
      style="
        background: #111827;
        padding: 28px;
        text-align: center;
      "
    >
      <h1
        style="
          margin: 0;
          color: #ffffff;
          font-size: 24px;
        "
      >
        Journal Reviewer System
      </h1>

      <p
        style="
          margin: 8px 0 0;
          color: #d1d5db;
          font-size: 14px;
        "
      >
        Editor Invitation
      </p>
    </div>

    <!-- Content -->

    <div style="padding: 32px;">

      <h2
        style="
          margin-top: 0;
          color: #111827;
          font-size: 22px;
        "
      >
        You Are Invited
      </h2>

      <p
        style="
          color: #374151;
          font-size: 16px;
          line-height: 1.6;
        "
      >
        Hello,
      </p>

      <p
        style="
          color: #374151;
          font-size: 16px;
          line-height: 1.6;
        "
      >
        You have been invited to register as an
        <strong>Editor</strong> for the
        Journal Reviewer System.
      </p>

      <!-- Invitation Details -->

      <div
        style="
          margin: 24px 0;
          padding: 20px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        "
      >

        <p
          style="
            margin: 0 0 10px;
            color: #6b7280;
            font-size: 13px;
            font-weight: bold;
          "
        >
          INVITED EMAIL
        </p>

        <p
          style="
            margin: 0 0 18px;
            color: #111827;
            font-size: 16px;
            font-weight: bold;
          "
        >
          ${email}
        </p>

        <p
          style="
            margin: 0;
            color: #6b7280;
            font-size: 13px;
            font-weight: bold;
          "
        >
          INVITATION EXPIRY
        </p>

        <p
          style="
            margin: 6px 0 0;
            color: #111827;
            font-size: 16px;
          "
        >
          ${formattedExpiry}
        </p>

      </div>

      <p
        style="
          color: #374151;
          font-size: 16px;
          line-height: 1.6;
        "
      >
        Click the button below to complete your
        Editor registration.
      </p>

      <!-- Button -->

      <div
        style="
          margin: 30px 0;
          text-align: center;
        "
      >

        <a
          href="${registerUrl}"
          style="
            display: inline-block;
            padding: 14px 28px;
            background: #2563eb;
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: bold;
          "
        >
          Register as Editor
        </a>

      </div>

      <p
        style="
          color: #6b7280;
          font-size: 13px;
          line-height: 1.6;
        "
      >
        This invitation is valid until
        <strong>${formattedExpiry}</strong>.
      </p>

      <p
        style="
          color: #6b7280;
          font-size: 13px;
          line-height: 1.6;
        "
      >
        If you did not expect this invitation,
        you can safely ignore this email.
      </p>

    </div>

    <!-- Footer -->

    <div
      style="
        padding: 20px;
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
        text-align: center;
      "
    >
      <p
        style="
          margin: 0;
          color: #6b7280;
          font-size: 12px;
        "
      >
        Journal Reviewer System
      </p>
    </div>

  </div>
</body>
</html>
`,
  });
};


// ============================================
// Password Reset Email
// ============================================

interface PasswordResetEmailData {
  email: string;
  resetLink: string;
}

export const sendPasswordResetEmail = async ({
  email,
  resetLink,
}: PasswordResetEmailData) => {
  const mailFrom =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER;

  await transporter.sendMail({
    from: mailFrom,
    to: email,

    subject:
      "Reset Your Password - Techno Sky Publications",

    text: `
Hello,

We received a request to reset your password for your Techno Sky Publications account.

Please use the following link to reset your password:

${resetLink}

This password reset link will expire in 15 minutes.

If you did not request a password reset, you can safely ignore this email.

Regards,
Techno Sky Publications
    `.trim(),

    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Reset Your Password</title>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background: #f3f4f6;
    font-family: Arial, Helvetica, sans-serif;
  "
>
  <div
    style="
      max-width: 650px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
    "
  >

    <!-- Header -->

    <div
      style="
        background: #111827;
        padding: 28px;
        text-align: center;
      "
    >
      <h1
        style="
          margin: 0;
          color: #ffffff;
          font-size: 24px;
        "
      >
        Techno Sky Publications
      </h1>

      <p
        style="
          margin: 8px 0 0;
          color: #d1d5db;
          font-size: 14px;
        "
      >
        Password Reset
      </p>
    </div>

    <!-- Content -->

    <div style="padding: 32px;">

      <h2
        style="
          margin-top: 0;
          color: #111827;
          font-size: 22px;
        "
      >
        Reset Your Password
      </h2>

      <p
        style="
          color: #374151;
          font-size: 16px;
          line-height: 1.6;
        "
      >
        Hello,
      </p>

      <p
        style="
          color: #374151;
          font-size: 16px;
          line-height: 1.6;
        "
      >
        We received a request to reset the password
        for your Techno Sky Publications account.
      </p>

      <!-- Button -->

      <div
        style="
          margin: 30px 0;
          text-align: center;
        "
      >
        <a
          href="${resetLink}"
          style="
            display: inline-block;
            padding: 14px 28px;
            background: #2563eb;
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: bold;
          "
        >
          Reset Password
        </a>
      </div>

      <p
        style="
          color: #374151;
          font-size: 14px;
          line-height: 1.6;
        "
      >
        This password reset link will expire in
        <strong>15 minutes</strong>.
      </p>

      <p
        style="
          color: #6b7280;
          font-size: 13px;
          line-height: 1.6;
        "
      >
        If you did not request a password reset,
        you can safely ignore this email.
      </p>

      <p
        style="
          color: #6b7280;
          font-size: 13px;
          line-height: 1.6;
        "
      >
        If the button above does not work, you can
        copy and paste the following link into your browser:
      </p>

      <p
        style="
          word-break: break-all;
          color: #2563eb;
          font-size: 13px;
        "
      >
        ${resetLink}
      </p>

    </div>

    <!-- Footer -->

    <div
      style="
        padding: 20px;
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
        text-align: center;
      "
    >
      <p
        style="
          margin: 0;
          color: #6b7280;
          font-size: 12px;
        "
      >
        Techno Sky Publications
      </p>
    </div>

  </div>
</body>
</html>
`,
  });
};









interface RevisionReminderEmailData {
  authorName: string;
  authorEmail: string;
  manuscriptId?: string | null;
  paperTitle: string;
  revisionType: "MAJOR_REVISION" | "MINOR_REVISION";
}

export const sendRevisionReminderEmail = async ({
  authorName,
  authorEmail,
  manuscriptId,
  paperTitle,
  revisionType,
}: RevisionReminderEmailData) => {
  const mailFrom =
    process.env.SMTP_FROM || process.env.SMTP_USER;

  const revisionLabel =
    revisionType === "MAJOR_REVISION"
      ? "Major Revision"
      : "Minor Revision";

  await transporter.sendMail({
    from: mailFrom,
    to: authorEmail,
    subject: `Reminder: Please Submit Your ${revisionLabel}`,
    text: `
Dear ${authorName || "Author"},

This is a reminder to submit the revised manuscript requested by the editorial office.

Manuscript ID: ${manuscriptId || "Not available"}
Paper Title: ${paperTitle}
Revision Type: ${revisionLabel}

Please log in to the journal submission system and submit your revised manuscript.

If you have already submitted the revised manuscript, please disregard this reminder.

Regards,
Editorial Office
TSP Reviewer System
    `.trim(),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;color:#1f2937;line-height:1.6">
        <h2 style="background:#111827;color:white;padding:20px">
          Revision Submission Reminder
        </h2>
        <p>Dear <strong>${authorName || "Author"}</strong>,</p>
        <p>
          This is a reminder to submit the revised manuscript requested
          by the editorial office.
        </p>
        <div style="background:#f9fafb;padding:18px;border:1px solid #e5e7eb;border-radius:8px">
          <p><strong>Manuscript ID:</strong> ${manuscriptId || "Not available"}</p>
          <p><strong>Paper Title:</strong> ${paperTitle}</p>
          <p><strong>Revision Type:</strong> ${revisionLabel}</p>
        </div>
        <p>Please log in to the journal submission system and submit your revised manuscript.</p>
        <p>If you have already submitted it, please disregard this reminder.</p>
        <p>Regards,<br/>Editorial Office<br/>TSP Reviewer System</p>
      </div>
    `,
  });
};

















// ============================================
// Verify SMTP Connection
// ============================================

export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();

    console.log(
      "========== EMAIL SERVER READY =========="
    );

    return true;
  } catch (error) {
    console.error(
      "========== EMAIL SERVER ERROR =========="
    );

    console.error(error);

    return false;
  }
};