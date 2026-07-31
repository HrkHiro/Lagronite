import React from 'react'

export function Privacy() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-base mb-4">This privacy policy describes how the Lagronite Lost and Found System collects, uses, stores, and protects the personal data of students, school personnel, and administrators.</p>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-3">Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2 text-base leading-7">
            <li>Account details such as name, school email, role, and contact information.</li>
            <li>Lost and found reports including item descriptions, locations, dates, and uploaded photos.</li>
            <li>Claim verification information provided to confirm ownership of items.</li>
            <li>Support messages, report comments, and chat messages sent through the system.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">How We Use Your Information</h2>
          <p className="text-base leading-7">We use personal data to operate the Lost and Found System and to provide a safe, reliable environment for reporting, matching, and claiming items.</p>
          <ul className="list-disc pl-6 space-y-2 text-base leading-7">
            <li>Process lost and found reports and support item matching.</li>
            <li>Verify ownership and approve claims through administrators.</li>
            <li>Send notifications or updates related to reports, claims, and account activity.</li>
            <li>Protect the system from unauthorized access, abuse, or misuse.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">Information Sharing</h2>
          <p className="text-base leading-7">Your information is shared only as needed to support school-related lost and found operations.</p>
          <ul className="list-disc pl-6 space-y-2 text-base leading-7">
            <li>Administrators and authorized school staff may access reports and claim information to review and manage cases.</li>
            <li>Personal information is not sold or shared with third parties for marketing purposes.</li>
            <li>Data may be disclosed when required by law or to protect the safety of users and the school community.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">Data Security</h2>
          <p className="text-base leading-7">We take steps to protect personal information through system access controls and secure data handling practices. All users should also safeguard their account credentials and not share passwords with others.</p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">User Responsibilities</h2>
          <ul className="list-disc pl-6 space-y-2 text-base leading-7">
            <li>Keep your login details confidential and report any unauthorized account activity immediately.</li>
            <li>Upload and submit only accurate, truthful information and appropriate item photos.</li>
            <li>Respect the privacy of other users when viewing or handling lost and found reports.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">Acceptance</h2>
          <p className="text-base leading-7">By using the Lagronite Lost and Found System, users acknowledge that they have read and understood this privacy policy and agree to the way their information is collected and used for lost and found operations.</p>
        </div>
      </div>
    </section>
  )
}
