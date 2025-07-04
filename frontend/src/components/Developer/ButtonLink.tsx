
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type ButtonLinkProps = {
  to: string;
  children: React.ReactNode;
};

const ButtonLink: React.FC<ButtonLinkProps> = ({ to, children }) => (
  <Button asChild size="lg" className="px-6">
    <Link to={to}>{children}</Link>
  </Button>
);

export default ButtonLink;
