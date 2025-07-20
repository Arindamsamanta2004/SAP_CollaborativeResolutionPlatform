import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Breadcrumbs, Link, Icon } from '@ui5/webcomponents-react';
import './styles.css';

interface BreadcrumbProps {
  ticketId?: string;
  ticketSubject?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ ticketId, ticketSubject }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Define breadcrumb structure based on current path
  const getBreadcrumbItems = () => {
    const path = location.pathname;
    const items = [];
    
    // Home is always the first item
    items.push({
      text: 'Home',
      path: '/',
      icon: 'home'
    });
    
    if (path.includes('/customer-portal')) {
      items.push({
        text: 'Customer Portal',
        path: '/customer-portal',
        icon: 'customer'
      });
    } else if (path.includes('/lead-dashboard')) {
      items.push({
        text: 'Lead Engineer Dashboard',
        path: '/lead-dashboard',
        icon: 'manager-insight'
      });
    } else if (path.includes('/crp')) {
      items.push({
        text: 'CRP',
        path: '/crp',
        icon: 'collaborate'
      });
      
      // If we're on a specific CRP detail page
      if (ticketId && ticketSubject) {
        items.push({
          text: `${ticketSubject} (${ticketId})`,
          path: `/crp/${ticketId}`,
          icon: 'document-text'
        });
      }
    }
    
    return items;
  };
  
  const breadcrumbItems = getBreadcrumbItems();
  
  return (
    <div className="breadcrumb-container">
      <Breadcrumbs>
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <Link
              key={item.path}
              onClick={() => !isLast && navigate(item.path)}
              className={isLast ? 'breadcrumb-current' : 'breadcrumb-link'}
            >
              <div className="breadcrumb-item">
                <Icon name={item.icon} className="breadcrumb-icon" />
                <span>{item.text}</span>
              </div>
            </Link>
          );
        })}
      </Breadcrumbs>
    </div>
  );
};

export default Breadcrumb;