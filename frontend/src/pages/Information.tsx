import {
  FaGlobe,
  FaBookOpen,
  // FaUserEdit,
  FaUsers,
  FaUserTie,
  FaClipboardCheck,
  FaShieldAlt,
  FaBalanceScale,
  FaCheckCircle,
  FaArrowRight,
  FaQuestionCircle,
} from "react-icons/fa";

function Information() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">

      {/* =====================================================
          HERO SECTION
          ===================================================== */}

      <section className="border-b border-gray-200 bg-gray-50 px-6 py-15 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl">

          <div className="max-w-4xl">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
              <FaGlobe />
              International Techno Sky Publications Platform
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
              Information About Our
              <span className="block text-blue-600 dark:text-blue-400">
                International Review System
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600 dark:text-gray-300">
              The Techno Sky Publications Reviewer System is designed to provide a
              structured digital environment for managing scholarly
              manuscripts, peer review activities, reviewer assignments,
              editorial evaluation, and final editorial decisions.
            </p>

          </div>

        </div>
      </section>


      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">

          <div className="grid gap-10 lg:grid-cols-[260px_1fr]">

            {/* =================================================
                SIDEBAR
                ================================================= */}

            <aside className="lg:sticky lg:top-24 lg:self-start">

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900">

                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Information
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  Explore the purpose, workflow, participants, and
                  principles of the international Techno Sky Publications review platform.
                </p>

                <nav className="mt-6 space-y-2">

                  <a
                    href="#about"
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-white hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                  >
                    About the System
                  </a>

                  <a
                    href="#international"
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-white hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                  >
                    International Scope
                  </a>

                  {/* <a
                    href="#participants"
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-white hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                  >
                    Participants
                  </a> */}

                  <a
                    href="#process"
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-white hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                  >
                    Review Process
                  </a>

                  <a
                    href="#principles"
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-white hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                  >
                    Core Principles
                  </a>

                  <a
                    href="#faq"
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-white hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                  >
                    Frequently Asked
                  </a>

                </nav>

              </div>

            </aside>


            {/* =================================================
                CONTENT
                ================================================= */}

            <div className="space-y-16">


              {/* =================================================
                  ABOUT
                  ================================================= */}

              <section id="about" className="scroll-mt-24">

                <SectionHeading
                  icon={<FaBookOpen />}
                  title="About the Techno Sky Publications Reviewer System"
                  description="A centralized environment for scholarly manuscript and peer-review management."
                />

                <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm dark:border-gray-800 dark:bg-gray-900">

                  <p className="leading-8 text-gray-600 dark:text-gray-300">
                    The Techno Sky Publications Reviewer System is a web-based platform
                    designed to organize the academic peer-review workflow
                    from manuscript submission through editorial evaluation
                    and final decision-making.
                  </p>

                  <p className="mt-5 leading-8 text-gray-600 dark:text-gray-300">
                    The platform brings authors, reviewers, editors, and
                    administrators into a controlled workflow. Each role
                    receives access to the functions required for its
                    responsibilities, helping maintain an organized and
                    transparent manuscript management process.
                  </p>

                  <p className="mt-5 leading-8 text-gray-600 dark:text-gray-300">
                    By centralizing manuscript information, reviewer
                    invitations, review submissions, review progress, and
                    editorial decisions, the system aims to simplify the
                    administrative aspects of scholarly peer review.
                  </p>

                </div>

              </section>


              {/* =================================================
                  INTERNATIONAL SCOPE
                  ================================================= */}

              <section id="international" className="scroll-mt-24">

                <SectionHeading
                  icon={<FaGlobe />}
                  title="International Scope"
                  description="Designed to support scholarly communication across institutions, disciplines, and geographic regions."
                />

                <div className="grid gap-6 md:grid-cols-2">

                  <InfoCard
                    icon={<FaGlobe />}
                    title="Global Academic Community"
                    text="The platform is designed for an international Techno Sky Publications environment where researchers, reviewers, and editorial teams may participate from different institutions and geographic regions."
                  />

                  <InfoCard
                    icon={<FaUsers />}
                    title="International Reviewer Network"
                    text="Editors can invite appropriate reviewers to evaluate submitted manuscripts and manage reviewer responses through a centralized workflow."
                  />

                  <InfoCard
                    icon={<FaBookOpen />}
                    title="Multidisciplinary Research"
                    text="The system can support Techno Sky Publications workflows involving different areas of scholarly research, subject to the scope and policies of the respective Techno Sky Publications."
                  />

                  <InfoCard
                    icon={<FaUserTie />}
                    title="Professional Editorial Workflow"
                    text="Editorial users can coordinate manuscript processing, reviewer assignments, review progress, and final decisions within a structured environment."
                  />

                </div>

              </section>


              {/* =================================================
                  PARTICIPANTS
                  ================================================= */}

              {/* <section id="participants" className="scroll-mt-24">

                <SectionHeading
                  icon={<FaUsers />}
                  title="Participants in the Review Process"
                  description="The platform separates responsibilities according to the role of each participant."
                />

                <div className="grid gap-6 md:grid-cols-3">

                  <RoleCard
                    icon={<FaUserEdit />}
                    title="Authors"
                    description="Authors submit their research manuscripts and provide the information required for editorial processing."
                    points={[
                      "Submit research manuscripts",
                      "Provide manuscript information",
                      "Follow manuscript progress",
                      "Receive editorial decisions",
                    ]}
                  />

                  <RoleCard
                    icon={<FaUsers />}
                    title="Reviewers"
                    description="Reviewers evaluate manuscripts assigned to them and provide their scholarly assessment to the editorial team."
                    points={[
                      "Receive review invitations",
                      "Accept or decline assignments",
                      "Evaluate assigned manuscripts",
                      "Submit review reports",
                    ]}
                  />

                  <RoleCard
                    icon={<FaUserTie />}
                    title="Editors"
                    description="Editors coordinate manuscript processing, reviewer assignments, review progress, and editorial decisions."
                    points={[
                      "Manage manuscripts",
                      "Invite reviewers",
                      "Monitor review progress",
                      "Make final decisions",
                    ]}
                  />

                </div>

              </section> */}


              {/* =================================================
                  REVIEW PROCESS
                  ================================================= */}

              <section id="process" className="scroll-mt-24">

                <SectionHeading
                  icon={<FaClipboardCheck />}
                  title="Editorial and Peer Review Process"
                  description="A structured workflow connecting manuscript submission, peer review, and editorial decision-making."
                />

                <div className="space-y-4">

                  <ProcessStep
                    number="01"
                    title="Manuscript Submission"
                    text="The manuscript enters the Techno Sky Publications system with essential submission information such as title, abstract, keywords, and the research document."
                  />

                  <ProcessStep
                    number="02"
                    title="Editorial Processing"
                    text="The editorial team accesses the submitted manuscript and manages it through the appropriate stage of the Techno Sky Publications workflow."
                  />

                  <ProcessStep
                    number="03"
                    title="Reviewer Invitation"
                    text="The editor selects suitable reviewers and sends review invitations through the platform."
                  />

                  <ProcessStep
                    number="04"
                    title="Reviewer Response"
                    text="Invited reviewers can accept or decline the review assignment according to their availability and suitability."
                  />

                  <ProcessStep
                    number="05"
                    title="Peer Review"
                    text="Accepted reviewers evaluate the manuscript and submit their review comments, recommendations, and optional supporting documents."
                  />

                  <ProcessStep
                    number="06"
                    title="Review Monitoring"
                    text="Editors can monitor reviewer responses, review progress, submitted reviews, and related timestamps."
                  />

                  <ProcessStep
                    number="07"
                    title="Editorial Decision"
                    text="The editor considers the available review information and records the final editorial decision for the manuscript."
                  />

                </div>

              </section>


              {/* =================================================
                  CORE PRINCIPLES
                  ================================================= */}

              <section id="principles" className="scroll-mt-24">

                <SectionHeading
                  icon={<FaBalanceScale />}
                  title="Core Platform Principles"
                  description="The system is designed around organized, controlled, and role-based scholarly workflow management."
                />

                <div className="grid gap-6 md:grid-cols-2">

                  <PrincipleCard
                    icon={<FaShieldAlt />}
                    title="Confidentiality"
                    text="Manuscript and review information should be accessed only by authorized users according to their assigned responsibilities."
                  />

                  <PrincipleCard
                    icon={<FaCheckCircle />}
                    title="Structured Workflow"
                    text="Each stage of manuscript processing is organized so that authors, reviewers, and editors can perform their respective tasks efficiently."
                  />

                  <PrincipleCard
                    icon={<FaBalanceScale />}
                    title="Editorial Independence"
                    text="Editorial decisions remain part of the responsibility of the authorized editorial team and should be based on the Techno Sky Publications's applicable policies and review information."
                  />

                  <PrincipleCard
                    icon={<FaUsers />}
                    title="Role-Based Access"
                    text="The platform separates administrator, editor, and reviewer functionality to provide controlled access to system operations."
                  />

                  <PrincipleCard
                    icon={<FaClipboardCheck />}
                    title="Review Accountability"
                    text="Review assignments, responses, submitted reviews, and related workflow information can be maintained as part of the review process."
                  />

                  <PrincipleCard
                    icon={<FaGlobe />}
                    title="International Collaboration"
                    text="The system provides a centralized environment for scholarly participants who may work across different institutions and locations."
                  />

                </div>

              </section>


              {/* =================================================
                  SECURITY
                  ================================================= */}

              <section>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 dark:border-gray-800 dark:bg-gray-900">

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                      <FaShieldAlt />
                    </div>

                    <div>

                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Secure and Controlled Access
                      </h2>

                      <p className="mt-4 leading-7 text-gray-600 dark:text-gray-300">
                        Access to Techno Sky Publications operations is organized according
                        to user roles. Administrative functions, editorial
                        operations, reviewer activities, and manuscript
                        information are separated to help maintain a
                        controlled workflow.
                      </p>

                      <p className="mt-4 leading-7 text-gray-600 dark:text-gray-300">
                        The platform is designed to support responsible
                        handling of research manuscripts and review-related
                        information throughout the editorial process.
                      </p>

                    </div>

                  </div>

                </div>

              </section>


              {/* =================================================
                  FAQ
                  ================================================= */}

              <section id="faq" className="scroll-mt-24">

                <SectionHeading
                  icon={<FaQuestionCircle />}
                  title="Frequently Asked Information"
                  description="Common questions about participation in the Techno Sky Publications review workflow."
                />

                <div className="space-y-4">

                  <FaqItem
                    question="Who can submit a manuscript?"
                    answer="Authors who have access to the Techno Sky Publications submission workflow can submit their research manuscripts and provide the required manuscript information."
                  />

                  <FaqItem
                    question="How are reviewers selected?"
                    answer="Reviewers are selected and invited by the authorized editorial team according to the requirements of the manuscript and the Techno Sky Publications's review practices."
                  />

                  <FaqItem
                    question="Can a reviewer decline an invitation?"
                    answer="Yes. An invited reviewer can respond to the review invitation and decline the assignment when they are unavailable or unable to participate."
                  />

                  <FaqItem
                    question="Who makes the final editorial decision?"
                    answer="The final editorial decision is made by the authorized editor responsible for the manuscript, taking the available review information and applicable Techno Sky Publications policies into consideration."
                  />

                  <FaqItem
                    question="Can users access every part of the system?"
                    answer="No. Access is role-based. Administrators, editors, and reviewers have different responsibilities and corresponding system access."
                  />

                </div>

              </section>


              {/* =================================================
                  CTA
                  ================================================= */}

              <section className="rounded-3xl bg-blue-600 p-8 text-white sm:p-10">

                <div className="max-w-3xl">

                  <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">
                    International Scholarly Review
                  </p>

                  <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                    Supporting a More Organized Peer Review Process
                  </h2>

                  <p className="mt-5 leading-7 text-blue-100">
                    The  Techno Sky Publications Reviewer System brings manuscript
                    management, reviewer coordination, peer review,
                    and editorial decision-making together in one
                    structured platform.
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                    <a
                      href="/login"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-blue-600 transition hover:bg-gray-100"
                    >
                      Access the Platform
                      <FaArrowRight />
                    </a>

                    <a
                      href="/register"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
                    >
                      Join as Reviewer
                    </a>

                  </div>

                </div>

              </section>

            </div>

          </div>

        </div>
      </section>

    </main>
  );
}


/* =========================================================
   SECTION HEADING
   ========================================================= */

interface SectionHeadingProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function SectionHeading({
  icon,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="mb-8">

      <div className="flex items-start gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
          {icon}
        </div>

        <div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            {title}
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
            {description}
          </p>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   INFORMATION CARD
   ========================================================= */

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  text: string;
}

function InfoCard({
  icon,
  title,
  text,
}: InfoCardProps) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-lg text-blue-600 dark:bg-blue-950 dark:text-blue-400">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
        {text}
      </p>

    </article>
  );
}


/* =========================================================
   ROLE CARD
   ========================================================= */

// interface RoleCardProps {
//   icon: React.ReactNode;
//   title: string;
//   description: string;
//   points: string[];
// }

// function RoleCard({
//   icon,
//   title,
//   description,
//   points,
// }: RoleCardProps) {
//   return (
//     <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">

//       <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-600 dark:bg-blue-950 dark:text-blue-400">
//         {icon}
//       </div>

//       <h3 className="mt-5 text-xl font-semibold text-gray-900 dark:text-white">
//         {title}
//       </h3>

//       <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
//         {description}
//       </p>

//       <ul className="mt-5 space-y-3">

//         {points.map((point) => (
//           <li
//             key={point}
//             className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300"
//           >
//             <FaCheckCircle className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />

//             <span>
//               {point}
//             </span>
//           </li>
//         ))}

//       </ul>

//     </article>
//   );
// }


/* =========================================================
   PROCESS STEP
   ========================================================= */

interface ProcessStepProps {
  number: string;
  title: string;
  text: string;
}

function ProcessStep({
  number,
  title,
  text,
}: ProcessStepProps) {
  return (
    <article className="flex gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">

      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
        {number}
      </div>

      <div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-400">
          {text}
        </p>

      </div>

    </article>
  );
}


/* =========================================================
   PRINCIPLE CARD
   ========================================================= */

interface PrincipleCardProps {
  icon: React.ReactNode;
  title: string;
  text: string;
}

function PrincipleCard({
  icon,
  title,
  text,
}: PrincipleCardProps) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">

      <div className="flex items-center gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
          {icon}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>

      </div>

      <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-400">
        {text}
      </p>

    </article>
  );
}


/* =========================================================
   FAQ ITEM
   ========================================================= */

interface FaqItemProps {
  question: string;
  answer: string;
}

function FaqItem({
  question,
  answer,
}: FaqItemProps) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">

      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
        {question}
      </h3>

      <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
        {answer}
      </p>

    </article>
  );
}

export default Information;