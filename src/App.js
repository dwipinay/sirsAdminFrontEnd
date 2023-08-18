import { BrowserRouter, Route, Routes } from "react-router-dom"
import 'bootstrap/dist/css/bootstrap.min.css'
import Login from "./components/Login/Login"
import NavigationBar from "./components/NavigationBar/NavigationBar"

// User
import FormUbahPassword from "./components/User/FormUbahPassword"
// RL 1.2
import RL12 from "./components/RL12/RL12.js"

// RL 1.3
import RL13 from "./components/RL13/RL13.js"

// RL 3.1
import RL31 from "./components/RL31/RL31"

// RL 3.2
import RL32 from "./components/RL32/RL32.js"

// RL 3.3
import RL33 from "./components/RL33/RL33.js"

// RL 3.6
import RL36 from "./components/RL36/RL36.js";

// RL 3.8
import RL38 from "./components/RL38/RL38"

// RL 3.9
import RL39 from "./components/RL39/RL39.js";

// RL 3.10
import RL310 from "./components/RL310/RL310.js"

// RL 3.11
import RL311 from "./components/RL311/RL311.js"

// RL 3.14
import RL314 from "./components/RL314/RL314.js"

// RL 3.15
import RL315 from "./components/RL315/RL315.js"

// RL 4a
import RL4A from "./components/RL4A/RL4A"

// RL 4a sebab
import RL4ASebab from "./components/RL4ASebab/RL4ASebab"

// RL 4b
import RL4B from "./components/RL4B/RL4B.js"

// RL 4b sebab
import RL4BSebab from "./components/RL4BSebab/RL4BSebab"

// RL 3.4
import RL34 from "./components/RL34/RL34.js"

// RL 3.5
import RL35 from "./components/RL35/RL35.js"

//RL 5.1
import RL51 from "./components/RL51/RL51.js"

//RL 5.2
import RL52 from "./components/RL52/RL52.js"

// RL 5.3
import RL53 from "./components/RL53/RL53.js"

// RL 3.7
import RL37 from "./components/RL37/RL37"


// RL 3.12
import RL312 from "./components/RL312/RL312"


// RL 3.13A
import RL313A from "./components/RL313A/RL313A"


// RL 3.13B
import RL313B from "./components/RL313B/RL313B"


//RL 5.4

import RL54 from "./components/RL54/RL54.js"
function App() {
  return (
    <BrowserRouter basename={'/sirsadmin'}>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/beranda" element={<><NavigationBar/></>} />
        <Route path="/ubahpassword" element={<><NavigationBar/><FormUbahPassword/></>}/>
        <Route path="/rl12" element={<><NavigationBar/><RL12/></>}/>
        <Route path="/rl32" element={<><NavigationBar/><RL32/></>}/>
        <Route path="/rl33" element={<><NavigationBar/><RL33/></>}/>
        <Route path="/rl34" element={<><NavigationBar/><RL34/></>}/>
        <Route path="/rl35" element={<><NavigationBar/><RL35/></>}/>
        <Route path="/rl51" element={<><NavigationBar/><RL51/></>}/>
        <Route path="/rl52" element={<><NavigationBar/><RL52/></>}/>
        <Route path="/rl37" element={<><NavigationBar/><RL37/></>}/>
        <Route path="/rl310" element={<><NavigationBar/><RL310/></>}/>
        <Route path="/rl311" element={<><NavigationBar/><RL311/></>}/>
        <Route path="/rl53" element={<><NavigationBar/><RL53/></>}/>
        <Route path="/rl312" element={<><NavigationBar/><RL312/></>}/>
        <Route path="/rl313A" element={<><NavigationBar/><RL313A/></>}/>
        <Route path="/rl313B" element={<><NavigationBar/><RL313B/></>}/>
        <Route path="/rl314" element={<><NavigationBar/><RL314/></>}/>
        <Route path="/rl315" element={<><NavigationBar/><RL315/></>}/>
        <Route path="/rl54" element={<><NavigationBar/><RL54/></>}/>

        <Route path="/rl13" element={<><NavigationBar/><RL13/></>}/>

        <Route path="/rl31" element={<><NavigationBar/><RL31/></>}/>
        
        <Route path="/rl36" element={<><NavigationBar/><RL36/></>}/>

        <Route path="/rl38" element={<><NavigationBar /><RL38 /></>} />
        <Route path="/rl39" element={<><NavigationBar/><RL39/></>}/>
        <Route path="/rl4a" element={<><NavigationBar /><RL4A /></>} />
        <Route path="/rl4asebab" element={<><NavigationBar /><RL4ASebab /></>} />

        <Route path="/rl4b" element={<><NavigationBar/><RL4B/></>}/>

        <Route path="/rl4bsebab" element={<><NavigationBar/><RL4BSebab/></>}/>

        <Route path="*" element={<PageNotFound />} status={404}/>
      </Routes>
    </BrowserRouter>
  );
}

function PageNotFound() {
  return (
    <div className="container mt-3">
      <h3>404 page not found</h3>
      <p>We are sorry but the page you are looking for does not exist.</p>
    </div>
  );
}

export default App;
