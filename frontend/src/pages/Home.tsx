
import {
  FaBookOpen,
  FaGlobe,
  FaUsers,
  FaUserEdit,
  FaUserTie,
  FaClipboardCheck,
  FaShieldAlt,
  FaCheckCircle,
  FaArrowRight,
  FaFileAlt,
  FaSearch,
  FaComments,
  FaBalanceScale,
} from "react-icons/fa";

function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-white">

      {/* =====================================================
          HERO SECTION
          ===================================================== */}

      <section className="relative overflow-hidden border-b border-gray-200 bg-gray-50 px-6 py-10 dark:border-gray-800 dark:bg-gray-900 lg:py-15">

        <div className="mx-auto max-w-7xl">

          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* Hero Content */}
            <div>

              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
                <FaGlobe />
                Techno Sky Publications Review Platform
              </div>

              {/* Heading */}
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
                Advancing Techno Sky Publications
                <span className="block text-blue-600 dark:text-blue-400">
                  Research Through Peer Review
                </span>
              </h1>

              {/* Description */}
              <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
                A professional TSP platform for managing research
                manuscripts, reviewer assignments, peer-review activities,
                editorial evaluation, and final publication decisions.
              </p>

              {/* Buttons */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                <a target="_black"
                  href="https://www.technoskypub.com/journal/acm/submit-an-article-manuscript/"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Submit a Manuscript
                  <FaArrowRight />
                </a>

                <a
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-all duration-300 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-blue-600 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                >
                  Become a Reviewer
                </a>

              </div>

              {/* Trust Points */}
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-600 dark:text-gray-400">

                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-blue-600 dark:text-blue-400" />
                  Structured Workflow
                </div>

                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-blue-600 dark:text-blue-400" />
                  Role-Based Access
                </div>

                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-blue-600 dark:text-blue-400" />
                  Peer Review Management
                </div>

              </div>

            </div>


            {/* Hero Visual */}
            <div className="relative">

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-950">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-5 dark:border-gray-800">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                      <FaBookOpen />
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Editorial Workflow
                      </p>

                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Manuscript Review Process
                      </p>
                    </div>

                  </div>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
                    Active
                  </span>

                </div>


                {/* Workflow */}
                <div className="mt-6 space-y-4">

                  <WorkflowItem
                    number="01"
                    title="Manuscript Submitted"
                    status="Completed"
                  />

                  <WorkflowItem
                    number="02"
                    title="Editorial Processing"
                    status="Completed"
                  />

                  <WorkflowItem
                    number="03"
                    title="Reviewer Assignment"
                    status="In Progress"
                  />

                  <WorkflowItem
                    number="04"
                    title="Peer Review"
                    status="Pending"
                  />

                  <WorkflowItem
                    number="05"
                    title="Editorial Decision"
                    status="Pending"
                  />

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          PLATFORM INTRODUCTION
          ===================================================== */}

      <section className="px-6 py-20">

        <div className="mx-auto max-w-4xl text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <FaBookOpen />
          </div>

          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            A Unified Platform for Techno Sky Publications
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-600 dark:text-gray-300">
            The Techno Sky Publications Reviewer System connects authors, reviewers, and editors through a structured and efficient workflow designed to streamline manuscript submission, review, and editorial management while supporting a transparent and organized academic publishing process.
          </p>

        </div>

      </section>


      {/* =====================================================
          HOW IT WORKS
          ===================================================== */}

      <section className="border-y border-gray-200 bg-gray-50 px-6 py-20 dark:border-gray-800 dark:bg-gray-900">

        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              How It Works
            </p>

            <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
             Techno Sky Publications: A Seamless Manuscript Review Journey
            </h2>

            <p className="mt-4 leading-7 text-gray-600 dark:text-gray-300">
              A structured workflow helps manage each important stage
              of the manuscript review process.
            </p>

          </div>


          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-5">

            <StepCard
              number="01"
              icon={<FaFileAlt />}
              title="Submit"
              text="Authors submit their research manuscript and required information."
            />

            <StepCard
              number="02"
              icon={<FaSearch />}
              title="Editorial Review"
              text="Editors process the submitted manuscript and prepare it for review."
            />

            <StepCard
              number="03"
              icon={<FaUsers />}
              title="Reviewer Assignment"
              text="Suitable reviewers are invited to evaluate the manuscript."
            />

            <StepCard
              number="04"
              icon={<FaClipboardCheck />}
              title="Peer Review"
              text="Reviewers evaluate the manuscript and submit their reports."
            />

            <StepCard
              number="05"
              icon={<FaBalanceScale />}
              title="Decision"
              text="The editor considers the review information and makes the final decision."
            />

          </div>

        </div>

      </section>


      {/* =====================================================
          FOR AUTHORS / REVIEWERS / EDITORS
          ===================================================== */}

      <section className="px-6 py-20">

        <div className="mx-auto max-w-7xl">

          <div className="text-center">

            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Techno Sky Publications
            </p>

            <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              One Platform, Multiple Academic Roles
            </h2>

          </div>


          <div className="mt-12 grid gap-6 lg:grid-cols-3">

            {/* Authors */}
            <RoleCard
              icon={<FaUserEdit />}
              title="For Authors"
              description="A structured environment for submitting research manuscripts and following the editorial workflow."
              features={[
                "Submit research manuscripts",
                "Provide manuscript information",
                "Track manuscript progress",
                "Receive editorial decisions",
              ]}
            />

            {/* Reviewers */}
            <RoleCard
              icon={<FaUsers />}
              title="For Reviewers"
              description="A dedicated workspace for receiving review invitations and completing peer-review assignments."
              features={[
                "Receive review invitations",
                "Accept or decline assignments",
                "Access assigned manuscripts",
                "Submit review reports",
              ]}
            />

            {/* Editors */}
            <RoleCard
              icon={<FaUserTie />}
              title="For Editors"
              description="Centralized tools for managing manuscripts, reviewers, reviews, and editorial decisions."
              features={[
                "Manage submitted manuscripts",
                "Invite and manage reviewers",
                "Monitor review progress",
                "Make final editorial decisions",
              ]}
            />

          </div>

        </div>

      </section>


      {/* =====================================================
          WHY CHOOSE
          ===================================================== */}

      <section className="border-y border-gray-200 bg-gray-50 px-6 py-20 dark:border-gray-800 dark:bg-gray-900">

        <div className="mx-auto max-w-7xl">

          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

            {/* Content */}
            <div>

              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Why This Platform
              </p>

              <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                Built Around an Organized Review Workflow
              </h2>

              <p className="mt-5 leading-8 text-gray-600 dark:text-gray-300">
                The platform brings essential TSP review activities
                together so that each participant can focus on their
                specific responsibilities.
              </p>

            </div>


            {/* Feature Cards */}
            <div className="grid gap-4 sm:grid-cols-2">

              <FeatureCard
                icon={<FaShieldAlt />}
                title="Controlled Access"
                text="Role-based access separates administrative, editorial, and reviewer functions."
              />

              <FeatureCard
                icon={<FaClipboardCheck />}
                title="Structured Reviews"
                text="Review assignments and submitted evaluations follow an organized workflow."
              />

              <FeatureCard
                icon={<FaComments />}
                title="Clear Communication"
                text="Reviewer invitations and responses are managed through a centralized process."
              />

              <FeatureCard
                icon={<FaGlobe />}
                title="International Scope"
                text="Designed for Techno Sky Publications collaboration across institutions and geographic regions."
              />

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          PEER REVIEW SECTION
          ===================================================== */}

      <section className="px-6 py-20">

        <div className="mx-auto max-w-7xl">

          <div className="rounded-3xl border border-blue-200 bg-blue-50 p-8 dark:border-blue-900 dark:bg-blue-950/30 sm:p-10 lg:p-12">

            <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-center">

              <div>

                <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Techno Sky Publications
                </p>

                <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                  Supporting a Professional Editorial Environment
                </h2>

                <p className="mt-5 max-w-3xl leading-8 text-gray-600 dark:text-gray-300">
                  From manuscript submission and reviewer selection to
                  review completion and final editorial decisions, the
                  system provides a centralized environment for managing
                  the academic review workflow.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">

                  <a
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    Access the System
                    <FaArrowRight />
                  </a>

                  <a
                    href="/information"
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-all duration-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    Learn More
                  </a>

                </div>

              </div>


              {/* Side Information */}
              <div className="rounded-2xl border border-blue-200 bg-white p-6 dark:border-blue-900 dark:bg-gray-900">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                    <FaShieldAlt />
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Role-Based Platform
                    </p>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Organized access
                    </p>
                  </div>

                </div>

                <div className="mt-6 space-y-3">

                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <FaCheckCircle className="text-blue-600 dark:text-blue-400" />
                    Authors
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <FaCheckCircle className="text-blue-600 dark:text-blue-400" />
                    Reviewers
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <FaCheckCircle className="text-blue-600 dark:text-blue-400" />
                    Editors
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <FaCheckCircle className="text-blue-600 dark:text-blue-400" />
                    Administrators
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FINAL CTA
          ===================================================== */}

      <section className="border-t border-gray-200 bg-gray-900 px-6 py-20 dark:border-gray-800 dark:bg-black">

        <div className="mx-auto max-w-4xl text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white">
            <FaBookOpen />
          </div>

          <h2 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
            Join the Techno Sky Publications Review Community
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-gray-300">
            Whether you are submitting research, contributing as a
            reviewer, or managing the editorial process, the TSP
            Reviewer System provides a structured environment for
            Techno Sky Publications.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

            <a
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:bg-blue-700"
            >
              Access the Platform
              <FaArrowRight />
            </a>

            <a
              href="/register"
              className="inline-flex items-center justify-center rounded-lg border border-gray-700 px-6 py-3 font-medium text-gray-200 transition-all duration-300 hover:bg-gray-800"
            >
              Become a Reviewer
            </a>

          </div>

        </div>

      </section>

    </main>
  );
}


/* =========================================================
   WORKFLOW ITEM
   ========================================================= */

interface WorkflowItemProps {
  number: string;
  title: string;
  status: string;
}

function WorkflowItem({
  number,
  title,
  status,
}: WorkflowItemProps) {
  const completed = status === "Completed";
  const progress = status === "In Progress";

  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800">

      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
          completed
            ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
            : progress
              ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
        }`}
      >
        {number}
      </div>

      <div className="min-w-0 flex-1">

        <p className="font-medium text-gray-900 dark:text-white">
          {title}
        </p>

        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {status}
        </p>

      </div>

      <div
        className={`h-2 w-2 rounded-full ${
          completed
            ? "bg-green-500"
            : progress
              ? "bg-blue-500"
              : "bg-gray-400"
        }`}
      />

    </div>
  );
}


/* =========================================================
   STEP CARD
   ========================================================= */

interface StepCardProps {
  number: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}

function StepCard({
  number,
  icon,
  title,
  text,
}: StepCardProps) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-950">

      <div className="flex items-center justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
          {icon}
        </div>

        <span className="text-sm font-bold text-gray-400 dark:text-gray-600">
          {number}
        </span>

      </div>

      <h3 className="mt-5 text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
        {text}
      </p>

    </article>
  );
}


/* =========================================================
   ROLE CARD
   ========================================================= */

interface RoleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}

function RoleCard({
  icon,
  title,
  description,
  features,
}: RoleCardProps) {
  return (
    <article className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900">

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-600 dark:bg-blue-950 dark:text-blue-400">
        {icon}
      </div>

      <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
        {description}
      </p>

      <ul className="mt-6 space-y-3">

        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300"
          >
            <FaCheckCircle className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />

            <span>
              {feature}
            </span>
          </li>
        ))}

      </ul>

    </article>
  );
}


/* =========================================================
   FEATURE CARD
   ========================================================= */

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  text: string;
}

function FeatureCard({
  icon,
  title,
  text,
}: FeatureCardProps) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">

      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
        {text}
      </p>

    </article>
  );
}

export default Home;