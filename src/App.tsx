import { useEffect, useState } from "react";
import "./App.css";
import Auth from "./components/Auth";
import TaskManager from "./components/TaskManager";
import { supabase } from "./supabase-client";

function App() {
  const [session, setSession] = useState<any>(null);

  const fetchSession = async () => {
    const currentSession = await supabase.auth.getSession();
    // console.log(currentSession);
    setSession(currentSession.data.session);
  };

  useEffect(() => {
    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0", padding: "1rem" }}>
      {session ? (
        <>
          <button onClick={logout}>Logout</button>
          <TaskManager session={session} />
        </>
      ) : (
        <Auth />
      )}
    </div>
  );
}

export default App;
