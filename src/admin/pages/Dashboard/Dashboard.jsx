import React, { useMemo } from "react";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { useAuth } from "../../auth/useAuth";
import { MODULES, ROLE_PERMISSIONS, ROLE } from "../../auth/roleConfig";

export default function Dashboard({ basePath = "/admin" }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Ensure we have a valid role, default to SUB_ADMIN if not set
  const role = user?.role || ROLE.SUB_ADMIN;
  const allowedModules = useMemo(() => {
    const permissions = ROLE_PERMISSIONS[role];
    return permissions?.allowedModules || [];
  }, [role]);

  const quickActions = useMemo(() => [
    {
      id: MODULES.NAVIGATION,
      title: "Navigation Management",
      description: "Manage your website navigation menu, dropdowns, and submenus",
      icon: "🧭",
      path: `${basePath}/navigation`,
      color: "blue",
    },
    {
      id: MODULES.HEADER,
      title: "Header Styling",
      description: "Customize your website header: logo, colors, fonts, and styling options",
      icon: "🎨",
      path: `${basePath}/header`,
      color: "indigo",
    },
    {
      id: MODULES.HOME,
      title: "Home Management",
      description: "Manage all home page sections: text, images, videos, alignment, and more",
      icon: "🏠",
      path: `${basePath}/home`,
      color: "green",
    },
    {
      id: MODULES.ABOUT,
      title: "About Management",
      description: "Manage all About Us page sections: text, images, icons, alignment, dimensions, and more",
      icon: "📄",
      path: `${basePath}/about`,
      color: "orange",
    },
    {
      id: MODULES.CONTACT,
      title: "Contact Management",
      description: "Control every detail of your Contact page: text, fonts, images, maps, and layout.",
      icon: "☎️",
      path: `${basePath}/contact`,
      color: "red",
    },
    {
      id: MODULES.CAREERS,
      title: "Careers Management",
      description: "Manage Careers hero, Why Join Us content, job openings, and Join Us form settings.",
      icon: "💼",
      path: `${basePath}/careers`,
      color: "yellow",
    },
    {
      id: MODULES.PRODUCTS,
      title: "Product Management",
      description: "Manage brands, categories, and products. Changes reflect across navbar, product pages, and all related pages.",
      icon: "📦",
      path: `${basePath}/products`,
      color: "purple",
    },
    {
      id: MODULES.BRAND_PAGES,
      title: "Brand Pages Management",
      description: "Create and manage dedicated brand pages. Use templates or import from existing pages.",
      icon: "🏷️",
      path: `${basePath}/brand-pages`,
      color: "teal",
    },
    {
      id: MODULES.FOOTER,
      title: "Footer Management",
      description: "Manage footer: logo, navigation links, contact info, social media, addresses, and styling.",
      icon: "🔽",
      path: `${basePath}/footer`,
      color: "slate",
    },
    {
      id: MODULES.ENQUIRY_FORM,
      title: "Enquiry Form Management",
      description: "Customize the enquiry form in the navbar: edit fields, labels, placeholders, and messages.",
      icon: "📝",
      path: `${basePath}/enquiry-form`,
      color: "pink",
    },
    {
      id: MODULES.USER_MANAGEMENT,
      title: "User Management",
      description: "Create and manage Admin and Sub Admin accounts. Control access and permissions.",
      icon: "👥",
      path: `${basePath}/user-management`,
      color: "indigo",
    },
    {
      id: MODULES.AUDIT_LOGS,
      title: "Audit Logs",
      description: "View login and activity logs. Track user access and system events.",
      icon: "📋",
      path: `${basePath}/audit-logs`,
      color: "slate",
    },
  ], [basePath]);

  const filteredActions = useMemo(() => {
    return quickActions.filter((action) =>
      allowedModules.includes(action.id)
    );
  }, [allowedModules, quickActions]);

  // Show loading state if not authenticated yet
  if (!isAuthenticated) {
    return (
      <AdminLayout currentPage="dashboard" basePath={basePath}>
        <div className="admin-dashboard">
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p className="admin-text">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="dashboard" basePath={basePath}>
      <div className="admin-dashboard" style={{ minHeight: '100vh', backgroundColor: 'var(--admin-bg, #f8fafc)' }}>
        <div className="dashboard-header">
          <h1 className="admin-heading-1">Dashboard</h1>
          <p className="admin-text-sm admin-mt-sm">
            Welcome to your CMS Dashboard. Manage your website content from
            here.
          </p>
        </div>

        <div className="dashboard-quick-actions">
          <h2 className="admin-heading-2 admin-mb-lg">Quick Actions</h2>
          {filteredActions.length === 0 ? (
            <div className="admin-alert admin-alert-info">
              <p>No modules available for your role ({role}).</p>
            </div>
          ) : (
            <div className="quick-actions-grid">
              {filteredActions.map((action, index) => (
                <div
                  key={action.id || index}
                  className={`quick-action-card admin-card action-${action.color}`}
                  onClick={() => navigate(action.path)}
                  style={{ cursor: 'pointer' }}
                >
                  <h3 className="admin-heading-3">{action.title}</h3>
                  <p className="admin-text-sm">{action.description}</p>
                  <button className="admin-btn admin-btn-primary admin-mt-md">
                    Manage →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
