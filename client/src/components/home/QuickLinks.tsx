import React from 'react';
import { Link } from 'react-router-dom';

export interface QuickLink {
  to: string;
  title: string;
  description: string;
}

interface Props {
  links: QuickLink[];
}

export const QuickLinks: React.FC<Props> = ({ links }) => (
  <div className="quick-links">
    {links.map((link) => (
      <Link key={link.to} to={link.to} className="quick-link">
        <b>{link.title}</b>
        <span>{link.description}</span>
      </Link>
    ))}
  </div>
);
