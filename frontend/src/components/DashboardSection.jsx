/* eslint-disable react/prop-types */
import "./DashboardSection.css";
const DashboardSection = ({ title, children }) => {
	return (
		<div className="dashboard-section">
			<h3 className="section-title">{title}</h3>
			<div className="section-content">{children}</div>
		</div>
	);
};

export default DashboardSection;
