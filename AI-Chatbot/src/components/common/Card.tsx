import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className = "" }: CardProps) => {
  return (
    <div
      className={`bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-slate-200 ${className}`}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
}

export const CardHeader = ({ icon, title, subtitle }: CardHeaderProps) => {
  return (
    <div className="text-center mb-8">
      {icon && (
        <div className="flex items-center justify-center mb-6">
          <div className="bg-indigo-600 p-4 rounded-xl shadow-lg">{icon}</div>
        </div>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
        {title}
      </h2>
      {subtitle && <p className="text-center text-slate-600">{subtitle}</p>}
    </div>
  );
};

export const CardFooter = ({ children }: { children: ReactNode }) => {
  return <div className="mt-8 text-center">{children}</div>;
};
