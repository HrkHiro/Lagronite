import React from 'react'

export function Terms() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-4">Lost and Found System User Agreement</h1>
      <p className="text-base mb-4">This agreement explains the rules, responsibilities, and conditions that apply when students and administrators use the Lagronite Lost and Found System.</p>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-3">Purpose</h2>
          <p className="text-base leading-7">The Lost and Found System is designed to help students and school personnel report, search for, and claim lost items in a secure, organized, and honest manner. By using this system, all users agree to follow the rules and responsibilities stated below.</p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">Student User Agreement</h2>
          <ol className="list-decimal pl-6 space-y-2 text-base leading-7">
            <li>Provide accurate and truthful information when reporting a lost or found item.</li>
            <li>Upload only clear and appropriate photos of the item when required.</li>
            <li>Claim only items that genuinely belong to you.</li>
            <li>Cooperate with the verification process by providing proof of ownership when requested.</li>
            <li>Respect the privacy of other users and not misuse their personal information.</li>
            <li>Avoid submitting false reports, duplicate reports, or misleading information.</li>
            <li>Use the system only for its intended purpose and not for personal gain or inappropriate activities.</li>
            <li>Understand that submitting false claims or abusing the system may result in disciplinary action based on school policies.</li>
            <li>Accept that the school reserves the right to deny a claim if sufficient proof of ownership is not provided.</li>
            <li>Follow all school rules and regulations while using the Lost and Found System.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">Administrator User Agreement</h2>
          <ol className="list-decimal pl-6 space-y-2 text-base leading-7">
            <li>Manage all reports fairly, honestly, and without bias.</li>
            <li>Verify lost and found item claims before approving item releases.</li>
            <li>Protect the confidentiality of student information and system records.</li>
            <li>Keep the system updated by reviewing, approving, rejecting, or archiving reports when necessary.</li>
            <li>Ensure that all actions taken within the system follow school policies and procedures.</li>
            <li>Prevent unauthorized access to the system by keeping administrator accounts secure.</li>
            <li>Maintain accurate records of all reported, claimed, and returned items.</li>
            <li>Avoid altering, deleting, or manipulating records without valid authorization.</li>
            <li>Respond to student concerns professionally and respectfully.</li>
            <li>Report any misuse, suspicious activity, or technical issues to the appropriate school authority.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">General Terms and Conditions</h2>
          <ol className="list-decimal pl-6 space-y-2 text-base leading-7">
            <li>All users are responsible for maintaining the confidentiality of their account credentials.</li>
            <li>The Lost and Found System is intended solely for school-related lost and found transactions.</li>
            <li>The school reserves the right to suspend or terminate access for users who violate this agreement.</li>
            <li>The school is not responsible for items that are falsely claimed, unclaimed after the designated holding period, or lost due to inaccurate information provided by users.</li>
            <li>By accessing and using the Lost and Found System, users acknowledge that they have read, understood, and agreed to comply with this User Agreement.</li>
          </ol>
        </div>
      </div>
    </section>
  )
}
