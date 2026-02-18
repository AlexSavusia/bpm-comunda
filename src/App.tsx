import {Route, Routes} from "react-router";
import MainLayout from "./layout/MainLayout.tsx";
import IndexPage from "./pages";

function App() {
  return (
    <Routes>
        <Route element={<MainLayout />}>
            <Route path="/" element={<IndexPage/>}/>
        </Route>
    </Routes>
  )
}

export default App
