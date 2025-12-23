import './App.css';
import Home from './components/home';
import Create from './components/create';
import SignIn from './components/signin';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Publicjobform from './components/subcomponents/Publicjobform';
import EvaluationForm from './components/EvaluationForm';
import EvaluationResult from './components/EvaluationResult';
import Analytics from './components/subcomponents/Analytics';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/create' element={<Create />} />
        <Route path='/signin' element={<SignIn />} />
        <Route path='jobs/:jobid' element={<Publicjobform />} />
        <Route path='/evaluate' element={<EvaluationForm />} />
        <Route path='/results/:id' element={<EvaluationResult />} />
        <Route path='/analytics' element={<Analytics />} />
        <Route
          path='/dashboard'
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
