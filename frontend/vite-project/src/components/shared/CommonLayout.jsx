import Header from "./Header";

const CommonLayout = ({ children }) => {
  return (
    <div>
      {/* Header Component */}
      <Header />
      {/* Header Component */}

      {/* Main Component */}
      {children}
      {/* Main Component */}
    </div>
  );
};

export default CommonLayout;