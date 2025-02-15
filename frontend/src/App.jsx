import Chatbot from "./Chatbot"
import { BrowserRouter as Router, Routes,Route } from 'react-router-dom'
import Signup from "./Signup"
import Login from "./Login"
import { useState, useEffect } from "react";

function App() {
  const [items, setItems] = useState([]);
  const [numItems, setNumItems] = useState(0);
  

  useEffect(() => {
    sessionStorage.setItem("NItems",0)
    sessionStorage.setItem("Items",JSON.stringify([]))

  }, []);

  return (
    <Router>
      <Routes>
        <Route path={'/'} exact element ={<Chatbot items={items} setItems={setItems} numItems={numItems} setNumItems={setNumItems} />}/>
        <Route path={'/signup'} exact element ={<Signup />}/>
        <Route path={'/login'} exact element ={<Login />}/>
      </Routes>
    </Router>
  )
}

export default App
