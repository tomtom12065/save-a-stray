import React, { useState } from "react";

const Footer = () => {
	const [modalType, setModalType] = useState(null);

	return (
		<footer className="bg-dark text-light text-center p-3">
			<div className="container">
				<p>
					<span
						className="text-primary footer-link"
						data-bs-toggle="modal"
						data-bs-target="#termsModal"
						onClick={() => setModalType("terms")}
					>
						Terms of Service
					</span>
					{" | "}
					<span
						className="text-primary footer-link"
						data-bs-toggle="modal"
						data-bs-target="#privacyModal"
						onClick={() => setModalType("privacy")}
					>
						Privacy Policy
					</span>
				</p>
			</div>

			{/* Terms of Service Modal */}
			<div
				className="modal fade"
				id="termsModal"
				tabIndex="-1"
				aria-labelledby="termsModalLabel"
				aria-hidden="true"
			>
				<div className="modal-dialog modal-lg">
					<div className="modal-content">
						<div className="modal-header">
							<h5  className="modal-title cursor-pointer" id="termsModalLabel">
								
								Terms of Service
								
							</h5>
							<button
								type="button"
								className="btn-close"
								data-bs-dismiss="modal"
								aria-label="Close"
							></button>
						</div>
						<div className="modal-body">
							{/* Replace this with your Terms of Service component */}
							<p>

								---

								_Last Updated: 2.13.2025_

								Welcome to Save a Stray ("Platform," "we," "our," or "us"). By accessing or using our website, you ("User," "you") agree to these Terms of Service. If you do not agree to these terms, please do not use the Platform.

								Save a Stray is a digital platform designed to facilitate connections between individuals seeking to adopt or rehome pets. **We do not house, care for, or own any of the pets listed on our website. We are not a kennel, rescue organization, or adoption agency.** All pet listings, communications, and transactions are the sole responsibility of the users involved.

								We do not verify the accuracy of pet listings or the backgrounds of adopters and pet owners. All interactions, negotiations, and exchanges of pets or funds are strictly between the involved users. **We do not guarantee the health, behavior, temperament, or breed authenticity of any listed pets.** We are not liable for any disputes, losses, damages, or fraudulent activity resulting from user interactions.

								Users are responsible for conducting their own due diligence before adopting, rehoming, or listing pets. We strongly encourage in-person meetings, vet references, and legal documentation to ensure a safe and ethical adoption process. Additionally, users must ensure that any pet adoption, sale, or rehoming complies with applicable local, state, and federal laws.

								Save a Stray does not endorse any specific pet owners, adopters, shelters, or organizations using the platform. Any views, statements, or actions of users on the platform are their own and do not reflect the views of Save a Stray. Users must comply with all relevant laws and regulations regarding pet ownership, adoption, and transfer. We are not responsible for any legal disputes or regulatory violations resulting from transactions made through the platform.

								User data is collected and stored in accordance with our [Privacy Policy]. We do not sell or distribute user data to third parties without consent. While we take reasonable measures to protect user information, we cannot guarantee absolute security. Payments facilitated through third-party services (e.g., Stripe, PayPal) are not stored by us, and we are not responsible for any payment disputes, chargebacks, or fraudulent transactions between users.

								Users agree not to list stolen, sick, or dangerous animals; engage in deceptive or fraudulent activity; use the platform for illegal or unethical pet trade (e.g., dogfighting, puppy mills, scams); harass, threaten, or harm other users; or post false or misleading information.

								To the fullest extent permitted by law, Save a Stray is not liable for any indirect, incidental, or consequential damages arising from your use of the platform. We do not provide warranties or guarantees of any kind regarding the service. Users agree to indemnify and hold harmless Save a Stray, its owners, employees, and affiliates from any claims, damages, or liabilities arising from their use of the platform.

								We reserve the right to modify these Terms of Service at any time. Continued use of the platform after changes are posted constitutes acceptance of the revised terms. If you have any questions about these terms, please contact us at [Your Contact Information].</p>
						</div>
					</div>
				</div>
			</div>

			{/* Privacy Policy Modal */}
			<div
				className="modal fade"
				id="privacyModal"
				tabIndex="-1"
				aria-labelledby="privacyModalLabel"
				aria-hidden="true"
			>
				<div className="modal-dialog modal-lg">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title" id="privacyModalLabel">
								Privacy Policy
							</h5>
							<button
								type="button"
								className="btn-close"
								data-bs-dismiss="modal"
								aria-label="Close"
							></button>
						</div>
						<div className="modal-body">
							{/* Replace this with your Privacy Policy component */}
							<p>Here’s your **Privacy Policy** in paragraph format for easier readability:

								---

								_Last Updated: 2.13.2025_

								At Save a Stray ("Platform," "we," "our," or "us"), we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform. By accessing or using our website, you agree to the terms of this Privacy Policy.

								We collect personal information that you provide when creating an account, listing a pet, or contacting other users. This may include your name, email address, phone number, location, and any other details necessary for facilitating pet adoption or rehoming. Additionally, we may collect non-personal data such as browser type, IP address, and device information to improve platform functionality and security.

								Your information is used to facilitate pet listings, enable user communication, and improve our services. We may use collected data to verify accounts, provide customer support, enhance user experience, and prevent fraudulent or illegal activities. We do not sell or rent your personal data to third parties. However, we may share information with trusted third-party service providers (e.g., payment processors, hosting providers) when necessary for platform operation.

								We implement reasonable security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no online platform can guarantee absolute security. Users are responsible for safeguarding their login credentials and personal data when interacting with others on the platform.

								Cookies and similar tracking technologies are used to enhance user experience, analyze website traffic, and personalize content. You can adjust cookie preferences in your browser settings, but disabling cookies may affect certain platform functionalities.

								Save a Stray may contain links to third-party websites or services. We are not responsible for their privacy practices, and we encourage users to review their respective privacy policies before sharing personal information.

								Our platform is not intended for users under the age of 18. We do not knowingly collect personal data from minors. If we become aware that a minor has provided personal information, we will take steps to remove it.

								We may update this Privacy Policy periodically. Any changes will be posted on this page, and continued use of the platform after updates constitutes acceptance of the revised policy. If you have any questions or concerns regarding this Privacy Policy, please contact us at [Your Contact Information].</p>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
