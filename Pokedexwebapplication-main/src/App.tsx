import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import RegisterPage from "./components/RegisterPage";
import Pokedex from "./components/Pokedex";
import PokemonDetail from "./components/PokemonDetail";
import ProfilePage from "./components/ProfilePage";
import PokemonCMS from "./components/PokemonCMS";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/pokedex"
          element={
            <ProtectedRoute>
              <Pokedex />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pokemon/:id"
          element={
            <ProtectedRoute>
              <PokemonDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <PokemonCMS />
            </AdminRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;