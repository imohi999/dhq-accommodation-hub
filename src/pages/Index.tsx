
const Index = () => {
  console.log("Index component rendering");
  
  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-background"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        padding: "20px"
      }}
    >
      <div className="text-center" style={{ textAlign: "center" }}>
        <h1 
          className="text-4xl font-bold mb-4"
          style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            color: "#000000"
          }}
        >
          Welcome to Your Blank App
        </h1>
        <p 
          className="text-xl text-muted-foreground"
          style={{
            fontSize: "1.25rem",
            color: "#666666"
          }}
        >
          Start building your amazing project here!
        </p>
        <div style={{ marginTop: "20px", fontSize: "14px", color: "#888888" }}>
          Debug: Index component loaded successfully
        </div>
      </div>
    </div>
  );
};

export default Index;
