import {
  FaBookOpen,
  FaUsers,
  FaUserEdit,
  FaUserCheck,
  FaFileAlt,
  FaClipboardCheck,
  FaEnvelope,
  FaShieldAlt,
  FaChartLine,
  FaTasks,
  FaSearch,
  FaCheckCircle,
} from "react-icons/fa";

function Services() {
  const services = [
    {
      icon: <FaFileAlt />,
      title: "Manuscript Submission",
      description:
        "A structured manuscript submission process allows authors to submit their research papers with essential information such as title, abstract, keywords, and manuscript files.",
      features: [
        "Research paper submission",
        "Manuscript document upload",
        "Title and abstract management",
        "Keyword management",
        "Centralized submission records",
      ],
    },
    {
      icon: <FaSearch />,
      title: "Manuscript Management",
      description:
        "Editors can organize and manage submitted manuscripts from a centralized workspace throughout the editorial and peer-review process.",
      features: [
        "View submitted manuscripts",
        "Access manuscript details",
        "Monitor review progress",
        "Manage manuscript records",
        "Organized editorial workflow",
      ],
    },
    {
      icon: <FaUsers />,
      title: "Reviewer Management",
      description:
        "The platform provides tools for managing reviewers and connecting suitable reviewers with submitted research manuscripts.",
      features: [
        "Reviewer registration",
        "Reviewer selection",
        "Reviewer assignment",
        "Review history management",
        "Reviewer activity tracking",
      ],
    },
    {
      icon: <FaEnvelope />,
      title: "Reviewer Invitations",
      description:
        "Editors can invite reviewers to evaluate manuscripts through a structured invitation workflow with accept and decline options.",
      features: [
        "Reviewer invitation emails",
        "Accept or decline invitations",
        "Invitation status tracking",
        "Invitation expiry management",
        "Secure invitation links",
      ],
    },
    {
      icon: <FaClipboardCheck />,
      title: "Peer Review Management",
      description:
        "Reviewers can access assigned manuscripts and submit detailed evaluations through a dedicated review workflow.",
      features: [
        "Review assignment access",
        "Review submission",
        "Evaluation management",
        "Review report attachment",
        "Review completion tracking",
      ],
    },
    {
      icon: <FaUserCheck />,
      title: "Reviewer Decision Workflow",
      description:
        "Reviewers can respond to review requests and participate in the evaluation process according to their availability and expertise.",
      features: [
        "Accept review requests",
        "Decline review requests",
        "View assigned papers",
        "Submit completed reviews",
        "View submitted review details",
      ],
    },
    {
      icon: <FaChartLine />,
      title: "Review Progress Tracking",
      description:
        "Editors can monitor the status of reviewer assignments and identify completed, pending, accepted, or declined review activities.",
      features: [
        "Reviewer status monitoring",
        "Review completion tracking",
        "Assignment timestamps",
        "Pending review identification",
        "Centralized progress overview",
      ],
    },
    {
      icon: <FaCheckCircle />,
      title: "Editorial Decision Management",
      description:
        "Editors can evaluate reviewer feedback and make the final editorial decision for submitted manuscripts.",
      features: [
        "Review feedback evaluation",
        "Final editorial decision",
        "Decision management",
        "Manuscript status updates",
        "Centralized decision records",
      ],
    },
    {
      icon: <FaShieldAlt />,
      title: "Secure Document Handling",
      description:
        "Research manuscripts and review-related documents are handled through a controlled platform with role-based access to protect sensitive academic information.",
      features: [
        "Role-based access",
        "Protected manuscript access",
        "Controlled reviewer access",
        "Secure document workflow",
        "Restricted administrative operations",
      ],
    },
    {
      icon: <FaTasks />,
      title: "Role-Based Workflow",
      description:
        "Different users receive access to functionality appropriate to their role, creating a clear separation between administrators, editors, and reviewers.",
      features: [
        "Administrator management",
        "Editor workspace",
        "Reviewer workspace",
        "Protected dashboards",
        "Role-specific operations",
      ],
    },
    {
      icon: <FaBookOpen />,
      title: "Research Paper Tracking",
      description:
        "Authors and editorial users can follow manuscript progress through the different stages of the Techno Sky Publications review workflow.",
      features: [
        "Submission status",
        "Review progress",
        "Editorial processing",
        "Decision status",
        "Centralized paper information",
      ],
    },
    {
      icon: <FaUserEdit />,
      title: "Editorial Collaboration",
      description:
        "The system provides a centralized environment where editors can coordinate manuscripts, reviewers, reviews, and editorial decisions efficiently.",
      features: [
        "Centralized editorial workspace",
        "Reviewer coordination",
        "Review monitoring",
        "Manuscript organization",
        "Decision workflow support",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">

      {/* =====================================================
          HERO SECTION
          ===================================================== */}

      <section className="border-b border-gray-200 bg-[#0b2251] px-6 py-15 dark:border-gray-800 dark:bg-gray-900">
<div className="mx-auto max-w-7xl">
  <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">

    {/* Left Content */}
    <div className="max-w-4xl">

      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
        <FaBookOpen />
        Techno Sky Publications Review Services
      </div>

      <h1 className="text-4xl font-bold tracking-tight text-white dark:text-white sm:text-5xl lg:text-6xl">
        Complete Services for
        <span className="block text-blue-600 dark:text-blue-400">
          Professional Peer Review Workflow
        </span>
      </h1>

      <p className="mt-6 max-w-3xl text-lg leading-8 text-white dark:text-gray-300">
        Our Techno Sky Publications Reviewer System provides an organized digital
        environment for managing manuscript submissions, reviewer
        invitations, peer reviews, editorial workflows, and final
        publication decisions.
      </p>

    </div>

    {/* Right Image */}
    <div className="flex items-center justify-center lg:justify-end">
      <div className="w-[90]" >
        <img
          src="/logo.png"
          alt="Techno Sky Publications Reviewer System"
          className="h-auto w-full object-contain"
        />
      </div>
    </div>

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
                ASIDE / SIDEBAR
                ================================================= */}

            <aside className="lg:sticky lg:top-24 lg:self-start">

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900">

                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Services
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  Explore the major services available across the
                  Techno Sky Publications peer-review workflow.
                </p>

                <nav className="mt-6 space-y-2">

                  <a
                    href="#authors"
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-white hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                  >
                    For Authors
                  </a>

                  <a
                    href="#reviewers"
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-white hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                  >
                    For Reviewers
                  </a>

                  <a
                    href="#editors"
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-white hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                  >
                    For Editors
                  </a>

                  <a
                    href="#workflow"
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-white hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                  >
                    Review Workflow
                  </a>

                  <a
                    href="#security"
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-white hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                  >
                    Security & Access
                  </a>

                </nav>

              </div>

            </aside>


            {/* =================================================
                SERVICES CONTENT
                ================================================= */}

            <div className="space-y-16">


              {/* =================================================
                  FOR AUTHORS
                  ================================================= */}

              <section id="authors" className="scroll-mt-24">

                <div className="mb-8">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                      <FaUserEdit />
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Services for Authors
                      </h2>

                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Tools that support manuscript submission and
                        research paper tracking.
                      </p>
                    </div>

                  </div>

                </div>


                <div className="grid gap-6 md:grid-cols-2">

                  {services.slice(0, 2).map((service) => (
                    <ServiceCard
                      key={service.title}
                      service={service}
                    />
                  ))}

                  <ServiceCard
                    service={services[10]}
                  />

                </div>

              </section>


              {/* =================================================
                  FOR REVIEWERS
                  ================================================= */}

              <section id="reviewers" className="scroll-mt-24">

                <div className="mb-8">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                      <FaUsers />
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Services for Reviewers
                      </h2>

                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        A dedicated workflow for receiving, managing,
                        and completing review assignments.
                      </p>
                    </div>

                  </div>

                </div>


                <div className="grid gap-6 md:grid-cols-2">

                  <ServiceCard
                    service={services[2]}
                  />

                  <ServiceCard
                    service={services[3]}
                  />

                  <ServiceCard
                    service={services[4]}
                  />

                  <ServiceCard
                    service={services[5]}
                  />

                </div>

              </section>


              {/* =================================================
                  FOR EDITORS
                  ================================================= */}

              <section id="editors" className="scroll-mt-24">

                <div className="mb-8">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                      <FaBookOpen />
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Services for Editors
                      </h2>

                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Centralized tools for managing manuscripts,
                        reviewers, and editorial decisions.
                      </p>
                    </div>

                  </div>

                </div>


                <div className="grid gap-6 md:grid-cols-2">

                  <ServiceCard
                    service={services[1]}
                  />

                  <ServiceCard
                    service={services[6]}
                  />

                  <ServiceCard
                    service={services[7]}
                  />

                  <ServiceCard
                    service={services[11]}
                  />

                </div>

              </section>


              {/* =================================================
                  WORKFLOW
                  ================================================= */}

              <section id="workflow" className="scroll-mt-24">

                <div className="mb-8">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
                      <FaTasks />
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Review Workflow Services
                      </h2>

                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Structured services that connect authors,
                        editors, and reviewers.
                      </p>
                    </div>

                  </div>

                </div>


                <div className="grid gap-6 md:grid-cols-2">

                  <ServiceCard
                    service={services[6]}
                  />

                  <ServiceCard
                    service={services[7]}
                  />

                  <ServiceCard
                    service={services[9]}
                  />

                  <ServiceCard
                    service={services[10]}
                  />

                </div>

              </section>


              {/* =================================================
                  SECURITY
                  ================================================= */}

              <section id="security" className="scroll-mt-24">

                <div className="mb-8">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
                      <FaShieldAlt />
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Security & Access Management
                      </h2>

                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Controlled access and role-based functionality
                        for Techno Sky Publications operations.
                      </p>
                    </div>

                  </div>

                </div>


                <div className="grid gap-6 md:grid-cols-2">

                  <ServiceCard
                    service={services[8]}
                  />

                  <ServiceCard
                    service={services[9]}
                  />

                </div>

              </section>


              {/* =================================================
                  CTA
                  ================================================= */}

             <section
                className="
                    rounded-3xl
                    border
                    border-blue-200
                    bg-blue-50
                    p-8
                    shadow-sm
                    transition-colors
                    duration-300
                    dark:border-blue-900
                    dark:bg-gray-900
                    dark:shadow-none
                    sm:p-10
                "
                >
                <div className="max-w-3xl">

                    {/* Heading */}
                    <h2
                    className="
                        text-2xl
                        font-bold
                        text-gray-900
                        transition-colors
                        duration-300
                        dark:text-white
                        sm:text-3xl
                    "
                    >
                    A Structured Platform for Techno Sky Publications Peer Review
                    </h2>

                    {/* Description */}
                    <p
                    className="
                        mt-4
                        leading-7
                        text-gray-600
                        transition-colors
                        duration-300
                        dark:text-gray-300
                    "
                    >
                    From manuscript submission to reviewer assignment,
                    peer review, progress tracking, and final editorial
                    decisions, the system brings the essential Techno Sky Publications
                    review activities into one organized platform.
                    </p>

                    {/* Buttons */}
                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">

                    {/* Access System */}
                    <a
                        href="/login"
                        className="
                        inline-flex
                        items-center
                        justify-center
                        rounded-lg
                        bg-blue-600
                        px-6
                        py-3
                        font-medium
                        text-white
                        shadow-sm
                        transition-all
                        duration-300
                        hover:bg-blue-700
                        hover:shadow-md
                        dark:bg-blue-500
                        dark:hover:bg-blue-600
                        "
                    >
                        Access the System
                    </a>

                    {/* Become Reviewer */}
                    <a
                        href="/register"
                        className="
                        inline-flex
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-gray-300
                        bg-white
                        px-6
                        py-3
                        font-medium
                        text-gray-700
                        shadow-sm
                        transition-all
                        duration-300
                        hover:border-blue-300
                        hover:bg-blue-100
                        hover:text-blue-700
                        dark:border-gray-700
                        dark:bg-gray-800
                        dark:text-gray-200
                        dark:hover:border-blue-600
                        dark:hover:bg-gray-700
                        dark:hover:text-blue-400
                        "
                    >
                        Become a Reviewer
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
   SERVICE CARD COMPONENT
   ========================================================= */

interface ServiceCardProps {
  service: {
    icon: React.ReactNode;
    title: string;
    description: string;
    features: string[];
  };
}

function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">

      {/* Icon */}
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xl text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white dark:bg-gray-800 dark:text-blue-400 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
        {service.icon}
      </div>


      {/* Title */}
      <h3 className="mt-5 text-xl font-semibold text-gray-900 dark:text-white">
        {service.title}
      </h3>


      {/* Description */}
      <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
        {service.description}
      </p>


      {/* Features */}
      <div className="mt-6 border-t border-gray-100 pt-5 dark:border-gray-800">

        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500">
          Included Features
        </p>

        <ul className="space-y-3">

          {service.features.map((feature) => (
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

      </div>

    </article>
  );
}

export default Services;